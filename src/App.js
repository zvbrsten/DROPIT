import React, { useState } from "react";

import UploadForm from "./components/uploadForm";
import DownloadForm from "./components/downloadForm";

function App() {
  const [activeTab, setActiveTab] = useState("upload"); // "upload", "download", "groups"

  const tabStyle = (tabName) => ({
    padding: "10px 20px",
    backgroundColor: activeTab === tabName ? "#007bff" : "#f8f9fa",
    color: activeTab === tabName ? "white" : "#333",
    border: "1px solid #dee2e6",
    cursor: "pointer",
    borderBottom: activeTab === tabName ? "none" : "1px solid #dee2e6",
  });

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#333", marginBottom: "10px" }}>DropIt</h1>
        <p style={{ color: "#666", fontSize: "16px" }}>
          Share files easily with temporary codes or collaborate in groups
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", marginBottom: "20px", borderBottom: "1px solid #dee2e6" }}>
        <button
          style={tabStyle("upload")}
          onClick={() => setActiveTab("upload")}
        >
          📤 Upload Files
        </button>
        <button
          style={tabStyle("download")}
          onClick={() => setActiveTab("download")}
        >
          📥 Download Files
        </button>
        
      </div>

      {/* Tab Content */}
      <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "0 10px 10px 10px", minHeight: "400px" }}>
        {activeTab === "upload" && (
          <div>
            <UploadForm />
          </div>
        )}

        {activeTab === "download" && (
          <div>
            <DownloadForm />
          </div>
        )}

        
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "30px", padding: "20px", color: "#666", fontSize: "14px" }}>
        <p>
          <strong>Individual Sharing:</strong> Upload multiple files and get a single code for easy sharing<br/>
          <strong>Group Sharing:</strong> Create or join groups for collaborative file sharing
        </p>
      </div>
    </div>
  );
}

export default App;
