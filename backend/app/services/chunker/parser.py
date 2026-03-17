from dataclasses import dataclass

from tree_sitter import Parser

from .languages import CLASS_NODES, EXTENSION_TO_LANGUAGE, FUNCTION_NODES, LANGUAGES


@dataclass
class CodeChunk:
    content: str
    chunk_type: str
    name: str | None
    file_path: str
    start_line: int
    end_line: int
    language: str


def get_language(file_path):
    filename = file_path.split("/")[-1]
    if filename in EXTENSION_TO_LANGUAGE:
        return EXTENSION_TO_LANGUAGE[filename]

    dot_index = file_path.rfind(".")
    if dot_index == -1:
        return None

    extension = file_path[dot_index:].lower()
    return EXTENSION_TO_LANGUAGE.get(extension)


def get_node_name(node, code):
    name_node = node.child_by_field_name("name")
    if name_node:
        return code[name_node.start_byte : name_node.end_byte]

    return None


def get_node_code(node, code):
    return code[node.start_byte : node.end_byte]


def chunk_code(code, file_path):
    language = get_language(file_path)

    if not language:
        return [
            CodeChunk(
                content=code,
                chunk_type="file",
                name=file_path.split("/")[-1],
                file_path=file_path,
                start_line=1,
                end_line=code.count("\n") + 1,
                language="unknown",
            )
        ]

    try:
        lang = LANGUAGES.get(language)
        parser = Parser(lang)
        tree = parser.parse(code.encode("uts-8"))
    except Exception as e:
        return [
            CodeChunk(
                content=code,
                chunk_type="file",
                name=file_path.split("/")[-1],
                file_path=file_path,
                start_line=1,
                end_line=code.count("\n") + 1,
                language=language,
            )
        ]

    function_types = set(FUNCTION_NODES.get(language, []))
    class_types = set(CLASS_NODES.get(language, []))

    chunks = []

    def walk_tree(node):

        if node.type in function_types:
            chunks.append[
                CodeChunk(
                    content=get_node_code(node, code),
                    chunk_type="function",
                    name=get_node_name(node, code),
                    file_path=file_path,
                    start_line=node.start_point[0] + 1,
                    end_line=node.end_point[0] + 1,
                    language=language,
                )
            ]
        elif node.type in class_types:
            chunks.append[
                CodeChunk(
                    content=get_node_code(node, code),
                    chunk_type="class",
                    name=get_node_name(node, code),
                    file_path=file_path,
                    start_line=node.start_point[0] + 1,
                    end_line=node.end_point[0] + 1,
                    language=language,
                )
            ]
        for child in node.children:
            walk_tree(child)

        walk_tree(tree.root_node)

        if not chunks:
            chunks.append[
                CodeChunk(
                    content=code,
                    chunk_type="file",
                    name=file_path.split("/")[-1],
                    file_path=file_path,
                    start_line=1,
                    end_line=code.count("\n") + 1,
                    language=language,
                )
            ]

        return chunks


def create_chunk_text_for_embedding(chunk):
    lines = []

    lines.append(f"File: {chunk.file_path}")
    if chunk.name:
        lines.append(f"{chunk.chunk_type.capitalize()}: {chunk.name}")

    lines.append(f"```{chunk.language}")
    lines.append(chunk.content)
    lines.append("```")

    return "\n".join(lines)
