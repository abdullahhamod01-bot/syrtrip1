import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyA-7xGT6c1gi3fnWHsffe04BUlsVSGQCIg",
  authDomain: "syrtrip.firebaseapp.com",
  projectId: "syrtrip",
  storageBucket: "syrtrip.firebasestorage.app",
  messagingSenderId: "231118304717",
  appId: "1:231118304717:web:761d1b80294e0172378084",
  measurementId: "G-ERJ8JF1VFB",
};

const app = initializeApp(firebaseConfig);
export const messaging =
  typeof window !== "undefined" && "serviceWorker" in navigator
    ? getMessaging(app)
    : null;
export const VAPID_KEY =
  "BDwgu152IStXhg-Do4r7mY19qJBcAzpKFkQ6euSGvYcUCfUcSPykiigFWT9j1yK7_4G-Q314AfeBooa4ri00zsU";

export default app;
