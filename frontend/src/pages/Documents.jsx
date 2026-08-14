import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  getAllDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from "../services/documentService";
import ConfirmDialog from "../components/ConfirmDialog";

import "../styles/Documents.css";

function formatSize(bytes) {
  if (!bytes) return "0 KB";

  const kb = bytes / 1024;

  if (kb < 1024) return `${kb.toFixed(1)} KB`;

  return `${(kb / 1024).toFixed(1)} MB`;
}

function Documents() {
  const [documents, setDocuments] = useState([]);

  const [title, setTitle] = useState("");

  const [category, setCategory] = useState("Other");

  const [file, setFile] = useState(null);

  const [uploading, setUploading] = useState(false);

  const [confirmDoc, setConfirmDoc] = useState(null);

  const loadDocuments = async () => {
    try {
      const res = await getAllDocuments();

      setDocuments(res.documents || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadDocuments();
    })();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please choose a file");

      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("title", title || file.name);

      formData.append("category", category);

      formData.append("file", file);

      await uploadDocument(formData);

      toast.success("Document Uploaded");

      setTitle("");

      setCategory("Other");

      setFile(null);

      e.target.reset();

      await loadDocuments();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Upload Failed");
    }

    setUploading(false);
  };

  const handleDownload = async (doc) => {
    try {
      await downloadDocument(doc._id, doc.originalName);
    } catch (error) {
      console.log(error);

      toast.error("Download Failed");
    }
  };

  const handleDelete = (doc) => {
    setConfirmDoc(doc);
  };

  const confirmDeleteDoc = async () => {
    try {
      await deleteDocument(confirmDoc._id);

      await loadDocuments();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Delete Failed");
    }

    setConfirmDoc(null);
  };

  return (
    <div className="documents-page">
      <div className="page-header">
        <div>
          <h1>Documents</h1>

          <p>Contracts, Invoices & Files</p>
        </div>
      </div>

      <div className="upload-card">
        <h2>Upload Document</h2>

        <form className="upload-form" onSubmit={handleUpload}>
          <div className="form-group">
            <label>Title</label>

            <input
              type="text"
              placeholder="Document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Category</label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Contract</option>
              <option>Invoice</option>
              <option>Proposal</option>
              <option>ID Proof</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>File</label>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>

          <button type="submit" className="upload-btn" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>

      <table className="documents-table">
        <thead>
          <tr>
            <th>Title</th>

            <th>Category</th>

            <th>Size</th>

            <th>Uploaded By</th>

            <th>Date</th>

            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {documents.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                style={{ textAlign: "center", padding: "30px" }}
              >
                No Documents Found
              </td>
            </tr>
          ) : (
            documents.map((doc) => (
              <tr key={doc._id}>
                <td>
                  <strong>{doc.title}</strong>
                </td>

                <td>
                  <span className="category">{doc.category}</span>
                </td>

                <td>{formatSize(doc.fileSize)}</td>

                <td>{doc.uploadedBy?.fullName || "N/A"}</td>

                <td>
                  {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                </td>

                <td>
                  <button
                    className="download-btn"
                    onClick={() => handleDownload(doc)}
                  >
                    Download
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(doc)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ConfirmDialog
        open={!!confirmDoc}
        title="Delete Document"
        message={`Are you sure you want to delete "${confirmDoc?.title}"?`}
        onConfirm={confirmDeleteDoc}
        onClose={() => setConfirmDoc(null)}
      />
    </div>
  );
}

export default Documents;
