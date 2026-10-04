import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { POProvider } from "./context/POContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <POProvider>
      <App />
    </POProvider>
  </StrictMode>
);