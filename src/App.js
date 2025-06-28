import React from "react";
import UploadForm from "./components/uploadForm";
import DownloadForm from "./components/downloadForm";

function App() {
  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "2rem" }}>
      <h1>📤 Cross Device File Transfer</h1>
      <UploadForm />
      <hr style={{ margin: "3rem 0" }} />
      <DownloadForm />
    </div>
  );
}

export default App;
