import { useEffect, useState } from "react";

import SourceUploader from "../components/SourceUploader";
import ChatWindow from "../components/ChatWindow";
import DocumentPreview from "../components/DocumentPreview";

import { getDocuments, deleteDocument } from "../services/documentService";

function Workspace() {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(true);
  const [videoSeekTime, setVideoSeekTime] = useState(null);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const data = await getDocuments(token);
        setDocuments(data.documents || []);
      } catch (error) {
        console.error("Failed to load documents:", error);
      }
    };

    loadDocuments();
  }, []);

  const handleDocumentUploaded = (document) => {
    setDocuments((previous) => [document, ...previous]);
    setSelectedDocument(document);
    setDocumentPreviewOpen(true);
    setVideoSeekTime(null);
  };

  const handleNewDocument = () => {
    setSelectedDocument(null);
    setDocumentPreviewOpen(true);
    setVideoSeekTime(null);
  };

  const handleDeleteDocument = async (document) => {
    const confirmed = window.confirm(`Delete "${document.name}"?`);

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      await deleteDocument(document._id, token);

      setDocuments((previous) =>
        previous.filter((item) => item._id !== document._id),
      );

      if (selectedDocument?._id === document._id) {
        setSelectedDocument(null);
        setDocumentPreviewOpen(true);
        setVideoSeekTime(null);
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      window.alert(error.message || "Failed to delete document.");
    }
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-[#F7F4EC]">
      <div className="min-w-0 flex-1 overflow-y-auto">
        {selectedDocument ? (
          <ChatWindow
            document={selectedDocument}
            onTimestampClick={setVideoSeekTime}
          />
        ) : (
          <SourceUploader onUploaded={handleDocumentUploaded} />
        )}
      </div>

      {selectedDocument && documentPreviewOpen && (
        <DocumentPreview
          document={selectedDocument}
          onClose={() => setDocumentPreviewOpen(false)}
          seekTime={videoSeekTime}
        />
      )}
    </div>
  );
}

export default Workspace;