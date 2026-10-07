import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get("/customers/me");
        setCustomer(response.data);
      } catch (err) {
        console.error("Authentication error:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar customer={customer} />

      <main className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome to ShopKart, {customer.fullName}!
        </h2>
        <p className="text-gray-600 mb-6">
          Here are your customer account details:
        </p>

        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-semibold text-gray-600">Full Name:</span>
            <span className="text-gray-800">{customer.fullName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-semibold text-gray-600">Email:</span>
            <span className="text-gray-800">{customer.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-semibold text-gray-600">Phone Number:</span>
            <span className="text-gray-800">{customer.phone}</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/products")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer"
          >
            Browse Products &rarr;
          </button>
        </div>
      </main>
    </div>
  );
}

export default Home;
