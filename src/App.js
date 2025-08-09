import React, { useState } from "react";
import UploadForm from "./components/uploadForm";
import DownloadForm from "./components/downloadForm";

function App() {
  const [activeTab, setActiveTab] = useState("upload");

  const tabStyle = (tabName) => ({
    flex: 1,
    padding: "12px 20px",
    backgroundColor: activeTab === tabName ? "#007bff" : "#2d2d2d",
    color: activeTab === tabName ? "#fff" : "#ccc",import React, { useState } from "react";
import UploadForm from "./components/uploadForm";
import DownloadForm from "./components/downloadForm";

function App() {
  const [activeTab, setActiveTab] = useState("upload");

  const tabStyle = (tabName) => ({
    flex: 1,
    padding: "12px 20px",
    backgroundColor: activeTab === tabName ? "#007bff" : "#2d2d2d",
    color: activeTab === tabName ? "#fff" : "#ccc",
    border: "none",
    borderBottom: activeTab === tabName ? "3px solid #007bff" : "3px solid transparent",
    cursor: "pointer",
    fontWeight: activeTab === tabName ? "bold" : "normal",
    transition: "background-color 0.2s, color 0.2s",
  });

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", color: "#fff", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#fff", marginBottom: "10px" }}>DropIt</h1>
        <p style={{ color: "#aaa", fontSize: "16px" }}>
          Share files easily with temporary codes or collaborate in groups
        </p>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          marginBottom: "20px",
          backgroundColor: "#1e1e1e",
          borderRadius: "8px 8px 0 0",
          overflow: "hidden",
        }}
      >
        <button style={tabStyle("upload")} onClick={() => setActiveTab("upload")}>
          Upload Files
        </button>
        <button style={tabStyle("download")} onClick={() => setActiveTab("download")}>
          Download Files
        </button>
      </div>

      {/* Tab Content */}
      <div
        style={{
          backgroundColor: "#1e1e1e",
          padding: "20px",
          borderRadius: "0 0 8px 8px",
          minHeight: "400px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
      >
        {activeTab === "upload" && <UploadForm />}
        {activeTab === "download" && <DownloadForm />}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "30px",
          padding: "20px",
          color: "#aaa",
          fontSize: "14px",
          borderTop: "1px solid #333",
        }}
      >
        <p>
          <strong>Individual Sharing:</strong> Upload multiple files and get a single code for easy sharing<br />
          <strong>Group Sharing:</strong> Create or join groups for collaborative file sharing
        </p>
      </div>
    </div>
  );
}

export default App;

    border: "none",
    borderBottom: activeTab === tabName ? "3px solid #007bff" : "3px solid transparent",
    cursor: "pointer",
    fontWeight: activeTab === tabName ? "bold" : "normal",
    transition: "background-color 0.2s, color 0.2s",
  });

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "900px", 
      margin: "0 auto", 
      color: "#fff", 
      fontFamily: "sans-serif", 
      background: "linear-gradient(270deg, #1e1e1e, #2d2d2d)", 
      backgroundSize: "400% 400%", 
      animation: "gradient 15s ease infinite" 
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#fff", marginBottom: "10px" }}>DropIt</h1>
        <p style={{ color: "#aaa", fontSize: "16px" }}>
          Share files easily with temporary codes or collaborate in groups
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: "flex",
        marginBottom: "20px",
        backgroundColor: "#1e1e1e",
        borderRadius: "8px 8px 0 0",
        overflow: "hidden",
      }}>
        <button style={tabStyle("upload")} onClick={() => setActiveTab("upload")}>
          Upload Files
        </button>
        <button style={tabStyle("download")} onClick={() => setActiveTab("download")}>
          Download Files
        </button>
      </div>

      {/* Tab Content */}
      <div style={{
        backgroundColor: "#1e1e1e",
        padding: "20px",
        borderRadius: "0 0 8px 8px",
        minHeight: "400px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
      }}>
        {activeTab === "upload" && <UploadForm />}
        {activeTab === "download" && <DownloadForm />}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center",
        marginTop: "30px",
        padding: "20px",
        color: "#aaa",
        fontSize: "14px",
        borderTop: "1px solid #333",
      }}>
        <p>
          <strong>Individual Sharing:</strong> Upload multiple files and get a single code for easy sharing<br />
          <strong>Group Sharing:</strong> Create or join groups for collaborative file sharing
        </p>
      </div>
    </div>
  );
}

export default App;
