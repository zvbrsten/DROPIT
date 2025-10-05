import React, { useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import API_CONFIG from "../config/api";

const UploadForm = () => {
  const [files, setFiles] = useState([]);
  const [code, setCode] = useState("");
  const [downloadURL, setDownloadURL] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    // Reset previous upload data when new files are selected
    setCode("");
    setDownloadURL("");
    setUploadedFiles([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) return alert("Please select at least one file");

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      setIsUploading(true);
      setProgress(0);
      
      const res = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD}`, formData, {
        timeout: API_CONFIG.TIMEOUT,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percent = Math.floor((loaded * 100) / total);
          setProgress(percent);
        },
      });

      setCode(res.data.code);
      setDownloadURL(res.data.downloadURL);
      setUploadedFiles(res.data.files);
    } catch (err) {
      let errorMessage = "Upload failed";
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage = "Upload timed out. The server may be unavailable. Please try again.";
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        errorMessage = "Cannot connect to server. Please check your internet connection and try again.";
      } else if (err.response?.status === 413) {
        errorMessage = "File too large. Please select smaller files.";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

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
          Upload Files
        </h1>
        <p style={{ 
          color: "#7f8c8d", 
          fontSize: "16px", 
          margin: "0",
          fontWeight: "300"
        }}>
          Select files to upload and share with others
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: "40px" }}>
        <div style={{ 
          marginBottom: "24px",
          textAlign: "center"
        }}>
          <label style={{
            display: "inline-block",
            padding: "20px 40px",
            backgroundColor: "#f8f9fa",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            border: "2px dashed #bdc3c7",
            minWidth: "300px"
          }}>
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              required 
              style={{ display: "none" }}
            />
            <div style={{ 
              fontSize: "16px", 
              color: "#7f8c8d",
              fontWeight: "500"
            }}>
              {files.length === 0 ? "Choose Files" : `${files.length} file${files.length !== 1 ? 's' : ''} selected`}
            </div>
            <div style={{ 
              fontSize: "14px", 
              color: "#95a5a6",
              marginTop: "4px",
              fontWeight: "300"
            }}>
              Click to browse or drag and drop
            </div>
          </label>
        </div>
        
        {files.length > 0 && (
          <div style={{ 
            marginBottom: "24px", 
            padding: "24px", 
            backgroundColor: "#ffffff", 
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "16px"
            }}>
              <h3 style={{ 
                fontSize: "18px", 
                fontWeight: "500", 
                color: "#2c3e50", 
                margin: "0"
              }}>
                Selected Files ({files.length})
              </h3>
              <div style={{ 
                fontSize: "14px", 
                color: "#7f8c8d",
                fontWeight: "500"
              }}>
                Total: {formatFileSize(totalSize)}
              </div>
            </div>
            <div style={{ 
              maxHeight: "200px", 
              overflowY: "auto",
              display: "grid",
              gap: "8px"
            }}>
              {files.map((file, index) => (
                <div key={index} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "12px 16px", 
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px"
                }}>
                  <span style={{ 
                    fontWeight: "400", 
                    color: "#2c3e50",
                    fontSize: "14px"
                  }}>
                    {file.name}
                  </span>
                  <span style={{ 
                    color: "#7f8c8d", 
                    fontSize: "13px",
                    fontWeight: "300"
                  }}>
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div style={{ textAlign: "center" }}>
          <button 
            type="submit" 
            disabled={isUploading || files.length === 0}
            style={{ 
              padding: "16px 40px", 
              backgroundColor: isUploading ? "#bdc3c7" : "#27ae60", 
              color: "white", 
              border: "none", 
              borderRadius: "12px", 
              cursor: isUploading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              boxShadow: isUploading ? "none" : "0 4px 16px rgba(39, 174, 96, 0.3)",
              minWidth: "200px"
            }}
            onMouseEnter={(e) => {
              if (!isUploading && files.length > 0) {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 6px 20px rgba(39, 174, 96, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isUploading && files.length > 0) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 16px rgba(39, 174, 96, 0.3)";
              }
            }}
          >
            {isUploading ? "Uploading..." : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </form>

      {isUploading && (
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
                background: "linear-gradient(90deg, #27ae60, #2ecc71)",
                borderRadius: "3px",
                transition: "width 0.3s ease",
                boxShadow: "0 0 10px rgba(39, 174, 96, 0.3)"
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

      {code && !isUploading && (
        <div style={{ 
          maxWidth: "600px", 
          margin: "0 auto",
          textAlign: "center", 
          padding: "40px 20px", 
          backgroundColor: "#ffffff", 
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}>
          <div style={{ 
            fontSize: "24px", 
            fontWeight: "300", 
            color: "#27ae60", 
            marginBottom: "16px"
          }}>
            Upload Successful!
          </div>
          
          <div style={{ 
            marginBottom: "32px",
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "12px"
          }}>
            <div style={{ 
              fontSize: "14px", 
              color: "#7f8c8d", 
              marginBottom: "8px",
              fontWeight: "500"
            }}>
              Share Code
            </div>
            <div style={{ 
              fontSize: "28px", 
              fontWeight: "600", 
              color: "#2c3e50",
              letterSpacing: "2px",
              fontFamily: "monospace"
            }}>
              {code}
            </div>
          </div>
          
          <div style={{ margin: "32px 0" }}>
            <QRCodeCanvas 
              value={downloadURL} 
              size={180} 
              style={{ 
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
              }}
            />
            <p style={{ 
              marginTop: "16px", 
              color: "#7f8c8d", 
              fontSize: "14px",
              fontWeight: "300"
            }}>
              Scan QR code to download files
            </p>
          </div>

          <div style={{ 
            textAlign: "left", 
            marginTop: "32px",
            padding: "24px",
            backgroundColor: "#f8f9fa",
            borderRadius: "12px"
          }}>
            <h4 style={{ 
              fontSize: "16px", 
              fontWeight: "500", 
              color: "#2c3e50", 
              margin: "0 0 16px 0"
            }}>
              Uploaded Files ({uploadedFiles.length})
            </h4>
            <div style={{ display: "grid", gap: "8px" }}>
              {uploadedFiles.map((file, index) => (
                <div key={index} style={{ 
                  padding: "12px 16px", 
                  backgroundColor: "white", 
                  borderRadius: "8px",
                  display: "flex", 
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span style={{ 
                    color: "#2c3e50",
                    fontSize: "14px",
                    fontWeight: "400"
                  }}>
                    {file.filename}
                  </span>
                  <span style={{ 
                    color: "#7f8c8d", 
                    fontSize: "13px",
                    fontWeight: "300"
                  }}>
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ 
            marginTop: "24px", 
            color: "#7f8c8d", 
            fontSize: "13px",
            fontWeight: "300"
          }}>
            All files are available for download using the share code above
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadForm;


