import React, { useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

const UploadForm = () => {
  const [files, setFiles] = useState([]);
  const [code, setCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [downloadURL, setDownloadURL] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    // Reset previous upload data when new files are selected
    setCode("");
    setQrCode("");
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
      
      const res = await axios.post("http://localhost:8000/api/upload", formData, {
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
      setQrCode(res.data.qrCode);
      setDownloadURL(res.data.downloadURL);
      setUploadedFiles(res.data.files);
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>Upload Files</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <input 
            type="file" 
            multiple 
            onChange={handleFileChange} 
            required 
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        
        {files.length > 0 && (
          <div style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "5px" }}>
            <h4>Selected Files ({files.length}):</h4>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {files.map((file, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #ddd" }}>
                  <span style={{ fontWeight: "500" }}>{file.name}</span>
                  <span style={{ color: "#666", fontSize: "14px" }}>{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "10px", fontWeight: "bold" }}>
              Total Size: {formatFileSize(totalSize)}
            </div>
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={isUploading || files.length === 0}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: isUploading ? "#ccc" : "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "5px", 
            cursor: isUploading ? "not-allowed" : "pointer" 
          }}
        >
          {isUploading ? "Uploading..." : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
        </button>
      </form>

      {isUploading && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ width: "100%", backgroundColor: "#f1f1f1", borderRadius: "4px", overflow: "hidden" }}>
            <div
              style={{
                width: `${progress}%`,
                height: "20px",
                backgroundColor: "#4caf50",
                borderRadius: "4px",
                transition: "width 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold"
              }}
            >
              {progress}%
            </div>
          </div>
        </div>
      )}

      {code && !isUploading && (
        <div style={{ marginTop: "30px", textAlign: "center", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "10px" }}>
          <h3>Upload Successful!</h3>
          <h4>Share Code: <code style={{ backgroundColor: "#e9ecef", padding: "5px 10px", borderRadius: "3px", fontSize: "18px" }}>{code}</code></h4>
          
          <div style={{ margin: "20px 0" }}>
            <QRCodeCanvas value={downloadURL} size={200} />
            <p style={{ marginTop: "10px", color: "#666" }}>Scan this QR code to download the files</p>
          </div>

          <div style={{ textAlign: "left", marginTop: "20px" }}>
            <h4>Uploaded Files ({uploadedFiles.length}):</h4>
            {uploadedFiles.map((file, index) => (
              <div key={index} style={{ padding: "8px", backgroundColor: "white", margin: "5px 0", borderRadius: "5px", display: "flex", justifyContent: "space-between" }}>
                <span>{file.filename}</span>
                <span style={{ color: "#666" }}>{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>

          <p style={{ marginTop: "15px", color: "#666", fontSize: "14px" }}>
            All files will be available for download using this single code.
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
