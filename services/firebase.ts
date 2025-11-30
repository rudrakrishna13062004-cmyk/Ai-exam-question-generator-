import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDEsrVasCMnh8pdTZwhi8SaxRMx5kF62oE",
    authDomain: "app-c71d8.firebaseapp.com",
    databaseURL: "https://app-c71d8-default-rtdb.firebaseio.com",
    projectId: "app-c71d8",
    storageBucket: "app-c71d8.firebasestorage.app",
    messagingSenderId: "503361105354",
    appId: "1:503361105354:web:357b2bea7e1d298dab3333",
    measurementId: "G-G99KXE6F2D"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);