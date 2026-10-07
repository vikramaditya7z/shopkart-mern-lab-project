import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get("/customers/me");
        setCustomer(res.data);
      } catch {
        navigate("/login");
      }
    };

    fetchCustomer();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar customer={customer} />

      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            ✓
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-600 text-sm mb-6">
            Thank you for shopping with ShopKart. Your payment has been verified and your order is being processed.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-8 text-sm">
            <span className="text-gray-500">Order ID: </span>
            <span className="font-mono font-semibold text-gray-800">{id}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/orders"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm"
            >
              View My Orders
            </Link>
            <Link
              to="/products"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-lg transition text-sm border border-gray-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderSuccess;
