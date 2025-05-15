// lib/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyBcWsaGIUGaNyZT8C6D3snIgf1KXgk5noA",
    authDomain: "analys-app.firebaseapp.com",
    projectId: "analys-app",
    storageBucket: "analys-app.firebasestorage.app",
    messagingSenderId: "844170842968",
    appId: "1:844170842968:web:1be04fd6262fdfc4380b2d",
    measurementId: "G-3P9P3KEXTR"
  };

// ✅ evita erro de inicialização duplicada
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { auth, provider }
