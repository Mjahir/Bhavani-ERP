import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState({ name: "", quantity: "", selling_price: "" });

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      const querySnapshot = await getDocs(collection(db, "inventory"));
      setInventory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchInventory();
  }, []);

  // Handle adding a new item
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.selling_price) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "inventory"), {
        name: newItem.name,
        quantity: Number(newItem.quantity),
        selling_price: Number(newItem.selling_price),
      });

      setInventory([...inventory, { id: docRef.id, ...newItem }]);
      setNewItem({ name: "", quantity: "", selling_price: "" });
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Handle updating an item
  const handleUpdateItem = async (id, updatedItem) => {
    try {
      await updateDoc(doc(db, "inventory", id), updatedItem);
      setInventory(inventory.map(item => (item.id === id ? { id, ...updatedItem } : item)));
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteDoc(doc(db, "inventory", id));
      setInventory(inventory.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Filtered Inventory List
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Inventory Management</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search inventory..."
        className="border p-2 w-full mt-4"
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Add New Item */}
      <div className="mt-4 flex space-x-2">
        <input
          type="text"
          placeholder="Item Name"
          className="border p-2 w-1/3"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Quantity (KG)"
          className="border p-2 w-1/3"
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
        />
        <input
          type="number"
          placeholder="Selling Price"
          className="border p-2 w-1/3"
          value={newItem.selling_price}
          onChange={(e) => setNewItem({ ...newItem, selling_price: e.target.value })}
        />
        <button onClick={handleAddItem} className="bg-green-500 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>

      {/* Inventory Table */}
      <table className="min-w-full bg-white border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Price</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInventory.map((item) => (
            <tr key={item.id} className="border">
              <td className="px-4 py-2">
                <input
                  type="text"
                  className="border p-1 w-full"
                  value={item.name}
                  onChange={(e) =>
                    handleUpdateItem(item.id, { ...item, name: e.target.value })
                  }
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border p-1 w-full"
                  value={item.quantity}
                  onChange={(e) =>
                    handleUpdateItem(item.id, { ...item, quantity: Number(e.target.value) })
                  }
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border p-1 w-full"
                  value={item.selling_price}
                  onChange={(e) =>
                    handleUpdateItem(item.id, { ...item, selling_price: Number(e.target.value) })
                  }
                />
              </td>
              <td className="px-4 py-2 flex space-x-2">
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;