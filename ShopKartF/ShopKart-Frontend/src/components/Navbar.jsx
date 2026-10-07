import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext.jsx";

function Navbar({ customer }) {
  const navigate = useNavigate();
  const { totalCount } = useCart();

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/login");
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/home" className="text-xl font-bold tracking-wide hover:text-blue-100 transition">
            ShopKart
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link to="/home" className="hover:text-blue-200 transition">
              Home
            </Link>
            <Link to="/products" className="hover:text-blue-200 transition">
              Products
            </Link>
            <Link to="/wishlist" className="hover:text-blue-200 transition">
              Wishlist
            </Link>
            <Link to="/cart" className="hover:text-blue-200 transition">
              Cart ({totalCount})
            </Link>
            <Link to="/orders" className="hover:text-blue-200 transition">
              Orders
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {customer && (
            <span className="text-sm font-medium">
              Hello, {customer.fullName}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3.5 py-1.5 rounded text-sm font-semibold transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
