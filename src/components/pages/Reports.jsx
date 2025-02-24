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
        const inventoryData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
              {data.length > 0 &&
                Object.keys(data[0]).map((key) => (
                  <th key={key} className="px-4 py-2 border">{key}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index} className="border">
                  {Object.values(item).map((value, i) => (
                    <td key={i} className="px-4 py-2 border">
                      {typeof value === "object" && value.seconds
                        ? new Date(value.seconds * 1000).toLocaleString() // Convert Firestore Timestamp
                        : value}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={data.length > 0 ? Object.keys(data[0]).length : 1} className="text-center py-4">
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
