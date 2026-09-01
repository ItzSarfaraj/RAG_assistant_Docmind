import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar, { MenuIcon } from "../components/Sidebar";
import Header from "../components/Header";
import SourceUploader from "../components/SourceUploader";
import ChatWindow from "../components/ChatWindow";
import DocumentPreview from "../components/DocumentPreview";
import { Mark } from "../components/Icons";

import { getDocuments, deleteDocument } from "../services/documentService";

import { getNotes, deleteNote } from "../services/noteService";

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const [selectedDocument, setSelectedDocument] = useState(null);

  const [documents, setDocuments] = useState([]);

  const [notes, setNotes] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(true);

  const [videoSeekTime, setVideoSeekTime] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Load Documents + Notes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const [documentsData, notesData] = await Promise.all([
          getDocuments(token),
          getNotes(token),
        ]);

        setDocuments(documentsData.documents || []);

        setNotes(notesData.notes || []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };

    loadDashboardData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Document Uploaded
  |--------------------------------------------------------------------------
  */

  const handleDocumentUploaded = (document) => {
    setDocuments((previous) => [document, ...previous]);

    setSelectedDocument(document);

    setDocumentPreviewOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | New Document
  |--------------------------------------------------------------------------
  */

  const handleNewDocument = () => {
    setSelectedDocument(null);

    setDocumentPreviewOpen(true);

    setSidebarOpen(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Select Document
  |--------------------------------------------------------------------------
  */

  const handleSelectDocument = (document) => {
    setSelectedDocument(document);

    setDocumentPreviewOpen(true);

    setSidebarOpen(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Document
  |--------------------------------------------------------------------------
  */

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

      /*
       * Remove document from sidebar.
       */

      setDocuments((previous) =>
        previous.filter((item) => item._id !== document._id),
      );

      /*
       * If deleted document was selected,
       * clear current workspace.
       */

      if (selectedDocument?._id === document._id) {
        setSelectedDocument(null);

        setDocumentPreviewOpen(true);
      }

      /*
       * Refresh notes because notes
       * belonging to deleted document
       * may no longer be valid.
       */

      const notesData = await getNotes(token);

      setNotes(notesData.notes || []);
    } catch (error) {
      console.error("Failed to delete document:", error);

      alert(error.message || "Failed to delete document.");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Open Note
  |--------------------------------------------------------------------------
  */

  const handleSelectNote = (note) => {
    if (!note?._id) {
      return;
    }

    setSidebarOpen(false);

    navigate(`/notes/${note._id}`);
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Note
  |--------------------------------------------------------------------------
  */

  const handleDeleteNote = async (note) => {
    if (!note?._id) {
      return;
    }

    const confirmed = window.confirm(
      `Remove "${note.title || "Generated Notes"}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      await deleteNote(note._id, token);

      /*
       * Remove note immediately
       * from sidebar state.
       */

      setNotes((previous) => previous.filter((item) => item._id !== note._id));
    } catch (error) {
      console.error("Failed to delete note:", error);

      alert(error.message || "Failed to delete note.");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F4EC] text-[#22201A]">
      {/* =========================================================
          LEFT SIDEBAR
      ========================================================== */}

      <Sidebar
        documents={documents}
        notes={notes}
        selectedDocument={selectedDocument}
        onSelectDocument={handleSelectDocument}
        onSelectNote={handleSelectNote}
        onNewDocument={handleNewDocument}
        onDeleteDocument={handleDeleteDocument}
        onDeleteNote={handleDeleteNote}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* =========================================================
          MAIN APPLICATION AREA
      ========================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* =======================================================
            MOBILE TOP BAR
        ======================================================== */}

        <div className="flex shrink-0 items-center gap-3 border-b border-[#E6E1D3] bg-white px-4 py-2.5 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-[#75705F] transition hover:bg-[#F7F4EC] hover:text-[#22201A]"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          <div className="flex min-w-0 items-center gap-1.5 text-[#75705F]">
            <span className="font-[Fraunces] text-base leading-none text-[#BD7B24]">
              <Mark />
            </span>

            <span className="truncate text-sm font-medium">
              {selectedDocument?.name || "DocMind"}
            </span>
          </div>
        </div>

        {/* =======================================================
            HEADER
        ======================================================== */}

        <Header user={user} onLogout={onLogout} />

        {/* =======================================================
            MAIN CONTENT
        ======================================================== */}

        <main className="flex min-h-0 flex-1 overflow-hidden">
          {/* =====================================================
              CHAT / UPLOAD AREA
          ====================================================== */}

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

          {/* =====================================================
              DOCUMENT PREVIEW
          ====================================================== */}

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
