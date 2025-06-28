import React, { useState } from "react";
import axios from "axios";

const DownloadForm = () => {
  const [code, setCode] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [filename, setFilename] = useState("");
  const [progress, setProgress] = useState(0);

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!code) return;

    try {
      const res = await axios.get(`https://dropit-backend-three.vercel.app/api/file/${code}`, {
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percent = Math.floor((loaded * 100) / total);
          setProgress(percent);
        },
      });
      setFileURL(res.data.downloadUrl);
      setFilename(res.data.filename);
    } catch (err) {
      alert("Invalid or expired code");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Download File</h2>
      <form onSubmit={handleDownload}>
        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit">Fetch</button>
      </form>

      {progress > 0 && (
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {fileURL && (
        <div style={{ marginTop: "20px" }}>
          <a href={fileURL} download={filename}>
            <button>Download {filename}</button>
          </a>
        </div>
      )}
    </div>
  );
};

export default DownloadForm;
