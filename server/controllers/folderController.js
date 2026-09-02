import Folder from "../models/Folder.js";
import Document from "../models/Document.js";
import mongoose from "mongoose";

const createFolder = async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Folder name is required." });
    }

    const folder = await Folder.create({
      user: req.user.id,
      name: name.trim(),
      color: color || "#BD7B24",
    });

    return res.status(201).json({ folder });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A folder with this name already exists." });
    }
    console.error("Create folder error:", error.message);
    return res.status(500).json({ message: "Failed to create folder." });
  }
};

const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user.id }).sort({ name: 1 });

    const counts = await Document.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), folder: { $ne: null } } },
      { $group: { _id: "$folder", count: { $sum: 1 } } },
    ]);

    const countMap = counts.reduce((accumulator, item) => {
      accumulator[item._id.toString()] = item.count;
      return accumulator;
    }, {});

    const foldersWithCounts = folders.map((folder) => ({
      ...folder.toObject(),
      documentCount: countMap[folder._id.toString()] || 0,
    }));

    return res.status(200).json({ folders: foldersWithCounts });
  } catch (error) {
    console.error("Get folders error:", error.message);
    return res.status(500).json({ message: "Failed to load folders." });
  }
};

const renameFolder = async (req, res) => {
  try {
    const { name, color } = req.body;

    const folder = await Folder.findOne({ _id: req.params.id, user: req.user.id });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found." });
    }

    if (name?.trim()) folder.name = name.trim();
    if (color) folder.color = color;

    await folder.save();

    return res.status(200).json({ folder });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A folder with this name already exists." });
    }
    console.error("Rename folder error:", error.message);
    return res.status(500).json({ message: "Failed to update folder." });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found." });
    }

    // Documents inside a deleted folder become unfiled, not deleted.
    await Document.updateMany(
      { folder: folder._id, user: req.user.id },
      { $set: { folder: null } },
    );

    return res.status(200).json({ message: "Folder deleted successfully." });
  } catch (error) {
    console.error("Delete folder error:", error.message);
    return res.status(500).json({ message: "Failed to delete folder." });
  }
};

export { createFolder, getFolders, renameFolder, deleteFolder };