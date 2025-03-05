import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/pages/Dashbord";
import Login from "./components/pages/Login";
import Invoice from "./components/pages/Invoices"; 
import Inventory from "./components/pages/Inventory";
import Reports from "./components/pages/Reports";

function App() {
  return (
    <Router>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-4 bg-gray-100 min-h-screen md:ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
