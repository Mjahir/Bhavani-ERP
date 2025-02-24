import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Add new invoice
export const addInvoice = async (invoiceData) => {
  try {
    const docRef = await addDoc(collection(db, "invoices"), invoiceData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding invoice:", error);
  }
};

// Get all invoices
export const getInvoices = async () => {
  const querySnapshot = await getDocs(collection(db, "invoices"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
