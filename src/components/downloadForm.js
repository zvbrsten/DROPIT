import React, { useState } from "react";
import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "https://dropit-backend-three.vercel.app";

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function DownloadForm() {
  const [code, setCode] = useState("");
  const [files, setFiles] = useState([]);
  const [filesCount, setFilesCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!code) return;

    setIsLoading(true);
    setError("");
    setFiles([]);
    setProgress(0);

    try {
      const res = await axios.get(`${BACKEND}/api/file/${encodeURIComponent(code)}`, {
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          if (total) {
            const percent = Math.floor((loaded * 100) / total);
            setProgress(percent);
          }
        },
      });

      setFiles(res.data.files || []);
      setFilesCount(res.data.filesCount || (res.data.files || []).length);
      setTotalSize(res.data.totalSize || 0);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An error occurred while fetching files";
      setError(errorMessage);
      console.error("Download error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async (file) => {
    try {
      const response = await fetch(file.downloadUrl);

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert(`Failed to download ${file.filename}: ${err.message}`);
    }
  };

  const downloadAllFiles = async () => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await downloadFile(file);
      if (i < files.length - 1) await new Promise(resolve => setTimeout(resolve, 700));
    }
  };

  return (
    <div style={{
      backgroundColor: "#1e1e1e",
      padding: "20px",
      borderRadius: "10px",
      maxWidth: "600px",
      margin: "auto",
      color: "#fff",
      boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    }}>
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "15px", textAlign: "center" }}>
        Retrieve Files
      </h2>
      <form onSubmit={handleDownload}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          type="text"
          placeholder="Enter download code"
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: 'rgba(255,255,255,0.02)',
            color: '#e6eef8',
            fontSize: '15px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <button type="submit" disabled={isLoading} style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "none",
          fontWeight: 700,
          fontSize: "15px",
          cursor: "pointer",
          marginTop: "10px",
          background: isLoading ? "#555" : "#007bff",
          color: "white"
        }}>
          {isLoading ? 'Fetching Files...' : 'Get Files'}
        </button>
      </form>

      {isLoading && progress > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, transition: 'width 0.4s ease', background: 'linear-gradient(90deg,#27d39a,#06b6d4)' }} />
          </div>
          <p style={{ textAlign: 'right', fontSize: '12px', color: '#9fb3cf', marginTop: '6px' }}>{progress}%</p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(128,0,0,0.18)', border: '1px solid rgba(255,100,100,0.08)', color: '#ffdada' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {files.length > 0 && (
        <div style={{ marginTop: '18px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#ecf6ff' }}>Found {filesCount} File{filesCount !== 1 ? 's' : ''}</h2>
          <p style={{ margin: '6px 0 0 0', color: '#9fb3cf', fontSize: '13px' }}>Total Size: {formatFileSize(totalSize)}</p>
          <div style={{ marginTop: '12px' }}>
            {files.map((file, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', marginTop: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#ecf6ff' }}>{file.filename}</div>
                  <div style={{ fontSize: '13px', color: '#9fb3cf' }}>{formatFileSize(file.fileSize)} • {file.mimeType}</div>
                </div>
                <button onClick={() => downloadFile(file)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer' }}>Download</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
