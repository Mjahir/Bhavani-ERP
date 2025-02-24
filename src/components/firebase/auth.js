import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const signInWithWhitelistCheck = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if the user is in the whitelist
    const userDoc = await getDoc(doc(db, "whitelist", user.uid));
    if (userDoc.exists()) {
      console.log("User is whitelisted, sign-in successful.");
      // Proceed with your application logic
    } else {
      console.log("User is not whitelisted.");
      await signOut(auth);
      throw new Error("You are not authorized to sign in.");
    }
  } catch (error) {
    console.error("Error during sign-in:", error);
    throw error;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const value = {
    currentUser,
    login: signInWithWhitelistCheck,
    logout: () => signOut(auth)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};