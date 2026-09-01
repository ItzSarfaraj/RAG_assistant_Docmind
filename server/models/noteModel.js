import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    detailLevel: {
      type: String,
      default: "detailed",
    },

    explanationLevel: {
      type: String,
      default: "intermediate",
    },

    noteStructure: {
      type: String,
      default: "structured",
    },

    include: {
      type: Object,
      default: {},
    },

    faithfulToVideo: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  },
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
