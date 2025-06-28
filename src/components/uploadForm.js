import React, { useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";  // ✅ Corrected import

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [code, setCode] = useState("");
  const [downloadURL, setDownloadURL] = useState("");
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgress(0);

      const res = await axios({
        method: "post",
        url: "https://dropit-backend-three.vercel.app/api/upload",
        data: formData,
        onUploadProgress: function (progressEvent) {
          const percent = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      setCode(res.data.code);
      setDownloadURL(res.data.downloadURL);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Upload File</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
        <button type="submit">Upload</button>
      </form>

      {progress > 0 && (
        <div style={{ marginTop: "10px", width: "100%", backgroundColor: "#f1f1f1" }}>
          <div
            style={{
              width: `${progress}%`,
              height: "10px",
              backgroundColor: "#4caf50",
              transition: "width 0.2s",
            }}
          ></div>
          <p>{progress}%</p>
        </div>
      )}

      {code && (
        <div style={{ marginTop: "20px" }}>
          <h4>Code: <code>{code}</code></h4>
          <QRCodeCanvas value={downloadURL} size={150} /> {/* ✅ Corrected usage */}
          <p>Scan this QR on another device to download.</p>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
