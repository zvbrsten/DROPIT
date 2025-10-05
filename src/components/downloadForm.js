import React, { useState, useEffect } from "react";
import axios from "axios";
import API_CONFIG from "../config/api";
import { testBackendConnection, getBackendStatus } from "../utils/connectionTest";

const DownloadForm = () => {
  const [code, setCode] = useState("");
  const [files, setFiles] = useState([]);
  const [filesCount, setFilesCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [downloadURL, setDownloadURL] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState(null);

  // Test backend connection on component mount
  useEffect(() => {
    const checkBackend = async () => {
      const status = await testBackendConnection();
      setBackendStatus(status);
    };
    checkBackend();
  }, []);

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
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILE}/${code}`, {
        timeout: API_CONFIG.TIMEOUT,
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          if (total) {
            const percent = Math.floor((loaded * 100) / total);
            setProgress(percent);
          }
        },
      });
      
      console.log("Download response:", res.data);
      console.log("Files structure:", res.data.files);
      if (res.data.files && res.data.files.length > 0) {
        console.log("First file object:", res.data.files[0]);
        console.log("Available fields:", Object.keys(res.data.files[0]));
      }
      setFiles(res.data.files);
      setFilesCount(res.data.filesCount);
      setTotalSize(res.data.totalSize);
      setDownloadURL(res.data.downloadURL || "");
    } catch (err) {
      let errorMessage = "An error occurred while fetching files";
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage = "Request timed out. The server may be unavailable. Please try again.";
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        errorMessage = "Cannot connect to server. Please check your internet connection and try again.";
      } else if (err.response?.status === 404) {
        errorMessage = "Download code not found. Please check the code and try again.";
      } else if (err.response?.status === 410) {
        errorMessage = "Download link has expired. Please request a new code.";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error("Download error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async (file) => {
    try {
      console.log("Downloading file:", file.filename);
      console.log("File object:", file);
      
      // For AWS S3 pre-signed URLs, we need to get a fresh download URL for this specific file
      // The backend should provide individual download URLs for each file
      let downloadUrl;
      
      // Check if the file has its own download URL
      if (file.downloadUrl || file.url || file.signedUrl) {
        downloadUrl = file.downloadUrl || file.url || file.signedUrl;
        console.log("Using file-specific download URL:", downloadUrl);
      } else if (downloadURL) {
        // If there's a general download URL, we might need to append the file identifier
        downloadUrl = downloadURL;
        console.log("Using general download URL:", downloadUrl);
      } else {
        // Fallback: Request a new download URL from the backend
        console.log("Requesting fresh download URL from backend...");
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOWNLOAD}/${file.id || file._id || file.filename}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to get download URL: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        downloadUrl = data.downloadUrl || data.url || data.signedUrl;
        console.log("Received fresh download URL:", downloadUrl);
      }
      
      if (!downloadUrl) {
        throw new Error("No download URL available for this file.");
      }
      
      // Download the file using the pre-signed URL
      const response = await fetch(downloadUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      });
      
      if (!response.ok) {
        let errorMsg = `Failed to download: ${response.status} ${response.statusText}`;
        
        if (response.status === 403) {
          errorMsg = "Download link has expired or is invalid. Please request a new code.";
        } else if (response.status === 404) {
          errorMsg = "File not found. It may have been deleted or expired.";
        } else if (response.status === 410) {
          errorMsg = "Download link has expired. Please request a new code.";
        }
        
        throw new Error(errorMsg);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename || file.name || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("Download completed:", file.filename);
    } catch (err) {
      console.error("Download failed:", err);
      alert(`Failed to download ${file.filename || 'file'}: ${err.message}`);
    }
  };

  const downloadAllFiles = async () => {
    try {
      // If there's a main download URL, use it to download all files at once
      if (downloadURL) {
        console.log("Downloading all files using main download URL:", downloadURL);
        const response = await fetch(downloadURL, {
          method: 'GET',
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to download all files: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dropit-files-${code}.zip`; // Assume it's a zip file
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log("All files downloaded successfully");
      } else {
        // Fallback: Download files individually
        console.log("No main download URL, downloading files individually...");
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log(`Downloading file ${i + 1}/${files.length}: ${file.filename}`);
          await downloadFile(file);
          
          // Add a small delay between downloads to avoid overwhelming the browser
          if (i < files.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    } catch (err) {
      console.error("Download all failed:", err);
      alert(`Failed to download all files: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ 
          fontSize: "32px", 
          fontWeight: "300", 
          color: "#2c3e50", 
          margin: "0 0 8px 0",
          letterSpacing: "-0.5px"
        }}>
          Download Files
        </h1>
        <p style={{ 
          color: "#7f8c8d", 
          fontSize: "16px", 
          margin: "0",
          fontWeight: "300"
        }}>
          Enter your download code to access your files
        </p>
        {backendStatus && (
          <div style={{ 
            marginTop: "16px",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            backgroundColor: backendStatus.success ? "#d4edda" : "#f8d7da",
            color: backendStatus.success ? "#155724" : "#721c24",
            border: `1px solid ${backendStatus.success ? "#c3e6cb" : "#f5c6cb"}`
          }}>
            Backend Status: {backendStatus.success ? "Connected" : `Disconnected - ${backendStatus.error}`}
          </div>
        )}
      </div>

      <form onSubmit={handleDownload} style={{ marginBottom: "40px" }}>
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          maxWidth: "500px", 
          margin: "0 auto" 
        }}>
          <input
            type="text"
            placeholder="Enter download code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            style={{ 
              flex: 1,
              padding: "16px 20px", 
              fontSize: "16px", 
              border: "none", 
              borderRadius: "12px",
              backgroundColor: "#f8f9fa",
              color: "#2c3e50",
              outline: "none",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = "#f8f9fa";
              e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
            }}
          />
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              padding: "16px 32px", 
              backgroundColor: isLoading ? "#bdc3c7" : "#3498db", 
              color: "white", 
              border: "none", 
              borderRadius: "12px", 
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              boxShadow: isLoading ? "none" : "0 4px 16px rgba(52, 152, 219, 0.3)",
              minWidth: "140px"
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 6px 20px rgba(52, 152, 219, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 16px rgba(52, 152, 219, 0.3)";
              }
            }}
          >
            {isLoading ? "Loading..." : "Get Files"}
          </button>
        </div>
      </form>

      {isLoading && progress > 0 && (
        <div style={{ 
          maxWidth: "500px", 
          margin: "0 auto 40px auto",
          padding: "0 20px"
        }}>
          <div style={{ 
            width: "100%", 
            height: "6px", 
            backgroundColor: "#ecf0f1", 
            borderRadius: "3px", 
            overflow: "hidden",
            marginBottom: "8px"
          }}>
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #3498db, #2980b9)",
                borderRadius: "3px",
                transition: "width 0.3s ease",
                boxShadow: "0 0 10px rgba(52, 152, 219, 0.3)"
              }}
            ></div>
          </div>
          <p style={{ 
            fontSize: "14px", 
            textAlign: "center", 
            color: "#7f8c8d",
            margin: "0",
            fontWeight: "500"
          }}>
            {progress}% complete
          </p>
        </div>
      )}

      {error && (
        <div style={{ 
          maxWidth: "500px",
          margin: "0 auto 40px auto",
          padding: "20px", 
          backgroundColor: "#fff5f5", 
          color: "#e74c3c", 
          borderRadius: "12px",
          textAlign: "center"
        }}>
          <div style={{ fontWeight: "500", marginBottom: "8px" }}>Download Error</div>
          <div style={{ fontSize: "14px", opacity: "0.8" }}>{error}</div>
          {error.includes("expired") && (
            <div style={{ 
              marginTop: "12px", 
              fontSize: "13px", 
              opacity: "0.7",
              fontStyle: "italic"
            }}>
              Try fetching the files again
            </div>
          )}
        </div>
      )}

      {files.length > 0 && (
        <div style={{ 
          maxWidth: "600px", 
          margin: "0 auto"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "24px",
            padding: "0 20px"
          }}>
            <div>
              <h2 style={{ 
                fontSize: "24px", 
                fontWeight: "300", 
                color: "#2c3e50", 
                margin: "0 0 4px 0"
              }}>
                {filesCount} File{filesCount !== 1 ? 's' : ''} Ready
              </h2>
              <p style={{ 
                color: "#7f8c8d", 
                margin: "0", 
                fontSize: "14px",
                fontWeight: "300"
              }}>
                Total size: {formatFileSize(totalSize)}
              </p>
            </div>
            {files.length > 1 && (
              <button
                onClick={downloadAllFiles}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#27ae60",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 16px rgba(39, 174, 96, 0.3)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(39, 174, 96, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 16px rgba(39, 174, 96, 0.3)";
                }}
              >
                Download All
              </button>
            )}
          </div>

          <div style={{ 
            display: "grid", 
            gap: "12px",
            padding: "0 20px"
          }}>
            {files.map((file, index) => (
              <div 
                key={index} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "20px", 
                  backgroundColor: "#ffffff", 
                  borderRadius: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: "500", 
                    marginBottom: "6px", 
                    color: "#2c3e50",
                    fontSize: "16px"
                  }}>
                    {file.filename}
                  </div>
                  <div style={{ 
                    fontSize: "13px", 
                    color: "#95a5a6",
                    fontWeight: "300"
                  }}>
                    {formatFileSize(file.fileSize)} • {file.mimeType}
                  </div>
                </div>
                <button
                  onClick={() => downloadFile(file)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(52, 152, 219, 0.3)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#2980b9";
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(52, 152, 219, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#3498db";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 8px rgba(52, 152, 219, 0.3)";
                  }}
                >
                  Download
                </button>
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: "32px", 
            padding: "16px 20px", 
            backgroundColor: "#f8f9fa", 
            color: "#6c757d", 
            borderRadius: "10px",
            fontSize: "13px",
            textAlign: "center",
            fontWeight: "300"
          }}>
            Download links are generated fresh each time you fetch files
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadForm;


