import { useState, useEffect } from "react";

import Sidebar, { MenuIcon } from "../components/Sidebar";
import Header from "../components/Header";
import SourceUploader from "../components/SourceUploader";
import ChatWindow from "../components/ChatWindow";
import DocumentPreview from "../components/DocumentPreview";
import { Mark } from "../components/Icons";

import { getDocuments, deleteDocument } from "../services/documentService";

function Dashboard({ user, onLogout }) {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(true);
  const [videoSeekTime, setVideoSeekTime] = useState(null);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

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
  };

  const handleNewDocument = () => {
    setSelectedDocument(null);
  };

  const handleDeleteDocument = async (document) => {
    const confirmed = window.confirm(`Delete "${document.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      await deleteDocument(document._id, token);

      setDocuments((previous) =>
        previous.filter((item) => item._id !== document._id),
      );

      if (selectedDocument?._id === document._id) {
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert(error.message || "Failed to delete document.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F4EC] text-[#22201A]">
      <Sidebar
        documents={documents}
        selectedDocument={selectedDocument}
        onSelectDocument={(document) => {
          setSelectedDocument(document);
          setDocumentPreviewOpen(true);
        }}
        onNewDocument={handleNewDocument}
        onDeleteDocument={handleDeleteDocument}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-3 border-b border-[#E6E1D3] bg-white px-4 py-2.5 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-[#75705F] transition hover:bg-[#F7F4EC] hover:text-[#22201A]"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          <div className="flex items-center gap-1.5 text-[#75705F]">
            <span className="font-[Fraunces] text-base leading-none text-[#BD7B24]">
              <Mark />
            </span>

            <span className="truncate text-sm font-medium">
              {selectedDocument?.name || "DocMind"}
            </span>
          </div>
        </div>

        <Header user={user} onLogout={onLogout} />

        <main className="flex min-h-0 flex-1 overflow-hidden">
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
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
