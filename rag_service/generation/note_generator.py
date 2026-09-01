import re

from langchain_google_genai import ChatGoogleGenerativeAI

from config import GOOGLE_API_KEY, LLM_MODEL, MAX_OUTPUT_TOKENS


BATCH_CHAR_LIMIT = 8000


# ============================================================
# LLM
# ============================================================

def _get_llm():
    return ChatGoogleGenerativeAI(
        model=LLM_MODEL,
        google_api_key=GOOGLE_API_KEY,
        temperature=0.2,
        max_output_tokens=MAX_OUTPUT_TOKENS,
    )


# ============================================================
# Cleanup
# ============================================================

def _remove_timestamps(text: str) -> str:
    """
    Remove video timestamps from generated notes.

    Examples:
        [00:15]
        [12:30]
        [01:25:40]
    """

    if not text:
        return text

    return re.sub(
        r"\[\d{1,2}:\d{2}(?::\d{2})?\]",
        "",
        text,
    )


# ============================================================
# Sections
# ============================================================

def _build_requested_sections(include: dict | None):
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


# ============================================================
# Note Structure
# ============================================================

def _build_structure_instruction(note_structure: str):
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

    return structures.get(
        note_structure,
        structures["structured"],
    )


# ============================================================
# Faithfulness
# ============================================================

def _build_faithfulness_instruction(faithful_to_video: bool):
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


# ============================================================
# Batching
# ============================================================

def _create_batches(context: str):
    """
    Split the complete video context into manageable batches.

    Existing video chunks are kept intact whenever possible.
    """

    if not context or not context.strip():
        return []

    chunks = context.split("\n\n---\n\n")

    batches = []
    current_batch = []
    current_length = 0

    for chunk in chunks:
        chunk_length = len(chunk)

        if (
            current_batch
            and current_length + chunk_length > BATCH_CHAR_LIMIT
        ):
            batches.append(
                "\n\n---\n\n".join(current_batch)
            )

            current_batch = []
            current_length = 0

        current_batch.append(chunk)
        current_length += chunk_length

    if current_batch:
        batches.append(
            "\n\n---\n\n".join(current_batch)
        )

    return batches


# ============================================================
# Batch Note Generation
# ============================================================

def _generate_batch_notes(
    context: str,
    batch_number: int,
    total_batches: int,
    detail_level: str,
    explanation_level: str,
    requested_sections: str,
    structure_instruction: str,
    faithfulness_instruction: str,
):
    prompt = f"""
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

    response = _get_llm().invoke(prompt)

    return response.content


# ============================================================
# Final Synthesis
# ============================================================

def _synthesize_notes(
    intermediate_notes: list[str],
    detail_level: str,
    explanation_level: str,
    requested_sections: str,
    structure_instruction: str,
    faithfulness_instruction: str,
):
    """
    Combine intermediate notes into one coherent final document.
    """

    combined_notes = "\n\n".join(
        f"===== VIDEO SECTION {index} =====\n{notes}"
        for index, notes in enumerate(
            intermediate_notes,
            start=1,
        )
    )

    prompt = f"""
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

    response = _get_llm().invoke(prompt)

    return response.content


# ============================================================
# Main Function
# ============================================================

def generate_notes(
    context: str,
    detail_level: str = "detailed",
    explanation_level: str = "intermediate",
    note_structure: str = "structured",
    include: dict | None = None,
    faithful_to_video: bool = True,
):
    """
    Generate structured notes from an entire video.

    Pipeline:

        Full transcript
              ↓
        Multiple batches
              ↓
        Intermediate notes
              ↓
        Final synthesis
              ↓
        Timestamp cleanup
              ↓
        Final notes
    """

    if not context or not context.strip():
        raise ValueError(
            "No source content was provided for note generation."
        )

    requested_sections = _build_requested_sections(include)

    structure_instruction = _build_structure_instruction(
        note_structure
    )

    faithfulness_instruction = _build_faithfulness_instruction(
        faithful_to_video
    )

    # --------------------------------------------------------
    # Create batches
    # --------------------------------------------------------

    batches = _create_batches(context)

    if not batches:
        raise ValueError(
            "Could not create note-generation batches."
        )

    # --------------------------------------------------------
    # Generate intermediate notes
    # --------------------------------------------------------

    intermediate_notes = []

    total_batches = len(batches)

    for index, batch in enumerate(
        batches,
        start=1,
    ):
        notes = _generate_batch_notes(
            context=batch,
            batch_number=index,
            total_batches=total_batches,
            detail_level=detail_level,
            explanation_level=explanation_level,
            requested_sections=requested_sections,
            structure_instruction=structure_instruction,
            faithfulness_instruction=faithfulness_instruction,
        )

        if notes and notes.strip():
            intermediate_notes.append(notes)

    if not intermediate_notes:
        raise ValueError(
            "The LLM did not generate any intermediate notes."
        )

    # --------------------------------------------------------
    # Final synthesis
    # --------------------------------------------------------

    final_notes = _synthesize_notes(
        intermediate_notes=intermediate_notes,
        detail_level=detail_level,
        explanation_level=explanation_level,
        requested_sections=requested_sections,
        structure_instruction=structure_instruction,
        faithfulness_instruction=faithfulness_instruction,
    )

    # --------------------------------------------------------
    # Final cleanup
    # --------------------------------------------------------

    final_notes = _remove_timestamps(final_notes)

    return final_notes