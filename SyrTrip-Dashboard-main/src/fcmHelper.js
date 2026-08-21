import { getToken, onMessage } from "firebase/messaging";
import { messaging, VAPID_KEY } from "./firebase";
import API from "./api/api";

export const registerFCMToken = async () => {
  if (!messaging) {
    console.warn("Firebase messaging not available");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return;
    }

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token) {
      console.log("FCM Token obtained:", token);
      await API.post("/notifications/fcm-token", { fcmToken: token });
      console.log("FCM token registered with backend");
    }
  } catch (error) {
    console.error("FCM Token registration error:", error);
  }
};

export const listenToMessages = (callback) => {
  if (!messaging) {
    console.warn("Firebase messaging not available");
    return;
  }

  onMessage(messaging, (payload) => {
    console.log("Message received in foreground:", payload);
    if (callback) {
      callback(payload);
    }
  });
};
