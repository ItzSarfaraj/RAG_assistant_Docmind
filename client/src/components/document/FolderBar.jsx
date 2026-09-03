import {
  Check,
  Folder as FolderIcon,
  FolderPlus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

function FolderBar({
  documents,
  folders,
  activeFolder,
  setActiveFolder,
  creatingFolder,
  setCreatingFolder,
  newFolderName,
  setNewFolderName,
  editingFolderId,
  setEditingFolderId,
  editingFolderName,
  setEditingFolderName,
  handleCreateFolder,
  handleRenameFolder,
  handleDeleteFolder,
}) {
  const unfiledCount = documents.filter(
    (document) => !document.folder,
  ).length;

  return (
    <div className="mt-8 rounded-2xl border border-[#E6E1D3] bg-white p-2 shadow-[0_2px_8px_rgba(34,32,26,0.03)]">
      <div className="flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveFolder("all")}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-semibold transition ${
            activeFolder === "all"
              ? "bg-[#22201A] text-white shadow-sm"
              : "text-[#75705F] hover:bg-[#F7F4EC]"
          }`}
        >
          All sources
          <span className={activeFolder === "all" ? "text-white/50" : "text-[#A09A8B]"}>
            {documents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFolder("unfiled")}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-semibold transition ${
            activeFolder === "unfiled"
              ? "bg-[#22201A] text-white shadow-sm"
              : "text-[#75705F] hover:bg-[#F7F4EC]"
          }`}
        >
          Unfiled
          <span className={activeFolder === "unfiled" ? "text-white/50" : "text-[#A09A8B]"}>
            {unfiledCount}
          </span>
        </button>

        <div className="mx-2 h-6 w-px shrink-0 bg-[#E6E1D3]" />

        <span className="shrink-0 px-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#A09A8B]">
          Folders
        </span>

        {folders.map((folder) => (
          <div
            key={folder._id}
            className={`group flex shrink-0 items-center rounded-xl transition ${
              activeFolder === folder._id
                ? "bg-[#F3EFE4]"
                : "hover:bg-[#F7F4EC]"
            }`}
          >
            {editingFolderId === folder._id ? (
              <div className="flex items-center gap-1 px-2 py-1">
                <input
                  autoFocus
                  value={editingFolderName}
                  onChange={(event) =>
                    setEditingFolderName(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleRenameFolder(folder._id);
                    }

                    if (event.key === "Escape") {
                      setEditingFolderId(null);
                    }
                  }}
                  className="w-32 rounded-lg border border-[#E6E1D3] px-2 py-1.5 text-[10px] outline-none focus:border-[#BD7B24]/50"
                />

                <button
                  type="button"
                  onClick={() => handleRenameFolder(folder._id)}
                  className="rounded-md p-1 text-[#55684A] hover:bg-[#EAF0E5]"
                >
                  <Check size={12} />
                </button>

                <button
                  type="button"
                  onClick={() => setEditingFolderId(null)}
                  className="rounded-md p-1 text-[#A09A8B] hover:bg-[#F7F4EC]"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveFolder(folder._id)}
                  className="flex items-center gap-2 px-3.5 py-2.5 text-[10px] font-medium text-[#75705F]"
                >
                  <FolderIcon
                    size={13}
                    style={{ color: folder.color }}
                  />

                  <span>{folder.name}</span>

                  <span className="text-[9px] text-[#A09A8B]">
                    {folder.documentCount}
                  </span>
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
                  <Pencil size={11} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteFolder(folder)}
                  className="hidden rounded-md p-1 text-[#A09A8B] hover:bg-white hover:text-red-500 group-hover:block"
                  title="Delete"
                >
                  <Trash2 size={11} />
                </button>
              </>
            )}
          </div>
        ))}

        {creatingFolder ? (
          <div className="flex shrink-0 items-center gap-1">
            <input
              autoFocus
              value={newFolderName}
              onChange={(event) =>
                setNewFolderName(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") handleCreateFolder();
                if (event.key === "Escape") setCreatingFolder(false);
              }}
              placeholder="Folder name"
              className="w-32 rounded-lg border border-[#E6E1D3] px-2 py-1.5 text-[10px] outline-none focus:border-[#BD7B24]/50"
            />

            <button
              type="button"
              onClick={handleCreateFolder}
              className="rounded-md p-1 text-[#55684A] hover:bg-[#EAF0E5]"
            >
              <Check size={12} />
            </button>

            <button
              type="button"
              onClick={() => setCreatingFolder(false)}
              className="rounded-md p-1 text-[#A09A8B] hover:bg-[#F7F4EC]"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreatingFolder(true)}
            className="ml-1 flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2.5 text-[10px] font-medium text-[#A09A8B] transition hover:bg-[#F7F4EC] hover:text-[#BD7B24]"
          >
            <FolderPlus size={13} />
            New folder
          </button>
        )}
      </div>
    </div>
  );
}

export default FolderBar;