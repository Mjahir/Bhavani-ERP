"use client"

import { useEffect, useState } from "react"
import { db } from "../firebase/firebase"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore"

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [newItem, setNewItem] = useState({ name: "", quantity: "", selling_price: "" })
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const getInventory = async () => {
      const inventoryCollection = collection(db, "inventory")
      const inventorySnapshot = await getDocs(inventoryCollection)
      const inventoryList = inventorySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setInventory(inventoryList)
    }

    getInventory()
  }, [])

  const handleDeleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, "inventory", id))
      setInventory(inventory.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const handleInputChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value })
  }

  const handleUpdateInventory = async (id, updatedItem) => {
    try {
      await updateDoc(doc(db, "inventory", id), updatedItem)
      setInventory(inventory.map((item) => (item.id === id ? { id, ...updatedItem } : item)))
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.selling_price) {
      alert("Please fill all fields.")
      return
    }

    try {
      const itemQuery = query(collection(db, "inventory"), where("name", "==", newItem.name))
      const querySnapshot = await getDocs(itemQuery)

      if (!querySnapshot.empty) {
        const existingItem = querySnapshot.docs[0]
        const currentQuantity = existingItem.data().quantity || 0
        await updateDoc(doc(db, "inventory", existingItem.id), {
          quantity: currentQuantity + Number(newItem.quantity),
          selling_price: Number(newItem.selling_price),
        })
        setInventory(
          inventory.map((item) =>
            item.id === existingItem.id
              ? {
                  ...item,
                  quantity: currentQuantity + Number(newItem.quantity),
                  selling_price: Number(newItem.selling_price),
                }
              : item,
          ),
        )
      } else {
        const docRef = await addDoc(collection(db, "inventory"), {
          name: newItem.name,
          quantity: Number(newItem.quantity),
          selling_price: Number(newItem.selling_price),
        })
        setInventory([...inventory, { id: docRef.id, ...newItem }])
      }

      setNewItem({ name: "", quantity: "", selling_price: "" })
    } catch (error) {
      console.error("Error adding item:", error)
    }
  }

  const filteredInventory = inventory.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search items..."
          className="border p-2 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          name="name"
          placeholder="Item Name"
          className="border p-2"
          value={newItem.name}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          className="border p-2"
          value={newItem.quantity}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="selling_price"
          placeholder="Selling Price"
          className="border p-2"
          value={newItem.selling_price}
          onChange={handleInputChange}
        />
        <button onClick={handleAddItem} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Item
        </button>
      </div>

      <table className="min-w-full bg-white border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Purchase Price</th>
            <th className="border px-4 py-2">Selling Price</th>
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
                  onChange={(e) => handleUpdateInventory(item.id, { ...item, name: e.target.value })}
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border p-1 w-full"
                  value={item.quantity}
                  onChange={(e) => handleUpdateInventory(item.id, { ...item, quantity: Number(e.target.value) })}
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border p-1 w-full"
                  value={item.purchase_price || ""}
                  onChange={(e) => handleUpdateInventory(item.id, { ...item, purchase_price: Number(e.target.value) })}
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border p-1 w-full"
                  value={item.selling_price}
                  onChange={(e) => handleUpdateInventory(item.id, { ...item, selling_price: Number(e.target.value) })}
                />
              </td>
              <td className="px-4 py-2 flex space-x-2">
                <button onClick={() => handleDeleteItem(item.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Inventory

