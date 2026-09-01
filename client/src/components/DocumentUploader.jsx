import { useState } from "react";
import { uploadDocument } from "../services/documentService";

function DocumentUploader({ onDocumentUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a document.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await uploadDocument(file, token);

      // Send indexed document to parent
      onDocumentUploaded(result.document);

      setFile(null);
    } catch (error) {
      console.error(error);

      setError(error.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf,.txt,.docx"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Process Document"}
      </button>

      {error && <p>{error}</p>}
    </div>
  );
}

export default DocumentUploader;
