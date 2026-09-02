def build_requested_sections(include: dict | None) -> str:
    include = include or {}
    sections = []

    if include.get("summary", True):
        sections.append("- Summary")
    if include.get("keyConcepts", True):
        sections.append("- Key Concepts")
    if include.get("examples", True):
        sections.append("- Examples")
    if include.get("code", False):
        sections.append("- Code / Implementation")
    if include.get("flowcharts", False):
        sections.append("- Flowcharts")
    if include.get("diagrams", False):
        sections.append("- Diagrams")
    if include.get("tables", False):
        sections.append("- Tables")
    if include.get("keyTakeaways", True):
        sections.append("- Key Takeaways")
    if include.get("interviewQuestions", False):
        sections.append("- Interview Questions")

    return "\n".join(sections)


def build_structure_instruction(note_structure: str) -> str:
    structures = {
        "structured": """
Organize the notes as well-structured study material.

Use a logical hierarchy such as:

# Main Topic

## Summary

## Key Concepts

### Concept

Explanation of the concept.

### Another Concept

Explanation of the concept.

## Examples

## Code / Implementation

## Key Takeaways

Only include sections requested by the user.
Do not create empty sections.
""",
        "study": """
Organize the notes specifically for learning.

For each major concept, prefer:

## Concept Name

### Definition

Clearly define the concept.

### Explanation

Explain what it is, how it works, and why it matters.

### Example

Explain an example when the source provides one.

### Important Points

List the most important points to remember.

Do not create empty sections.
""",
        "handbook": """
Organize the notes like a detailed technical handbook.

Use a logical structure such as:

# Main Topic

## Overview

## Core Concepts

### Concept

#### Definition

#### How It Works

#### Example

#### Implementation

#### Important Considerations

## Practical Applications

## Key Takeaways

Use deeper hierarchical headings when they improve clarity.

Do not unnecessarily repeat information.
""",
        "revision": """
Organize the notes for quick revision.

Prioritize concise, information-dense content.

Use a structure such as:

# Main Topic

## Core Ideas

## Important Concepts

- Concept → concise explanation

## Examples

## Quick Takeaways

Avoid unnecessarily long explanations.
Focus on information that is useful during revision.
""",
    }

    return structures.get(note_structure, structures["structured"])


def build_faithfulness_instruction(faithful_to_video: bool) -> str:
    if faithful_to_video:
        return """
SOURCE RESTRICTION:

Stay strictly faithful to the information present in the
provided video/source.

You may reorganize and explain the information more clearly.

Do NOT invent:
- facts
- examples
- statistics
- APIs
- code
- claims
- concepts

that are not supported by the source.
"""

    return """
SOURCE + GENERAL KNOWLEDGE:

Use the provided video/source as the primary basis.

You may use general knowledge to:
- clarify concepts
- improve explanations
- provide useful context
- make difficult ideas easier to understand

Do not contradict the source.

When additional knowledge materially extends the source,
make it clear that it is additional context.
"""


def build_batch_prompt(
    context: str,
    batch_number: int,
    total_batches: int,
    detail_level: str,
    explanation_level: str,
    requested_sections: str,
    structure_instruction: str,
    faithfulness_instruction: str,
) -> str:
    return f"""
You are an expert educational note-making assistant.

You are processing PART {batch_number} OF {total_batches}
of a larger video.

Create accurate intermediate notes from this section.

DETAIL LEVEL:
{detail_level}

EXPLANATION LEVEL:
{explanation_level}

SECTIONS TO INCLUDE:
{requested_sections}

NOTE STRUCTURE:
{structure_instruction}

{faithfulness_instruction}

IMPORTANT RULES:

1. Focus only on information contained in this video section.
2. Preserve important technical terminology.
3. Do not unnecessarily repeat information.
4. Group related ideas together.
5. Use Markdown headings and subheadings.
6. Use bullet points where appropriate.
7. Use numbered lists for processes.
8. Put programming code inside fenced code blocks.
9. Explain examples when they are present.
10. Preserve important implementation details.
11. Do not invent unsupported information.
12. Do not include video timestamps.
13. Remove timestamp markers such as [00:15], [12:30],
    or [01:25:40].
14. Do not create empty sections.
15. These are intermediate notes that will later be combined.

Return ONLY the notes.

VIDEO SECTION:

{context}
"""


def build_synthesis_prompt(
    intermediate_notes: list[str],
    detail_level: str,
    explanation_level: str,
    requested_sections: str,
    structure_instruction: str,
    faithfulness_instruction: str,
) -> str:
    combined_notes = "\n\n".join(
        f"===== VIDEO SECTION {index} =====\n{notes}"
        for index, notes in enumerate(intermediate_notes, start=1)
    )

    return f"""
You are an expert educational note-making assistant.

You are given intermediate notes generated from different
sections of the same video.

Combine them into ONE coherent set of high-quality study notes.

DETAIL LEVEL:
{detail_level}

EXPLANATION LEVEL:
{explanation_level}

SECTIONS TO INCLUDE:
{requested_sections}

NOTE STRUCTURE:
{structure_instruction}

{faithfulness_instruction}

IMPORTANT RULES:

1. Create a logical overall structure.
2. Follow the requested note structure.
3. Remove duplicate explanations.
4. Preserve important technical terminology.
5. Do not include video timestamps.
6. Remove timestamp markers such as [00:15], [12:30],
   or [01:25:40].
7. Use Markdown headings and subheadings.
8. Use bullet points where appropriate.
9. Use numbered lists for processes.
10. Put programming code inside fenced code blocks.
11. Use Markdown tables when they genuinely improve understanding.
12. Use Mermaid syntax when flowcharts or diagrams are requested
    and appropriate.
13. Explain code examples clearly.
14. Do not create unsupported information when faithful mode is enabled.
15. Do not duplicate the same concept unnecessarily.
16. Do not lose important information simply to make the notes shorter.
17. Do not create empty sections.
18. Make the notes useful for studying and revision.
19. Follow the requested detail level.
20. Follow the requested explanation level.
21. Return ONLY the final notes.

INTERMEDIATE NOTES:

{combined_notes}
"""