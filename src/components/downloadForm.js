import React, { useState } from "react";
import axios from "axios";

const DownloadForm = () => {
  const [code, setCode] = useState("");
  const [files, setFiles] = useState([]);
  const [filesCount, setFilesCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!code) return;

    setIsLoading(true);
    setError("");
    setFiles([]);
    setProgress(0);

    try {
      const res = await axios.get(`https://dropit-sepia.vercel.app/api/file/${code}`, {
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          if (total) {
            const percent = Math.floor((loaded * 100) / total);
            setProgress(percent);
          }
        },
      });
      
      console.log("📥 Download response:", res.data);
      setFiles(res.data.files);
      setFilesCount(res.data.filesCount);
      setTotalSize(res.data.totalSize);
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
      console.log("🔗 Downloading file:", file.filename, "URL:", file.downloadUrl);
      
      // First, try to fetch the file to check if URL is valid
      const response = await fetch(file.downloadUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }

      // Check if response is an error XML (S3 error)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('xml')) {
        const text = await response.text();
        if (text.includes('<Error>')) {
          throw new Error('Download link has expired. Please fetch files again.');
        }
      }

      // Create blob and download
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
      
      console.log("✅ Download completed:", file.filename);
    } catch (err) {
      console.error("Download failed:", err);
      alert(`Failed to download ${file.filename}: ${err.message}`);
    }
  };

  const downloadAllFiles = async () => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`⬇️ Downloading file ${i + 1}/${files.length}: ${file.filename}`);
      await downloadFile(file);
      
      // Add a small delay between downloads to avoid overwhelming the browser
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>Download Files</h2>
      <form onSubmit={handleDownload}>
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Enter download code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            style={{ 
              width: "100%", 
              padding: "10px", 
              fontSize: "16px", 
              border: "1px solid #ddd", 
              borderRadius: "5px" 
            }}
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: isLoading ? "#ccc" : "#28a745", 
            color: "white", 
            border: "none", 
            borderRadius: "5px", 
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "16px",
            width: "100%"
          }}
        >
          {isLoading ? "Fetching Files..." : "Get Files"}
        </button>
      </form>

      {isLoading && progress > 0 && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ width: "100%", backgroundColor: "#f1f1f1", borderRadius: "4px", overflow: "hidden" }}>
            <div
              style={{
                width: `${progress}%`,
                height: "10px",
                backgroundColor: "#28a745",
                borderRadius: "4px",
                transition: "width 0.2s",
              }}
            ></div>
          </div>
          <p style={{ fontSize: "14px", textAlign: "center", marginTop: "5px" }}>{progress}%</p>
        </div>
      )}

      {error && (
        <div style={{ 
          marginTop: "20px", 
          padding: "15px", 
          backgroundColor: "#f8d7da", 
          color: "#721c24", 
          border: "1px solid #f5c6cb", 
          borderRadius: "5px" 
        }}>
          <strong>Error:</strong> {error}
          {error.includes("expired") && (
            <div style={{ marginTop: "10px", fontSize: "14px" }}>
              <em>The download links may have expired. Try fetching the files again.</em>
            </div>
          )}
        </div>
      )}

      {files.length > 0 && (
        <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3>Found {filesCount} File{filesCount !== 1 ? 's' : ''}</h3>
              <p style={{ color: "#666", margin: "5px 0" }}>Total Size: {formatFileSize(totalSize)}</p>
            </div>
            {files.length > 1 && (
              <button
                onClick={downloadAllFiles}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Download All
              </button>
            )}
          </div>

          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {files.map((file, index) => (
              <div 
                key={index} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "15px", 
                  backgroundColor: "white", 
                  margin: "8px 0", 
                  borderRadius: "8px",
                  border: "1px solid #e9ecef"
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{file.filename}</div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    {formatFileSize(file.fileSize)} • {file.mimeType}
                  </div>
                </div>
                <button
                  onClick={() => downloadFile(file)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginLeft: "15px"
                  }}
                >
                  Download
                </button>
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: "20px", 
            padding: "15px", 
            backgroundColor: "#fff3cd", 
            color: "#856404", 
            border: "1px solid #ffeaa7", 
            borderRadius: "5px",
            fontSize: "14px"
          }}>
            <strong>Note:</strong> Download links are generated fresh each time you fetch files. If a download fails due to expiration, try fetching the files again.
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadForm;

