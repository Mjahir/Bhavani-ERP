import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      const querySnapshot = await getDocs(collection(db, "inventory"));
      setInventory(querySnapshot.docs.map(doc => doc.data()));
    };
    fetchInventory();
  }, []);

  //  Recharts
  const chartData = inventory.map(item => ({
    name: item.name,
    quantity: item.quantity
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="bg-white shadow p-4">
        <h2 className="text-lg font-bold">Inventory Overview</h2>
        <BarChart width={500} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="quantity" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
};

export default Dashboard;
