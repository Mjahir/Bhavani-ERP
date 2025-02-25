import { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { db } from "../firebase/firebase";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { Plus, FileText, ShoppingCart } from 'lucide-react'; // Remove FilePdf, update icon names

const bankDetails = {
  name: "Central Bank of India A/c",
  accountNumber: "1312408781",
  ifsc: "CBIN0284851",
  branch: "Nagheedi Jamnagar",
};

const numberToWords = (num) => {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(num);
};

const Invoice = () => {
  const [items, setItems] = useState([{ description: "", quantity: "", price: "", hsn: "", type: "", bags: 1 }]);
  const [customer, setCustomer] = useState({ name: "", address: "", gstin: "" });
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [gst, setGst] = useState(18);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0, hsn: "", type: "", bags: 1 }]);
  };

  const updateItem = (index, key, value) => {
    const newItems = [...items];
    newItems[index][key] = value;
    setItems(newItems);
  };

  const calculateAdjustedWeight = (item) => {
    if (item.type === "KP") {
      return item.quantity - (0.700 * item.bags);
    } else if (item.type === "P2") {
      return item.quantity - (0.300 * item.bags);
    }
    return item.quantity;
  };

  const calculateWeightReduction = (item) => {
    if (item.type === "KP") {
      return 0.700 * item.bags;
    } else if (item.type === "P2") {
      return 0.300 * item.bags;
    }
    return 0;
  };

  const subtotal = items.reduce((acc, item) => acc + calculateAdjustedWeight(item) * item.price, 0);
  const gstAmount = (subtotal * gst) / 100;
  const total = subtotal + gstAmount;

  const handleCreateInvoice = async () => {
    try {
      await addDoc(collection(db, "sales"), {
        invoiceNumber,
        customer,
        items,
        date,
        subtotal,
        gstAmount,
        total,
      });

      for (let item of items) {
        if (!item.description.trim()) continue;

        const itemRef = doc(db, "inventory", item.description);
        const itemSnapshot = await getDoc(itemRef);

        if (itemSnapshot.exists()) {
          const currentQuantity = itemSnapshot.data().quantity || 0;
          await updateDoc(itemRef, { quantity: Math.max(0, currentQuantity - calculateAdjustedWeight(item)) });
        }
      }

      alert("Invoice Created & Inventory Updated");
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleAddPurchase = async () => {
    try {
      await addDoc(collection(db, "purchases"), { date, items });

      for (let item of items) {
        if (!item.description.trim()) continue;

        const itemRef = doc(db, "inventory", item.description);
        const itemSnapshot = await getDoc(itemRef);

        if (itemSnapshot.exists()) {
          const currentQuantity = itemSnapshot.data().quantity || 0;
          await updateDoc(itemRef, { quantity: currentQuantity + calculateAdjustedWeight(item) });
        } else {
          await addDoc(collection(db, "inventory"), {
            name: item.description,
            quantity: calculateAdjustedWeight(item),
            hsn: item.hsn,
            purchase_price: item.price,
            selling_price: item.price * 1.1,
          });
        }
      }

      alert("Purchase Added & Inventory Updated");
    } catch (error) {
      console.error("Error adding purchase:", error);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Tax Invoice", 14, 20);

    doc.setFontSize(10);
    doc.text(`Invoice No: ${invoiceNumber}`, 14, 30);
    doc.text(`Date: ${date}`, 14, 40);
    doc.text(`Buyer: ${customer.name}`, 14, 50);
    doc.text(`Address: ${customer.address}`, 14, 60);
    doc.text(`GSTIN: ${customer.gstin}`, 14, 70);

    doc.autoTable({
      startY: 80,
      head: [["Description", "HSN/SAC", "Qty (KG)", "Type", "Bags", "Weight Reduction", "Adjusted Qty (KG)", "Rate", "Amount"]],
      body: items.map(item => [
        item.description,
        item.hsn,
        item.quantity,
        item.type,
        item.bags,
        calculateWeightReduction(item).toFixed(3),
        calculateAdjustedWeight(item).toFixed(3),
        item.price,
        (calculateAdjustedWeight(item) * item.price).toFixed(2)
      ]),
    });

    const finalY = doc.autoTable.previous.finalY;
    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 14, finalY + 10);
    doc.text(`GST (${gst}%): ₹${gstAmount.toFixed(2)}`, 14, finalY + 20);
    doc.text(`Total: ₹${total.toFixed(2)}`, 14, finalY + 30);
    doc.text(`Total (in words): ${numberToWords(total)}`, 14, finalY + 40);

    doc.text("Company's Bank Details:", 14, finalY + 60);
    doc.text(`Bank Name: ${bankDetails.name}`, 14, finalY + 70);
    doc.text(`A/c No.: ${bankDetails.accountNumber}`, 14, finalY + 80);
    doc.text(`Branch & IFSC Code: ${bankDetails.branch}, ${bankDetails.ifsc}`, 14, finalY + 90);

    doc.save(`Invoice_${invoiceNumber}.pdf`);
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Invoice</h2>

      <input type="text" placeholder="Invoice Number" className="border p-2 mb-2 w-full" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
      <input type="date" className="border p-2 mb-4 w-full" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="text" placeholder="Customer Name" className="border p-2 mb-2 w-full" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
      <input type="text" placeholder="Customer Address" className="border p-2 mb-2 w-full" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
      <input type="text" placeholder="Customer GSTIN" className="border p-2 mb-4 w-full" value={customer.gstin} onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })} />
      
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-2 items-center">
          <input type="text" placeholder="Item Description" className="border p-2 w-full" value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} />
          <input type="text" placeholder="HSN/SAC" className="border p-2 w-full" value={item.hsn} onChange={(e) => updateItem(index, "hsn", e.target.value)} />
          <input type="number" placeholder="Qty (KG)" className="border p-2 w-full" value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number(e.target.value))} />
          <input type="number" placeholder="Price" className="border p-2 w-full" value={item.price} onChange={(e) => updateItem(index, "price", Number(e.target.value))} />
          <input type="number" placeholder="Bags" className="border p-2 w-full" value={item.bags} onChange={(e) => updateItem(index, "bags", Number(e.target.value))} />
          <select
            className="border p-2 w-full"
            value={item.type}
            onChange={(e) => updateItem(index, "type", e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="KP">KP</option>
            <option value="P2">P2</option>
          </select>
          <div className="w-full text-sm">
            {item.type && (
              <>
                <div>Reduction: {calculateWeightReduction(item).toFixed(3)} KG</div>
                <div>Adjusted: {calculateAdjustedWeight(item).toFixed(3)} KG</div>
              </>
            )}
          </div>
        </div>
      ))}

      <button onClick={addItem} className="bg-blue-500 text-white px-4 py-2 rounded mt-2 flex items-center">
        <Plus className="mr-2" /> Add Item
      </button>
      <button onClick={handleCreateInvoice} className="bg-green-500 text-white px-4 py-2 rounded mt-4 w-full flex items-center justify-center">
        <FileText className="mr-2" /> Create Invoice
      </button>
      <button onClick={handleAddPurchase} className="bg-yellow-500 text-white px-4 py-2 rounded mt-4 w-full flex items-center justify-center">
        <ShoppingCart className="mr-2" /> Add Purchase
      </button>
      <button onClick={generatePDF} className="bg-purple-500 text-white px-4 py-2 rounded mt-4 w-full flex items-center justify-center">
        <FileText className="mr-2" /> Generate PDF
      </button>
    </div>
  );
};

export default Invoice;