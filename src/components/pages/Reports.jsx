import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase"; 
import { collection, getDocs } from "firebase/firestore";
import { generatePDF } from "../utils/ReportGenerator";

const Reports = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "inventory"));
        const inventoryData = querySnapshot.docs.map((doc) => {
          const item = { id: doc.id, ...doc.data() };

          return {
            id: item.id,
            name: item.name || "Unknown",  // Ensure name is always displayed
            selling_price: item.selling_price > 0 ? item.selling_price : "N/A", // Show 'N/A' if not sold
            purchase_price: item.purchase_price || "N/A",
            hsn: item.hsn || "N/A",
            quantity: item.quantity || "0",
          };
        });

        setData(inventoryData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inventory Reports</h1>
      
      <button
        onClick={() => generatePDF(data, "Inventory Report")}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Download PDF
      </button>

      {/* Display Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Selling Price</th>
              <th className="px-4 py-2 border">Purchase Price</th>
              <th className="px-4 py-2 border">HSN</th>
              <th className="px-4 py-2 border">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index} className="border">
                  <td className="px-4 py-2 border">{item.id}</td>
                  <td className="px-4 py-2 border">{item.name}</td>
                  <td className="px-4 py-2 border">{item.selling_price}</td>
                  <td className="px-4 py-2 border">{item.purchase_price}</td>
                  <td className="px-4 py-2 border">{item.hsn}</td>
                  <td className="px-4 py-2 border">{item.quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
