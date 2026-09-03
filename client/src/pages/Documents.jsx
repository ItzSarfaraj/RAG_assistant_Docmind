import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import SourceUploader from "../components/SourceUploader";
import ChatWindow from "../components/ChatWindow";

import DocumentHeader from "../components/document/DocumentHeader";
import FolderBar from "../components/document/FolderBar";
import DocumentToolbar from "../components/document/DocumentToolbar";
import DocumentGrid from "../components/document/DocumentGrid";
import EmptyDocuments from "../components/document/EmptyDocuments";
import DocumentChatSidebar from "../components/document/DocumentChatSidebar";

import {
  getDocuments,
  deleteDocument,
  updateDocument,
} from "../services/documentService";

import {
  getFolders,
  createFolder,
  renameFolder,
  deleteFolder,
} from "../services/folderService";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

function statusOf(progress) {
  if (progress >= 100) return "completed";
  if (progress > 0) return "in_progress";
  return "not_started";
}

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [activeFolder, setActiveFolder] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  const [editingDocumentId, setEditingDocumentId] = useState(null);
  const [editingDocumentName, setEditingDocumentName] = useState("");

  const token = localStorage.getItem("token");

  // Load sources

  const loadDocuments = async () => {
    if (!token) return;

    const data = await getDocuments(token);
    setDocuments(data.documents || []);
  };

  const loadFolders = async () => {
    if (!token) return;

    const data = await getFolders(token);
    setFolders(data.folders || []);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([loadDocuments(), loadFolders()]);
      } catch (error) {
        console.error("Failed to load documents page:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAll();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Document actions

  const handleUploaded = (document) => {
    setDocuments((previous) => [document, ...previous]);
    setShowUploader(false);
  };

  const handleDelete = async (document) => {
    const confirmed = window.confirm(
      `Delete "${document.name}"?`,
    );

    if (!confirmed) return;

    try {
      await deleteDocument(document._id, token);

      setDocuments((previous) =>
        previous.filter((item) => item._id !== document._id),
      );

      setSelectedDocument((current) =>
        current?._id === document._id ? null : current,
      );
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert(error.message || "Failed to delete document.");
    }
  };

  const handleMoveToFolder = async (document, folderId) => {
    try {
      const data = await updateDocument(
        document._id,
        { folder: folderId || null },
        token,
      );

      setDocuments((previous) =>
        previous.map((item) =>
          item._id === document._id
            ? { ...item, ...data.document }
            : item,
        ),
      );

      loadFolders();
    } catch (error) {
      console.error("Failed to move document:", error);
      alert(error.message || "Failed to move document.");
    }
  };

  const handleSetProgress = async (document, progress) => {
    setDocuments((previous) =>
      previous.map((item) =>
        item._id === document._id
          ? { ...item, progress }
          : item,
      ),
    );

    if (selectedDocument?._id === document._id) {
      setSelectedDocument((current) =>
        current ? { ...current, progress } : current,
      );
    }

    try {
      await updateDocument(
        document._id,
        { progress },
        token,
      );
    } catch (error) {
      console.error("Failed to update progress:", error);
      loadDocuments();
    }
  };

  const handleRenameDocument = async (document) => {
    const trimmed = editingDocumentName.trim();

    if (!trimmed || trimmed === document.name) {
      setEditingDocumentId(null);
      return;
    }

    try {
      const data = await updateDocument(
        document._id,
        { name: trimmed },
        token,
      );

      setDocuments((previous) =>
        previous.map((item) =>
          item._id === document._id
            ? { ...item, ...data.document }
            : item,
        ),
      );

      setSelectedDocument((current) =>
        current?._id === document._id
          ? { ...current, ...data.document }
          : current,
      );

      setEditingDocumentId(null);
    } catch (error) {
      console.error("Failed to rename document:", error);
      alert(error.message || "Failed to rename document.");
    }
  };

  // Folder actions

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setCreatingFolder(false);
      return;
    }

    try {
      const data = await createFolder(
        newFolderName.trim(),
        token,
      );

      setFolders((previous) => [
        ...previous,
        { ...data.folder, documentCount: 0 },
      ]);

      setNewFolderName("");
      setCreatingFolder(false);
    } catch (error) {
      alert(error.message || "Failed to create folder.");
    }
  };

  const handleRenameFolder = async (folderId) => {
    if (!editingFolderName.trim()) {
      setEditingFolderId(null);
      return;
    }

    try {
      const data = await renameFolder(
        folderId,
        editingFolderName.trim(),
        token,
      );

      setFolders((previous) =>
        previous.map((folder) =>
          folder._id === folderId
            ? { ...folder, ...data.folder }
            : folder,
        ),
      );

      setEditingFolderId(null);
    } catch (error) {
      alert(error.message || "Failed to rename folder.");
    }
  };

  const handleDeleteFolder = async (folder) => {
    const confirmed = window.confirm(
      `Delete "${folder.name}"? Documents inside will become unfiled, not deleted.`,
    );

    if (!confirmed) return;

    try {
      await deleteFolder(folder._id, token);

      setFolders((previous) =>
        previous.filter((item) => item._id !== folder._id),
      );

      setDocuments((previous) =>
        previous.map((document) =>
          document.folder?._id === folder._id
            ? { ...document, folder: null }
            : document,
        ),
      );

      if (activeFolder === folder._id) {
        setActiveFolder("all");
      }
    } catch (error) {
      alert(error.message || "Failed to delete folder.");
    }
  };

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesFolder =
      activeFolder === "all"
        ? true
        : activeFolder === "unfiled"
          ? !document.folder
          : document.folder?._id === activeFolder;

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusOf(document.progress || 0) === statusFilter;

    return matchesSearch && matchesFolder && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F4EC]">
        <div className="flex items-center gap-2 text-xs text-[#8A8473]">
          <LoaderCircle size={15} className="animate-spin" />
          Loading sources...
        </div>
      </div>
    );
  }

  if (selectedDocument) {
    return (
      <div className="flex h-full min-h-0 overflow-hidden bg-[#F7F4EC]">
        <DocumentChatSidebar
          documents={filteredDocuments}
          selectedDocument={selectedDocument}
          onSelect={setSelectedDocument}
          onBack={() => setSelectedDocument(null)}
          onDelete={handleDelete}
        />

        <div className="min-w-0 flex-1">
          <ChatWindow
            document={selectedDocument}
            onTimestampClick={() => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F7F4EC]">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-8 xl:px-10 2xl:px-12">
        <DocumentHeader
          showUploader={showUploader}
          onToggleUploader={() =>
            setShowUploader((value) => !value)
          }
        />

        {showUploader && (
          <div className="mt-6 rounded-2xl border border-[#E6E1D3] bg-white p-6 shadow-sm">
            <SourceUploader onUploaded={handleUploaded} />
          </div>
        )}

        <FolderBar
          documents={documents}
          folders={folders}
          activeFolder={activeFolder}
          setActiveFolder={setActiveFolder}
          creatingFolder={creatingFolder}
          setCreatingFolder={setCreatingFolder}
          newFolderName={newFolderName}
          setNewFolderName={setNewFolderName}
          editingFolderId={editingFolderId}
          setEditingFolderId={setEditingFolderId}
          editingFolderName={editingFolderName}
          setEditingFolderName={setEditingFolderName}
          handleCreateFolder={handleCreateFolder}
          handleRenameFolder={handleRenameFolder}
          handleDeleteFolder={handleDeleteFolder}
        />

        <DocumentToolbar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusFilters={STATUS_FILTERS}
        />

        <div className="mt-7 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#22201A]">
              {filteredDocuments.length}{" "}
              {filteredDocuments.length === 1
                ? "source"
                : "sources"}
            </p>

            <p className="mt-0.5 text-[10px] text-[#A09A8B]">
              {activeFolder === "all"
                ? "All your research material"
                : activeFolder === "unfiled"
                  ? "Sources without a folder"
                  : "Sources in this folder"}
            </p>
          </div>

          {(search ||
            activeFolder !== "all" ||
            statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveFolder("all");
                setStatusFilter("all");
              }}
              className="text-[10px] font-medium text-[#BD7B24] transition hover:text-[#9E641B]"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredDocuments.length === 0 ? (
          <EmptyDocuments
            onAddSource={() => setShowUploader(true)}
          />
        ) : (
          <DocumentGrid
            documents={filteredDocuments}
            folders={folders}
            editingDocumentId={editingDocumentId}
            editingDocumentName={editingDocumentName}
            setEditingDocumentId={setEditingDocumentId}
            setEditingDocumentName={setEditingDocumentName}
            handleRenameDocument={handleRenameDocument}
            handleDelete={handleDelete}
            handleMoveToFolder={handleMoveToFolder}
            handleSetProgress={handleSetProgress}
            onSelect={setSelectedDocument}
          />
        )}
      </div>
    </div>
  );
}

export default Documents;