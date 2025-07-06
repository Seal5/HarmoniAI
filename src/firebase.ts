import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";

// TODO: Replace the following with your app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1hvpPC1ZdXEFrxeteS8Weyk6WsHXQrXg",
  authDomain: "harmoniai-4999e.firebaseapp.com",
  projectId: "harmoniai-4999e",
  storageBucket: "harmoniai-4999e.firebasestorage.app",
  messagingSenderId: "117644075895",
  appId: "1:117644075895:web:d2c9f43128c1022c23b772",
  measurementId: "G-S3RMH8BS3W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export { app, auth }