import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAfxoYh20blECk2oFgNEMc_6k2pdK6mWsw",
    authDomain: "siz-yzum.firebaseapp.com",
    projectId: "siz-yzum",
    storageBucket: "siz-yzum.firebasestorage.app",
    messagingSenderId: "652277659076",
    appId: "1:652277659076:web:af4d556abada6f9ba8e091",
    measurementId: "G-9DETDQL4WV"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)
export const auth = getAuth(app)