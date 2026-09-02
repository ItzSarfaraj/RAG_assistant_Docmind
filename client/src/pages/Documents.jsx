import { useEffect, useState } from "react";
import {
  FileText,
  Trash2,
  Plus,
  Search,
  LoaderCircle,
  Folder as FolderIcon,
  FolderPlus,
  Pencil,
  X,
  Check,
} from "lucide-react";

import SourceUploader from "../components/SourceUploader";
import ChatWindow from "../components/ChatWindow";
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

function statusLabel(progress) {
  const status = statusOf(progress);
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [activeFolder, setActiveFolder] = useState("all"); // "all" | "unfiled" | folderId
  const [statusFilter, setStatusFilter] = useState("all");

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  // Document renaming
  const [editingDocumentId, setEditingDocumentId] = useState(null);
  const [editingDocumentName, setEditingDocumentName] = useState("");

  const token = localStorage.getItem("token");

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

  const handleUploaded = (document) => {
    setDocuments((previous) => [document, ...previous]);
    setShowUploader(false);
  };

  const handleDelete = async (document) => {
    const confirmed = window.confirm(`Delete "${document.name}"?`);
    if (!confirmed) return;

    try {
      await deleteDocument(document._id, token);
      setDocuments((previous) => previous.filter((item) => item._id !== document._id));
      setSelectedDocument((current) => (current?._id === document._id ? null : current));
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert(error.message || "Failed to delete document.");
    }
  };

  const handleMoveToFolder = async (document, folderId) => {
    try {
      const data = await updateDocument(document._id, { folder: folderId || null }, token);
      setDocuments((previous) =>
        previous.map((item) => (item._id === document._id ? { ...item, ...data.document } : item)),
      );
      loadFolders();
    } catch (error) {
      console.error("Failed to move document:", error);
      alert(error.message || "Failed to move document.");
    }
  };

  const handleSetProgress = async (document, progress) => {
    // Update immediately so the slider/buttons feel responsive; the
    // request reconciles in the background.
    setDocuments((previous) =>
      previous.map((item) => (item._id === document._id ? { ...item, progress } : item)),
    );

    try {
      await updateDocument(document._id, { progress }, token);
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
      const data = await updateDocument(document._id, { name: trimmed }, token);
      setDocuments((previous) =>
        previous.map((item) => (item._id === document._id ? { ...item, ...data.document } : item)),
      );
      setEditingDocumentId(null);
    } catch (error) {
      console.error("Failed to rename document:", error);
      alert(error.message || "Failed to rename document.");
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setCreatingFolder(false);
      return;
    }

    try {
      const data = await createFolder(newFolderName.trim(), token);
      setFolders((previous) => [...previous, { ...data.folder, documentCount: 0 }]);
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
      const data = await renameFolder(folderId, editingFolderName.trim(), token);
      setFolders((previous) =>
        previous.map((folder) => (folder._id === folderId ? { ...folder, ...data.folder } : folder)),
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
      setFolders((previous) => previous.filter((item) => item._id !== folder._id));
      setDocuments((previous) =>
        previous.map((document) =>
          document.folder?._id === folder._id ? { ...document, folder: null } : document,
        ),
      );
      if (activeFolder === folder._id) setActiveFolder("all");
    } catch (error) {
      alert(error.message || "Failed to delete folder.");
    }
  };

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.name?.toLowerCase().includes(search.toLowerCase());

    const matchesFolder =
      activeFolder === "all"
        ? true
        : activeFolder === "unfiled"
          ? !document.folder
          : document.folder?._id === activeFolder;

    const matchesStatus =
      statusFilter === "all" ? true : statusOf(document.progress || 0) === statusFilter;

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

  // ============================================================
  // Chat view — unchanged from before, folder rail hidden here.
  // ============================================================
  if (selectedDocument) {
    return (
      <div className="flex h-full min-h-0 overflow-hidden bg-[#F7F4EC]">
        <aside className="hidden w-72 shrink-0 flex-col overflow-hidden border-r border-[#E6E1D3] bg-white sm:flex">
          <div className="flex items-center gap-2 border-b border-[#E6E1D3] px-4 py-3.5">
            <button
              type="button"
              onClick={() => setSelectedDocument(null)}
              className="rounded-md p-1.5 text-[#75705F] transition hover:bg-[#F7F4EC] hover:text-[#22201A]"
              title="Back to all sources"
            >
              <FileText size={15} />
            </button>
            <p className="text-xs font-semibold text-[#22201A]">Sources</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {filteredDocuments.map((document) => {
              const isActive = document._id === selectedDocument._id;

              return (
                <button
                  key={document._id}
                  type="button"
                  onClick={() => setSelectedDocument(document)}
                  className={`group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition ${
                    isActive ? "bg-[#F3EFE4]" : "hover:bg-[#F7F4EC]"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[#BD7B24]" />
                  )}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3EFE4] text-[#BD7B24]">
                    <FileText size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[#22201A]">{document.name}</p>
                    <p className="mt-0.5 truncate text-[9px] uppercase tracking-wide text-[#A09A8B]">
                      {document.sourceType || document.contentType || "Source"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(document);
                    }}
                    className="shrink-0 rounded-md p-1 text-[#A09A8B] opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    title="Delete source"
                  >
                    <Trash2 size={13} />
                  </button>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <ChatWindow document={selectedDocument} onTimestampClick={() => {}} />
        </div>
      </div>
    );
  }

  // ============================================================
  // List view — folder rail + status filter + progress cards.
  // ============================================================
  return (
    <div className="flex h-full overflow-hidden bg-[#F7F4EC]">
      {/* Folder rail */}
      <aside className="hidden w-56 shrink-0 flex-col overflow-y-auto border-r border-[#E6E1D3] bg-white p-3 md:flex">
        <button
          type="button"
          onClick={() => setActiveFolder("all")}
          className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition ${
            activeFolder === "all"
              ? "bg-[#F3EFE4] font-semibold text-[#22201A]"
              : "text-[#75705F] hover:bg-[#F7F4EC]"
          }`}
        >
          <span>All sources</span>
          <span className="text-[10px] text-[#A09A8B]">{documents.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFolder("unfiled")}
          className={`mt-1 flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition ${
            activeFolder === "unfiled"
              ? "bg-[#F3EFE4] font-semibold text-[#22201A]"
              : "text-[#75705F] hover:bg-[#F7F4EC]"
          }`}
        >
          <span>Unfiled</span>
          <span className="text-[10px] text-[#A09A8B]">
            {documents.filter((document) => !document.folder).length}
          </span>
        </button>

        <div className="mt-5 flex items-center justify-between px-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#A09A8B]">
            Folders
          </span>
          <button
            type="button"
            onClick={() => setCreatingFolder(true)}
            className="rounded-md p-1 text-[#A09A8B] transition hover:bg-[#F7F4EC] hover:text-[#BD7B24]"
            title="New folder"
          >
            <FolderPlus size={14} />
          </button>
        </div>

        {creatingFolder && (
          <div className="mt-1.5 flex items-center gap-1 px-1">
            <input
              autoFocus
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleCreateFolder();
                if (event.key === "Escape") setCreatingFolder(false);
              }}
              placeholder="Folder name"
              className="min-w-0 flex-1 rounded-md border border-[#E6E1D3] px-2 py-1.5 text-[11px] outline-none focus:border-[#BD7B24]/50"
            />
            <button type="button" onClick={handleCreateFolder} className="rounded-md p-1 text-[#55684A] hover:bg-[#EAF0E5]">
              <Check size={13} />
            </button>
            <button type="button" onClick={() => setCreatingFolder(false)} className="rounded-md p-1 text-[#A09A8B] hover:bg-[#F7F4EC]">
              <X size={13} />
            </button>
          </div>
        )}

        <div className="mt-1 space-y-0.5">
          {folders.map((folder) => (
            <div
              key={folder._id}
              className={`group flex items-center gap-1 rounded-lg px-1 transition ${
                activeFolder === folder._id ? "bg-[#F3EFE4]" : "hover:bg-[#F7F4EC]"
              }`}
            >
              {editingFolderId === folder._id ? (
                <div className="flex flex-1 items-center gap-1 py-1">
                  <input
                    autoFocus
                    value={editingFolderName}
                    onChange={(event) => setEditingFolderName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleRenameFolder(folder._id);
                      if (event.key === "Escape") setEditingFolderId(null);
                    }}
                    className="min-w-0 flex-1 rounded-md border border-[#E6E1D3] px-2 py-1 text-[11px] outline-none focus:border-[#BD7B24]/50"
                  />
                  <button type="button" onClick={() => handleRenameFolder(folder._id)} className="rounded-md p-1 text-[#55684A] hover:bg-[#EAF0E5]">
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveFolder(folder._id)}
                    className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left text-xs text-[#75705F] group-hover:text-[#22201A]"
                  >
                    <FolderIcon size={13} style={{ color: folder.color }} />
                    <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                    <span className="text-[10px] text-[#A09A8B]">{folder.documentCount}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFolderId(folder._id);
                      setEditingFolderName(folder.name);
                    }}
                    className="hidden rounded-md p-1 text-[#A09A8B] hover:bg-white hover:text-[#22201A] group-hover:block"
                    title="Rename"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFolder(folder)}
                    className="hidden rounded-md p-1 text-[#A09A8B] hover:bg-white hover:text-red-500 group-hover:block"
                    title="Delete folder"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FileText size={19} className="text-[#BD7B24]" />
                <h1 className="text-xl font-semibold text-[#22201A]">Sources</h1>
              </div>
              <p className="mt-1.5 text-xs text-[#8A8473]">
                Organize, track progress, and chat with your research sources.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowUploader((value) => !value)}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#22201A] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3A362C]"
            >
              <Plus size={14} />
              {showUploader ? "Close" : "Add Source"}
            </button>
          </div>

          {showUploader && (
            <div className="mt-6 rounded-2xl border border-[#E6E1D3] bg-white p-5">
              <SourceUploader onUploaded={handleUploaded} />
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#E6E1D3] bg-white px-3 py-2.5">
              <Search size={15} className="shrink-0 text-[#A09A8B]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sources..."
                className="min-w-0 flex-1 bg-transparent text-xs text-[#22201A] outline-none placeholder:text-[#A09A8B]"
              />
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-xl border border-[#E6E1D3] bg-white p-1">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition ${
                    statusFilter === filter.value
                      ? "bg-[#F3EFE4] text-[#BD7B24]"
                      : "text-[#75705F] hover:bg-[#F7F4EC]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-[#E6E1D3] bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3EFE4] text-[#BD7B24]">
                <FileText size={19} />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-[#22201A]">No sources found</h2>
              <p className="mt-1.5 text-xs text-[#8A8473]">
                Add a document or video, or adjust your filters.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((document) => {
                const progress = document.progress || 0;
                const status = statusOf(progress);
                const isEditingName = editingDocumentId === document._id;

                return (
                  <div
                    key={document._id}
                    className="group rounded-xl border border-[#E6E1D3] bg-white p-4 transition hover:border-[#D8CDB7] hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedDocument(document)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3EFE4] text-[#BD7B24]"
                      >
                        <FileText size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(document)}
                        className="rounded-md p-1.5 text-[#A09A8B] opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                        title="Delete source"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {isEditingName ? (
                      <div className="mt-4 flex items-center gap-1">
                        <input
                          autoFocus
                          value={editingDocumentName}
                          onChange={(event) => setEditingDocumentName(event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") handleRenameDocument(document);
                            if (event.key === "Escape") setEditingDocumentId(null);
                          }}
                          className="min-w-0 flex-1 rounded-md border border-[#E6E1D3] px-2 py-1 text-sm outline-none focus:border-[#BD7B24]/50"
                        />
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRenameDocument(document);
                          }}
                          className="rounded-md p-1 text-[#55684A] hover:bg-[#EAF0E5]"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditingDocumentId(null);
                          }}
                          className="rounded-md p-1 text-[#A09A8B] hover:bg-[#F7F4EC]"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDocument(document)}
                          className="block min-w-0 flex-1 truncate text-left text-sm font-semibold text-[#22201A] hover:text-[#BD7B24]"
                        >
                          {document.name}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditingDocumentId(document._id);
                            setEditingDocumentName(document.name);
                          }}
                          className="shrink-0 rounded-md p-1 text-[#A09A8B] opacity-0 transition hover:bg-[#F7F4EC] hover:text-[#22201A] group-hover:opacity-100"
                          title="Rename"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-wide text-[#8A8473]">
                        {document.sourceType || document.contentType || "Source"}
                      </span>

                      <select
                        value={document.folder?._id || ""}
                        onChange={(event) => handleMoveToFolder(document, event.target.value)}
                        onClick={(event) => event.stopPropagation()}
                        className="max-w-[110px] truncate rounded-md border border-[#E6E1D3] bg-white px-1.5 py-1 text-[9px] text-[#75705F] outline-none"
                      >
                        <option value="">Unfiled</option>
                        {folders.map((folder) => (
                          <option key={folder._id} value={folder._id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-semibold uppercase tracking-wide ${
                            status === "completed"
                              ? "text-[#55684A]"
                              : status === "in_progress"
                                ? "text-[#BD7B24]"
                                : "text-[#A09A8B]"
                          }`}
                        >
                          {statusLabel(progress)}
                        </span>
                        <span className="text-[9px] text-[#A09A8B]">{progress}%</span>
                      </div>

                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#F3EFE4]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            status === "completed" ? "bg-[#55684A]" : "bg-[#BD7B24]"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={progress}
                        onChange={(event) => handleSetProgress(document, Number(event.target.value))}
                        className="mt-2 w-full accent-[#BD7B24]"
                      />

                      <div className="mt-1 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSetProgress(document, 0)}
                          className="flex-1 rounded-md border border-[#E6E1D3] py-1 text-[9px] text-[#75705F] transition hover:bg-[#F7F4EC]"
                        >
                          Not started
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetProgress(document, progress > 0 && progress < 100 ? progress : 50)}
                          className="flex-1 rounded-md border border-[#E6E1D3] py-1 text-[9px] text-[#75705F] transition hover:bg-[#F7F4EC]"
                        >
                          In progress
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetProgress(document, 100)}
                          className="flex-1 rounded-md border border-[#E6E1D3] py-1 text-[9px] text-[#75705F] transition hover:bg-[#F7F4EC]"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Documents;