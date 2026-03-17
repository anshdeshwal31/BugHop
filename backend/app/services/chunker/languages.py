import tree_sitter_bash
import tree_sitter_c
import tree_sitter_c_sharp
import tree_sitter_cpp
import tree_sitter_css
import tree_sitter_dockerfile
import tree_sitter_go
import tree_sitter_html
import tree_sitter_java
import tree_sitter_javascript
import tree_sitter_json
import tree_sitter_markdown
import tree_sitter_php
import tree_sitter_python
import tree_sitter_ruby
import tree_sitter_rust
import tree_sitter_sql
import tree_sitter_toml
import tree_sitter_typescript
import tree_sitter_yaml
from tree_sitter import Language

LANGUAGES = {
    "python": Language(tree_sitter_python.language()),
    "javascript": Language(tree_sitter_javascript.language()),
    "typescript": Language(tree_sitter_typescript.language_typescript()),
    "tsx": Language(tree_sitter_typescript.language_tsx()),
    "go": Language(tree_sitter_go.language()),
    "java": Language(tree_sitter_java.language()),
    "rust": Language(tree_sitter_rust.language()),
    "ruby": Language(tree_sitter_ruby.language()),
    "php": Language(tree_sitter_php.language_php()),
    "c": Language(tree_sitter_c.language()),
    "cpp": Language(tree_sitter_cpp.language()),
    "c_sharp": Language(tree_sitter_c_sharp.language()),
    "html": Language(tree_sitter_html.language()),
    "css": Language(tree_sitter_css.language()),
    "json": Language(tree_sitter_json.language()),
    "yaml": Language(tree_sitter_yaml.language()),
    "toml": Language(tree_sitter_toml.language()),
    "markdown": Language(tree_sitter_markdown.language()),
    "bash": Language(tree_sitter_bash.language()),
    "sql": Language(tree_sitter_sql.language()),
    "dockerfile": Language(tree_sitter_dockerfile.language()),
}


EXTENSION_TO_LANGUAGE = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "tsx",
    ".go": "go",
    ".java": "java",
    ".rs": "rust",
    ".rb": "ruby",
    ".php": "php",
    ".c": "c",
    ".cpp": "cpp",
    ".cc": "cpp",
    ".cxx": "cpp",
    ".h": "c",
    ".hpp": "cpp",
    ".cs": "c_sharp",
    ".html": "html",
    ".htm": "html",
    ".css": "css",
    ".scss": "css",
    ".sass": "css",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".toml": "toml",
    ".md": "markdown",
    ".markdown": "markdown",
    ".sh": "bash",
    ".bash": "bash",
    ".zsh": "bash",
    ".sql": "sql",
    "Dockerfile": "dockerfile",
}

FUNCTION_NODES = {
    "python": ["function_definition"],
    "javascript": [
        "function_declaration",
        "function_expression",
        "arrow_function",
        "method_definition",
    ],
    "typescript": [
        "function_declaration",
        "function_expression",
        "arrow_function",
        "method_definition",
    ],
    "tsx": [
        "function_declaration",
        "function_expression",
        "arrow_function",
        "method_definition",
    ],
    "go": ["function_declaration", "method_declaration"],
    "java": ["method_declaration"],
    "rust": ["function_item"],
    "ruby": ["method"],
    "php": ["function_definition", "method_declaration"],
    "c": ["function_definition"],
    "cpp": ["function_definition"],
    "c_sharp": ["method_declaration"],
    "bash": ["function_definition"],
    "html": [],
    "css": [],
    "json": [],
    "yaml": [],
    "toml": [],
    "markdown": [],
    "sql": [],
    "dockerfile": [],
}

CLASS_NODES = {
    "python": ["class_definition"],
    "javascript": ["class_declaration"],
    "typescript": ["class_declaration"],
    "tsx": ["class_declaration"],
    "go": ["type_declaration"],
    "java": ["class_declaration"],
    "rust": ["struct_item", "impl_item"],
    "ruby": ["class"],
    "php": ["class_declaration"],
    "c": [],
    "cpp": ["class_specifier"],
    "c_sharp": ["class_declaration"],
    "bash": [],
    "html": [],
    "css": [],
    "json": [],
    "yaml": [],
    "toml": [],
    "markdown": [],
    "sql": [],
    "dockerfile": [],
}
