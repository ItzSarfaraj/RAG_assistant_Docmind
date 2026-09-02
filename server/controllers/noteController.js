// controllers/noteController.js
import Document from "../models/Document.js";
import Note from "../models/noteModel.js";
import { streamNotes } from "../services/ragService.js";

export const generateNotes = async (req, res) => {
  const {
    documentId,
    detailLevel,
    explanationLevel,
    noteStructure,
    include,
    faithfulToVideo,
  } = req.body;

  if (!documentId) {
    return res.status(400).json({ message: "documentId is required." });
  }

  const document = await Document.findOne({ _id: documentId, user: req.user.id });

  if (!document) {
    return res.status(404).json({ message: "Document not found." });
  }

  if (document.sourceType !== "video") {
    return res.status(400).json({
      message: "Notes can currently be generated only from videos.",
    });
  }

  // SSE to the browser, proxying progress from the RAG service.
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

  try {
    const data = await streamNotes({
      documentId,
      detailLevel: detailLevel || "detailed",
      explanationLevel: explanationLevel || "intermediate",
      noteStructure: noteStructure || "structured",
      include: include || {},
      faithfulToVideo: faithfulToVideo ?? true,
      onEvent: (event) => {
        if (event.type === "progress") send(event);
      },
    });

    if (!data.notes) {
      send({ type: "error", message: "RAG service returned no notes." });
      return res.end();
    }

    const note = await Note.create({
      user: req.user.id,
      document: documentId,
      title: `${document.name} - Notes`,
      content: data.notes,
      detailLevel: detailLevel || "detailed",
      explanationLevel: explanationLevel || "intermediate",
      noteStructure: noteStructure || "structured",
      include: include || {},
      faithfulToVideo: faithfulToVideo ?? true,
    });

    send({
      type: "complete",
      note: {
        _id: note._id,
        document: note.document,
        documentId: note.document,
        title: note.title,
        content: note.content,
        detailLevel: note.detailLevel,
        explanationLevel: note.explanationLevel,
        noteStructure: note.noteStructure,
        include: note.include,
        faithfulToVideo: note.faithfulToVideo,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
    });
  } catch (error) {
    console.error("NOTE GENERATION ERROR:", error.response?.data || error.message);
    send({ message: "Failed to generate notes.", type: "error" });
  } finally {
    res.end();
  }
};

export const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.noteId, user: req.user.id })
      .populate("document", "name sourceType sourceUrl url");

    if (!note) return res.status(404).json({ message: "Note not found." });
    return res.status(200).json({ note });
  } catch (error) {
    console.error("GET NOTE ERROR:", error);
    return res.status(500).json({ message: "Failed to load note." });
  }
};

export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id })
      .populate("document", "name sourceType sourceUrl url")
      .sort({ createdAt: -1 });

    return res.status(200).json({ notes });
  } catch (error) {
    console.error("GET NOTES ERROR:", error);
    return res.status(500).json({ message: "Failed to load notes." });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.noteId, user: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found." });
    return res.status(200).json({ message: "Note deleted successfully." });
  } catch (error) {
    console.error("DELETE NOTE ERROR:", error);
    return res.status(500).json({ message: "Failed to delete note." });
  }
};