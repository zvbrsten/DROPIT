import React, { useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [code, setCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [downloadURL, setDownloadURL] = useState("");
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgress(0); // Reset before upload
      const res = await axios.post("https://dropit-backend-three.vercel.app/api/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percent = Math.floor((loaded * 100) / total);
          setProgress(percent);
        },
      });

      setCode(res.data.code);
      setQrCode(res.data.qrCode);
      setDownloadURL(res.data.downloadURL);
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Upload File</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
        <button type="submit">Upload</button>
      </form>

      {progress > 0 && progress < 100 && (
        <div style={{ marginTop: "10px", width: "100%", backgroundColor: "#f1f1f1", borderRadius: "4px" }}>
          <div
            style={{
              width: `${progress}%`,
              height: "10px",
              backgroundColor: "#4caf50",
              borderRadius: "4px",
              transition: "width 0.2s",
            }}
          ></div>
          <p style={{ fontSize: "12px" }}>{progress}%</p>
        </div>
      )}

      {code && (
        <div className="qr-code" style={{ marginTop: "20px" }}>
          <h4>Code: <code>{code}</code></h4>
          <QRCodeCanvas value={downloadURL} size={150} />
          <p>You can scan this QR on another device to download.</p>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
