import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBY5NoDpZFVOcc_sK3mJGb2yncn0LT97FA",
  authDomain: "churchcare-1809a.firebaseapp.com",
  projectId: "churchcare-1809a",
  storageBucket: "churchcare-1809a.firebasestorage.app",
  messagingSenderId: "728832473912",
  appId: "1:728832473912:web:ec27309f07859b9bc35fcd",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Firestore
export const db = getFirestore(app);