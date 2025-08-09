import React, { useState } from "react";
import axios from "axios";

// Change this to your deployed backend if needed
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

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('xml')) {
        const text = await response.text();
        if (text.includes('<Error>')) {
          throw new Error('Download link has expired. Please fetch files again.');
        }
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

  // Basic styles (no external CSS frameworks required)
  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg,#07112a 0%, #04263a 100%)',
      padding: '24px',
      boxSizing: 'border-box'
    },
    card: {
      width: '100%',
      maxWidth: '920px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '14px',
      padding: '20px',
      color: '#e6eef8',
      boxShadow: '0 10px 30px rgba(2,6,23,0.6)'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    title: { margin: 0, fontSize: '22px', fontWeight: 800 },
    subtitle: { margin: 0, fontSize: '13px', color: '#9fb3cf' },
    formRow: { marginTop: '12px' },
    input: {
      width: '100%',
      padding: '12px 14px',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.02)',
      color: '#e6eef8',
      fontSize: '15px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    primaryBtn: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: 'none',
      fontWeight: 700,
      fontSize: '15px',
      cursor: 'pointer',
      marginTop: '10px',
      background: 'linear-gradient(90deg,#5b8cff,#b36bff)',
      color: 'white'
    },
    progressOuter: { marginTop: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', height: '10px', overflow: 'hidden' },
    progressInner: (percent) => ({ height: '100%', width: `${percent}%`, transition: 'width 0.4s ease', background: 'linear-gradient(90deg,#27d39a,#06b6d4)' }),
    fileCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', marginTop: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' },
    fileName: { fontWeight: 600, color: '#ecf6ff' },
    fileMeta: { fontSize: '13px', color: '#9fb3cf' },
    dangerBox: { marginTop: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(128,0,0,0.18)', border: '1px solid rgba(255,100,100,0.08)', color: '#ffdada' },
    noteBox: { marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', color: '#cbe3ff', fontSize: '13px' }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>DropIt — Retrieve Files</h1>
            <p style={styles.subtitle}>Enter a download code to fetch files. Links are short-lived.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)' }}>Secure</div>
          </div>
        </div>

        <form onSubmit={handleDownload}>
          <div style={styles.formRow}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              type="text"
              placeholder="Enter download code"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={isLoading} style={{ ...styles.primaryBtn, opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer' }}>
            {isLoading ? 'Fetching Files...' : 'Get Files'}
          </button>
        </form>

        {isLoading && progress > 0 && (
          <div style={{ marginTop: '12px' }}>
            <div style={styles.progressOuter}>
              <div style={styles.progressInner(progress)} />
            </div>
            <p style={{ textAlign: 'right', fontSize: '12px', color: '#9fb3cf', marginTop: '6px' }}>{progress}%</p>
          </div>
        )}

        {error && (
          <div style={styles.dangerBox}>
            <strong>Error:</strong> {error}
            {error.toLowerCase().includes('expired') && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#ffdada' }}>The download links may have expired. Try fetching the files again.</div>
            )}
          </div>
        )}

        {files.length > 0 && (
          <div style={{ marginTop: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', color: '#ecf6ff' }}>Found {filesCount} File{filesCount !== 1 ? 's' : ''}</h2>
                <p style={{ margin: '6px 0 0 0', color: '#9fb3cf', fontSize: '13px' }}>Total Size: {formatFileSize(totalSize)}</p>
              </div>

              <div>
                {files.length > 1 && (
                  <button onClick={downloadAllFiles} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer' }}>Download All</button>
                )}
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              {files.map((file, idx) => (
                <div key={idx} style={styles.fileCard}>
                  <div>
                    <div style={styles.fileName}>{file.filename}</div>
                    <div style={styles.fileMeta}>{formatFileSize(file.fileSize)} • {file.mimeType}</div>
                  </div>
                  <div>
                    <button onClick={() => downloadFile(file)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer' }}>Download</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.noteBox}>
              <strong>Note:</strong> Download links are generated fresh each time you fetch files. If a download fails due to expiration, re-fetch to get fresh signed URLs.
            </div>
          </div>
        )}

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#9fb3cf' }}>Made with care — DropIt</div>
      </div>
    </div>
  );
}
