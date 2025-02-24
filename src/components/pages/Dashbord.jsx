import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Home, User, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "inventory"));
        setInventory(querySnapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchInventory();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        user.getIdTokenResult().then(idTokenResult => {
          setUserRole(idTokenResult.claims.role);
        }).catch(error => {
          console.error('Error getting token result:', error);
        });
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const chartData = inventory.map(item => ({
    name: item.name,
    quantity: item.quantity
  }));

  return (
    <div className="p-6">
      {user ? (
        <>
          <div className="bg-gradient-to-r from-blue-500 to-teal-400 text-white p-6 rounded-lg shadow-lg mb-6">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <User className="mr-2" /> Welcome back, {user.email}!
            </h1>
            <p className="text-lg">Role: {userRole || "N/A"}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BarChart2 className="mr-2" /> Inventory Overview
            </h2>
            <BarChart width={500} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#8884d8" />
            </BarChart>
          </div>
        </>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center">
            <Home className="mr-2" /> Welcome to Bhavani Metal Corporation
          </h1>
          <p className="text-xl text-gray-700">We will contact you soon.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;