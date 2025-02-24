import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useState } from "react";
import { FiMenu, FiX, FiHome, FiUser, FiLogOut, FiFileText, FiBox } from "react-icons/fi";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      setIsOpen(false);
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex">
      <div
        className={`bg-gray-800 text-white w-64 min-h-screen p-4 fixed md:relative transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-64"} md:translate-x-0`}
      >
        <button className="md:hidden text-white text-2xl mb-4" onClick={() => setIsOpen(false)}>
          <FiX />
        </button>

        <h1 className="text-2xl font-bold text-center mb-6 uppercase">
          Jay Bhavani Metal Corporation
        </h1>

        <nav className="flex flex-col space-y-4">
          <Link to="/" className="flex items-center gap-2 p-2 rounded hover:bg-gray-700" onClick={handleLinkClick}>
            <FiHome /> Dashboard
          </Link>
          {user && (
            <>
              <Link to="/invoice" className="flex items-center gap-2 p-2 rounded hover:bg-gray-700" onClick={handleLinkClick}>
                <FiFileText /> Invoice
              </Link>
              <Link to="/inventory" className="flex items-center gap-2 p-2 rounded hover:bg-gray-700" onClick={handleLinkClick}>
                <FiBox /> Inventory
              </Link>
              <Link to="/reports" className="flex items-center gap-2 p-2 rounded hover:bg-gray-700" onClick={handleLinkClick}>
                <FiFileText /> Reports
              </Link>
            </>
          )}
          {user ? (
            <button onClick={handleLogout} className="flex items-center gap-2 p-2 rounded hover:bg-red-600">
              <FiLogOut /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-2 p-2 rounded hover:bg-gray-700" onClick={handleLinkClick}>
                <FiUser /> Login
              </Link>
              <Link to="/signup" className="flex items-center gap-2 p-2 rounded hover:bg-gray-700" onClick={handleLinkClick}>
                <FiUser /> Signup
              </Link>
            </>
          )}
        </nav>
      </div>

      <button className="md:hidden p-4 text-2xl bg-gray-800 text-white fixed top-4 left-4" onClick={() => setIsOpen(true)}>
        <FiMenu />
      </button>
    </div>
  );
};

export default Sidebar;