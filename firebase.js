import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyATLt4fS9Y_9BqgoUVSFw8GMJBhs3PEGIE",
  authDomain: "it-pagrindai.firebaseapp.com",
  projectId: "it-pagrindai",
  storageBucket: "it-pagrindai.firebasestorage.app",
  messagingSenderId: "128928211189",
  appId: "1:128928211189:web:c5366c920e336d9be165bc",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };