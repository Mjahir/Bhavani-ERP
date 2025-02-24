import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      const querySnapshot = await getDocs(collection(db, "inventory"));
      setInventory(querySnapshot.docs.map(doc => doc.data()));
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

  const chartData = {
    labels: inventory.map(item => item.name),
    datasets: [
      {
        label: 'Quantity',
        data: inventory.map(item => item.quantity),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-6">
      {user ? (
        <>
          <div className="bg-gradient-to-r from-blue-500 to-teal-400 text-white p-6 rounded-lg shadow-lg mb-6">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.email}!</h1>
            <p className="text-lg">Role: {userRole || "proprietor"}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Inventory Overview</h2>
            <Chart type="bar" data={chartData} />
          </div>
        </>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
            Welcome to Bhavani Metal Corporation
          </h1>
          <p className="text-xl text-gray-700">We will contact you soon.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;