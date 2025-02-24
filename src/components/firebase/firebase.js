import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmbdrew3zH7PwYF_QXZcppeJiZeINxBCk",
  authDomain: "bhavani-erp-system.firebaseapp.com",
  projectId: "bhavani-erp-system",
  storageBucket: "bhavani-erp-system.firebasestorage.app",
  messagingSenderId: "362837536768",
  appId: "1:362837536768:web:ed028eebfeb9b405de28e5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
