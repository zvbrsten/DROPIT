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
    setCode("");
    setQrCode("");
    setDownloadURL("");
    setUploadedFiles([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

      const res = await axios.post("https://dropit-backend-three.vercel.app/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
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
        Upload Files
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          required
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "15px",
            borderRadius: "5px",
            border: "1px solid #444",
            backgroundColor: "#2d2d2d",
            color: "#fff",
            cursor: "pointer",
          }}
        />

        {files.length > 0 && (
          <div style={{
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#2d2d2d",
            borderRadius: "5px",
          }}>
            <h4>Selected Files ({files.length}):</h4>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {files.map((file, index) => (
                <div key={index} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: "1px solid #444",
                }}>
                  <span>{file.name}</span>
                  <span style={{ color: "#aaa", fontSize: "14px" }}>
                    {formatFileSize(file.size)}
                  </span>
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
            width: "100%",
            padding: "10px",
            backgroundColor: isUploading ? "#555" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isUploading ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {isUploading ? "Uploading..." : `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`}
        </button>
      </form>

      {isUploading && (
        <div style={{ marginTop: "20px" }}>
          <div style={{
            width: "100%",
            backgroundColor: "#444",
            borderRadius: "4px",
            overflow: "hidden",
          }}>
            <div style={{
              width: `${progress}%`,
              height: "20px",
              backgroundColor: "#4caf50",
              borderRadius: "4px",
              transition: "width 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
            }}>
              {progress}%
            </div>
          </div>
        </div>
      )}

      {code && !isUploading && (
        <div style={{
          marginTop: "30px",
          textAlign: "center",
          padding: "20px",
          backgroundColor: "#2d2d2d",
          borderRadius: "10px",
        }}>
          <h3>Upload Successful</h3>
          <h4>
            Share Code:{" "}
            <code style={{
              backgroundColor: "#444",
              padding: "5px 10px",
              borderRadius: "3px",
              fontSize: "18px",
            }}>
              {code}
            </code>
          </h4>

          <div style={{ margin: "20px 0" }}>
            <QRCodeCanvas value={downloadURL} size={200} />
            <p style={{ marginTop: "10px", color: "#aaa" }}>Scan to download the files</p>
          </div>

          <div style={{ textAlign: "left", marginTop: "20px" }}>
            <h4>Uploaded Files ({uploadedFiles.length}):</h4>
            {uploadedFiles.map((file, index) => (
              <div key={index} style={{
                padding: "8px",
                backgroundColor: "#1e1e1e",
                margin: "5px 0",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "space-between",
              }}>
                <span>{file.filename}</span>
                <span style={{ color: "#aaa" }}>{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>

          <p style={{ marginTop: "15px", color: "#aaa", fontSize: "14px" }}>
            All files will be available for download using this single code.
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
