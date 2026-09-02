import asyncio

from config import NOTES_MAX_CONCURRENCY, NOTES_REDUCE_GROUP_SIZE
from generation.notes.batching import create_batches, remove_timestamps
from generation.notes.prompts import (
    build_requested_sections,
    build_structure_instruction,
    build_faithfulness_instruction,
    build_batch_prompt,
    build_synthesis_prompt,
)
from generation.notes.llm_calls import invoke_with_continuation


async def _generate_batch_notes(context, batch_number, total_batches, detail_level, explanation_level, requested_sections, structure_instruction, faithfulness_instruction):
    prompt = build_batch_prompt(
        context=context,
        batch_number=batch_number,
        total_batches=total_batches,
        detail_level=detail_level,
        explanation_level=explanation_level,
        requested_sections=requested_sections,
        structure_instruction=structure_instruction,
        faithfulness_instruction=faithfulness_instruction,
    )
    return await invoke_with_continuation(prompt, label=f"batch {batch_number}/{total_batches}")


async def _generate_all_batches(batches, detail_level, explanation_level, requested_sections, structure_instruction, faithfulness_instruction, on_progress=None):
    semaphore = asyncio.Semaphore(NOTES_MAX_CONCURRENCY)
    total = len(batches)
    completed = 0
    lock = asyncio.Lock()

    async def run_one(index: int, batch: str):
        nonlocal completed
        async with semaphore:
            notes = await _generate_batch_notes(
                context=batch,
                batch_number=index + 1,
                total_batches=total,
                detail_level=detail_level,
                explanation_level=explanation_level,
                requested_sections=requested_sections,
                structure_instruction=structure_instruction,
                faithfulness_instruction=faithfulness_instruction,
            )
        async with lock:
            completed += 1
            if on_progress:
                await on_progress({"stage": "batches", "completed": completed, "total": total})
        return notes

    results = await asyncio.gather(*(run_one(i, b) for i, b in enumerate(batches)))
    return [notes for notes in results if notes and notes.strip()]


async def _synthesize_notes(intermediate_notes, detail_level, explanation_level, requested_sections, structure_instruction, faithfulness_instruction):
    prompt = build_synthesis_prompt(
        intermediate_notes=intermediate_notes,
        detail_level=detail_level,
        explanation_level=explanation_level,
        requested_sections=requested_sections,
        structure_instruction=structure_instruction,
        faithfulness_instruction=faithfulness_instruction,
    )
    return await invoke_with_continuation(prompt, label="synthesis")


async def _reduce_notes(intermediate_notes, detail_level, explanation_level, requested_sections, structure_instruction, faithfulness_instruction, on_progress=None):
    """
    Hierarchical (map-reduce) combine — merges in small groups in parallel,
    then merges the merged results again, until one document remains.
    """
    notes = intermediate_notes

    while len(notes) > 1:
        groups = [
            notes[i:i + NOTES_REDUCE_GROUP_SIZE]
            for i in range(0, len(notes), NOTES_REDUCE_GROUP_SIZE)
        ]

        if len(groups) == 1:
            return await _synthesize_notes(
                intermediate_notes=groups[0],
                detail_level=detail_level,
                explanation_level=explanation_level,
                requested_sections=requested_sections,
                structure_instruction=structure_instruction,
                faithfulness_instruction=faithfulness_instruction,
            )

        semaphore = asyncio.Semaphore(NOTES_MAX_CONCURRENCY)

        async def reduce_group(group):
            async with semaphore:
                return await _synthesize_notes(
                    intermediate_notes=group,
                    detail_level=detail_level,
                    explanation_level=explanation_level,
                    requested_sections=requested_sections,
                    structure_instruction=structure_instruction,
                    faithfulness_instruction=faithfulness_instruction,
                )

        notes = list(await asyncio.gather(*(reduce_group(g) for g in groups)))

        if on_progress:
            await on_progress({"stage": "merging", "remaining_sections": len(notes)})

    return notes[0]


async def generate_notes(
    context: str,
    detail_level: str = "detailed",
    explanation_level: str = "intermediate",
    note_structure: str = "structured",
    include: dict | None = None,
    faithful_to_video: bool = True,
    on_progress=None,
):
    """
    Full transcript → adaptive batching → intermediate notes (concurrent)
    → hierarchical reduce → final synthesis → timestamp cleanup.
    """
    if not context or not context.strip():
        raise ValueError("No source content was provided for note generation.")

    requested_sections = build_requested_sections(include)
    structure_instruction = build_structure_instruction(note_structure)
    faithfulness_instruction = build_faithfulness_instruction(faithful_to_video)

    batches = create_batches(context, note_structure=note_structure)

    if not batches:
        raise ValueError("Could not create note-generation batches.")

    if len(batches) == 1:
        notes = await _generate_batch_notes(
            context=batches[0],
            batch_number=1,
            total_batches=1,
            detail_level=detail_level,
            explanation_level=explanation_level,
            requested_sections=requested_sections,
            structure_instruction=structure_instruction,
            faithfulness_instruction=faithfulness_instruction,
        )
        if on_progress:
            await on_progress({"stage": "batches", "completed": 1, "total": 1})
        return remove_timestamps(notes)

    intermediate_notes = await _generate_all_batches(
        batches=batches,
        detail_level=detail_level,
        explanation_level=explanation_level,
        requested_sections=requested_sections,
        structure_instruction=structure_instruction,
        faithfulness_instruction=faithfulness_instruction,
        on_progress=on_progress,
    )

    if not intermediate_notes:
        raise ValueError("The LLM did not generate any intermediate notes.")

    final_notes = await _reduce_notes(
        intermediate_notes=intermediate_notes,
        detail_level=detail_level,
        explanation_level=explanation_level,
        requested_sections=requested_sections,
        structure_instruction=structure_instruction,
        faithfulness_instruction=faithfulness_instruction,
        on_progress=on_progress,
    )

    return remove_timestamps(final_notes)