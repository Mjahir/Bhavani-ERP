import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Signup Function
export const signup = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Login Function
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Logout Function
export const logout = () => {
  return signOut(auth);
};
