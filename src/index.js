import React from "react";
import ReactDOM from "react-dom/client"; // Importing ReactDOM for rendering
import App from "./App"; // Importing the main App component
import './App.css'; // Importing the CSS file for styling

// Creating a root for the React application
const root = ReactDOM.createRoot(document.getElementById("root"));

// Rendering the App component into the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
