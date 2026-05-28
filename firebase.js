import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFirestore } from "firebase/firestore";

/* ✅ YOUR CONFIG (unchanged) */
const firebaseConfig = {
  apiKey: "AIzaSyBY5NoDpZFVOcc_sK3mJGb2yncn0LT97FA",
  authDomain: "churchcare-1809a.firebaseapp.com",
  projectId: "churchcare-1809a",
  storageBucket: "churchcare-1809a.firebasestorage.app",
  messagingSenderId: "728832473912",
  appId: "1:728832473912:web:ec27309f07859b9bc35fcd",
};

/* ✅ INIT APP */
const app = initializeApp(firebaseConfig);

/* ✅ FIX AUTH (VERY IMPORTANT) */
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

/* ✅ FIRESTORE */
export const db = getFirestore(app);