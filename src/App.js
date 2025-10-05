import React, { useState } from "react";

import UploadForm from "./components/uploadForm";
import DownloadForm from "./components/downloadForm";

function App() {
  const [activeTab, setActiveTab] = useState("upload"); // "upload", "download", "groups"

  const tabStyle = (tabName) => ({
    padding: "16px 32px",
    backgroundColor: activeTab === tabName ? "#3498db" : "transparent",
    color: activeTab === tabName ? "white" : "#7f8c8d",
    border: "none",
    cursor: "pointer",
    borderRadius: "12px 12px 0 0",
    fontSize: "16px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    position: "relative"
  });

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f8f9fa",
      padding: "0"
    }}>
      <div style={{ 
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
        marginBottom: "40px"
      }}>
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto", 
          padding: "40px 20px 20px 20px"
        }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1 style={{ 
              fontSize: "48px", 
              fontWeight: "300", 
              color: "#2c3e50", 
              margin: "0 0 12px 0",
              letterSpacing: "-1px"
            }}>
              DropIt
            </h1>
            <p style={{ 
              color: "#7f8c8d", 
              fontSize: "18px", 
              margin: "0",
              fontWeight: "300"
            }}>
              Share files easily with temporary codes
            </p>
          </div>

          {/* Tab Navigation */}
          <div style={{ 
            display: "flex", 
            justifyContent: "center",
            gap: "8px",
            marginBottom: "0"
          }}>
            <button
              style={tabStyle("upload")}
              onClick={() => setActiveTab("upload")}
              onMouseEnter={(e) => {
                if (activeTab !== "upload") {
                  e.target.style.color = "#3498db";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "upload") {
                  e.target.style.color = "#7f8c8d";
                }
              }}
            >
              Upload Files
            </button>
            <button
              style={tabStyle("download")}
              onClick={() => setActiveTab("download")}
              onMouseEnter={(e) => {
                if (activeTab !== "download") {
                  e.target.style.color = "#3498db";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "download") {
                  e.target.style.color = "#7f8c8d";
                }
              }}
            >
              Download Files
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto",
        padding: "0 20px 40px 20px"
      }}>
        {activeTab === "upload" && <UploadForm />}
        {activeTab === "download" && <DownloadForm />}
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: "center", 
        padding: "40px 20px", 
        color: "#95a5a6", 
        fontSize: "14px",
        backgroundColor: "#ffffff",
        marginTop: "60px"
      }}>
        <p style={{ 
          margin: "0",
          fontWeight: "300",
          lineHeight: "1.6"
        }}>
          Upload multiple files and get a single code for easy sharing
        </p>
      </div>
    </div>
  );
}

export default App;
