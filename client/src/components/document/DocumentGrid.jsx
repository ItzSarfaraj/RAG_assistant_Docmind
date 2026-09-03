import DocumentCard from "./DocumentCard";

function DocumentGrid({
  documents,
  folders,
  editingDocumentId,
  editingDocumentName,
  setEditingDocumentId,
  setEditingDocumentName,
  handleRenameDocument,
  handleDelete,
  handleMoveToFolder,
  handleSetProgress,
  onSelect,
}) {
  return (
    <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {documents.map((document) => (
        <DocumentCard
          key={document._id}
          document={document}
          folders={folders}
          editingDocumentId={editingDocumentId}
          editingDocumentName={editingDocumentName}
          setEditingDocumentId={setEditingDocumentId}
          setEditingDocumentName={setEditingDocumentName}
          handleRenameDocument={handleRenameDocument}
          handleDelete={handleDelete}
          handleMoveToFolder={handleMoveToFolder}
          handleSetProgress={handleSetProgress}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default DocumentGrid;