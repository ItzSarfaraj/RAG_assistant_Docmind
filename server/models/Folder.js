import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: "#BD7B24",
    },
  },
  { timestamps: true },
);

folderSchema.index({ user: 1, name: 1 }, { unique: true });

const Folder = mongoose.model("Folder", folderSchema);

export default Folder;