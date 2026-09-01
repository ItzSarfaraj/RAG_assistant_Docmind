import Document from "../models/Document.js";
import Note from "../models/noteModel.js";

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://127.0.0.1:8000";

/*
|--------------------------------------------------------------------------
| Generate Notes
|--------------------------------------------------------------------------
*/

export const generateNotes = async (req, res) => {
  try {
    const {
      documentId,
      detailLevel,
      explanationLevel,
      noteStructure,
      include,
      faithfulToVideo,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validate document ID
    |--------------------------------------------------------------------------
    */

    if (!documentId) {
      return res.status(400).json({
        message: "documentId is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find user's document
    |--------------------------------------------------------------------------
    */

    const document = await Document.findOne({
      _id: documentId,
      user: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Currently notes are supported for videos
    |--------------------------------------------------------------------------
    */

    if (document.sourceType !== "video") {
      return res.status(400).json({
        message: "Notes can currently be generated only from videos.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Send request to RAG service
    |--------------------------------------------------------------------------
    */

    const response = await fetch(`${RAG_SERVICE_URL}/notes/generate`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        document_id: documentId,

        detail_level: detailLevel || "detailed",

        explanation_level: explanationLevel || "intermediate",

        note_structure: noteStructure || "structured",

        include: include || {},

        faithful_to_video: faithfulToVideo ?? true,
      }),
    });

    /*
    |--------------------------------------------------------------------------
    | Parse RAG response
    |--------------------------------------------------------------------------
    */

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data.detail || data.message || "Failed to generate notes.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate generated content
    |--------------------------------------------------------------------------
    */

    if (!data.notes) {
      return res.status(500).json({
        message: "RAG service returned no notes.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Save note in MongoDB
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Return complete note
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
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
    console.error("NOTE GENERATION ERROR:", error);

    return res.status(500).json({
      message: "Failed to generate notes.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Single Note
|--------------------------------------------------------------------------
*/

export const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.noteId,
      user: req.user.id,
    }).populate("document", "name sourceType sourceUrl url");

    if (!note) {
      return res.status(404).json({
        message: "Note not found.",
      });
    }

    return res.status(200).json({
      note,
    });
  } catch (error) {
    console.error("GET NOTE ERROR:", error);

    return res.status(500).json({
      message: "Failed to load note.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get All Notes
|--------------------------------------------------------------------------
*/

export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user.id,
    })
      .populate("document", "name sourceType sourceUrl url")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      notes,
    });
  } catch (error) {
    console.error("GET NOTES ERROR:", error);

    return res.status(500).json({
      message: "Failed to load notes.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Delete Note
|--------------------------------------------------------------------------
*/

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.noteId,
      user: req.user.id,
    });

    /*
    |--------------------------------------------------------------------------
    | Note not found
    |--------------------------------------------------------------------------
    */

    if (!note) {
      return res.status(404).json({
        message: "Note not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Successfully deleted
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE NOTE ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete note.",
    });
  }
};
