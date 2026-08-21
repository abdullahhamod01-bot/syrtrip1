import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { registerFCMToken, listenToMessages } from "./fcmHelper";

document.documentElement.lang = "ar";
document.documentElement.dir = "rtl";

// Register service worker for Firebase messaging
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .catch((error) => {
      console.log("Service worker registration failed:", error);
    });
}

// Initialize Firebase Cloud Messaging
registerFCMToken();
listenToMessages((payload) => {
  console.log("New notification in foreground:", payload);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>,
);
