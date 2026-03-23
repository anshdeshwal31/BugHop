import json
import re

from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings

MODEL = settings.llm_model
llm = ChatGoogleGenerativeAI(
    model=MODEL,
    temperature=0.2,
    max_retries=2,
    google_api_key=settings.google_api_key,
)


def _extract_text(response):
    text = getattr(response, "text", None)
    if isinstance(text, str) and text:
        return text

    content = getattr(response, "content", "")
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        chunks = []
        for block in content:
            if isinstance(block, dict) and isinstance(block.get("text"), str):
                chunks.append(block["text"])
        if chunks:
            return "\n".join(chunks)

    return str(content)


async def _invoke_text(prompt, temperature=0.2):
    model = llm
    if temperature != 0.2:
        model = ChatGoogleGenerativeAI(
            model=MODEL,
            temperature=temperature,
            max_retries=2,
            google_api_key=settings.google_api_key,
        )

    response = await model.ainvoke(prompt)
    return _extract_text(response)


def _clean_json_response(content: str) -> str:
    stripped = content.strip()
    stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
    stripped = re.sub(r"\s*```$", "", stripped)
    return stripped


async def review_pull_request(
    title, description, diff, files_changed, related_code, custom_rules
):
    rules_section = ""
    if custom_rules and len(custom_rules) > 0:
        lines = []
        for rule in custom_rules:
            lines.append("- " + rule)
        rules_list = "\n".join(lines)
        rules_section = f"""
        IMPORTANT: The team has defined these custom rules that MUST be enforced:
        {rules_list}

        Make sure to check for violations of these rules and flag them in your review.
        """

    prompt = f"""You are a code reviewer. Review this pull request and provide helpful feedback.

    PR Title: {title}
    PR Description: {description or "No description provided"}

    Files changed: {", ".join(files_changed)}
    {rules_section}
    Code changes (diff):
    {diff}

    Related code from the codebase for context:
    {related_code}

    Please provide a constructive code review comment. Focus on:
    - Potential bugs or issues
    - Code quality and best practices
    - Security concerns if any
    - Suggestions for improvement
    {f"- Violations of the team's custom rules listed above" if custom_rules else ""}

    Be concise and helpful."""

    return await _invoke_text(prompt)


async def help_with_issue(title, description, related_code, custom_rules):
    rules_section = ""
    if custom_rules and len(custom_rules) > 0:
        lines = []
        for rule in custom_rules:
            lines.append("- " + rule)
        rules_list = "\n".join(lines)

        rules_section = f"""
        Note: The team has defined these coding guidelines to follow:
        {rules_list}

        Keep these in mind when suggesting solutions.
        """

    prompt = f"""You are a helpful assistant that helps developers solve issues.

    Issue Title: {title}
    Issue Description: {description or "No description provided"}
    {rules_section}
    Related code from the codebase:
    {related_code}

    Please provide a helpful comment that:
    - Identifies which files might need to be modified
    - Suggests a potential approach to solve this issue
    - Points out any relevant code patterns in the codebase
    {f"- Ensure suggestions follow the team's coding guidelines listed above" if custom_rules else ""}

    Be concise and actionable."""

    return await _invoke_text(prompt)


async def chat_with_repo(question, code_context):
    prompt = f"""You are a helpful assistant that answers questions about a codebase.

    User's question: {question}

    Here are relevant code snippets from the codebase that may help answer the question:
    {code_context}

    Please provide a clear and helpful answer based on the code context provided.
    If the code context doesn't contain enough information to fully answer the question,
    mention what you can determine from the available code and what additional information might be needed.

    Be concise and specific in your answer."""

    return await _invoke_text(prompt)


async def plan_issues_fix(
    issue_title, issue_body, related_code, file_contents, custom_rules
):

    files_section = ""
    for path, content in file_contents.items():
        if len(content) > 8000:
            truncated = content[:8000]
        else:
            truncated = content

        files_section += (
            "\n\n===FILE: " + path + " ===\n" + truncated + "\n=== END FILE ==="
        )

    rules_section = ""
    if custom_rules and len(custom_rules) > 0:
        lines = []
        for rule in custom_rules:
            lines.append("- " + rule)
        rules_list = "\n".join(lines)
        rules_section = f"\nCoding guidelines to follow:\n{rules_list}\n"

    prompt = f"""You are a senior software engineer. Analyze this issue and plan the minimal code changes needed to fix it.

    ISSUE TITLE: {issue_title}

    ISSUE DESCRIPTION:
    {issue_body or "No description provided"}
    {rules_section}
    RELATED CODE SNIPPETS (from codebase search):
    {related_code}

    FULL FILE CONTENTS (files that might need changes):
    {files_section}

    Based on the issue and code, output a JSON plan with this exact structure:
    {{
        "summary": "One sentence describing the fix",
        "files": [
            {{
                "path": "path/to/file.ext",
                "action": "modify",
                "description": "What specific change to make"
            }}
        ],
        "approach": "2-3 sentences explaining the implementation approach"
    }}

    Rules:
    - action must be one of: "create", "modify", "delete"
    - Only include files that ACTUALLY need changes
    - Be specific in descriptions (e.g., "Change 'username' to 'User' on line 45")
    - For new files, describe what the file should contain
    - Be conservative - minimal changes only

    Output ONLY valid JSON, no markdown or explanation."""

    result = await _invoke_text(prompt, temperature=0.2)
    return json.loads(_clean_json_response(result))


async def generate_file_change(
    file_path,
    current_content,
    action,
    change_description,
    issue_title,
    issue_body,
    custom_rules,
):
    rules_section = ""
    if custom_rules and len(custom_rules) > 0:
        lines = []
        for rule in custom_rules:
            lines.append("- " + rule)
        rules_list = "\n".join(lines)
        rules_section = f"\nCoding guidelines to follow:\n{rules_list}\n"

    if action == "create":
        prompt = f"""You are a senior software engineer. Create a new file to help fix this issue.

ISSUE: {issue_title}
{issue_body or ""}
{rules_section}
FILE TO CREATE: {file_path}
WHAT IT SHOULD DO: {change_description}

Output the COMPLETE file content. No explanations, no markdown code blocks - just the raw file content.
Make sure the code is production-ready and follows best practices."""

    elif action == "modify":
        prompt = f"""You are a senior software engineer. Modify this file to help fix an issue.

ISSUE: {issue_title}
{issue_body or ""}
{rules_section}
FILE: {file_path}

CURRENT CONTENT:
{current_content}

CHANGE NEEDED: {change_description}

Output the COMPLETE modified file content.
- No explanations
- No markdown code blocks
- No placeholders like "// rest of code unchanged"
- Output the ENTIRE file with your changes applied

Just output the raw file content."""

    else:
        return ""

    return await _invoke_text(prompt, temperature=0.2)
