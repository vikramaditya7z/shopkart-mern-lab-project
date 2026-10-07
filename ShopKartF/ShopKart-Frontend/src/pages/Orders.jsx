import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Orders() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerAndOrders = async () => {
      try {
        const userRes = await api.get("/customers/me");
        setCustomer(userRes.data);

        const ordersRes = await api.get("/orders");
        setOrders(ordersRes.data.orders || []);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to load your orders.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerAndOrders();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar customer={customer} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-600 text-sm">Track and view your past orders</p>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <p className="text-gray-600 text-lg">Loading your orders...</p>
          </div>
        )}

        {error && !loading && (
          <div className="py-16 text-center bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto border border-gray-100">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded text-sm transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="py-16 text-center bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto border border-gray-100">
            <div className="text-4xl mb-3">📦</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No orders placed yet</h2>
            <p className="text-gray-600 text-sm mb-6">Looks like you haven't placed any orders so far.</p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex flex-col justify-between gap-4"
              >
                <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-gray-100 text-sm">
                  <div>
                    <span className="text-gray-500">Order ID: </span>
                    <span className="font-mono font-bold text-gray-800">{order._id}</span>
                    <p className="text-xs text-gray-500 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-700"
                          : order.paymentStatus === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      Payment: {order.paymentStatus}
                    </span>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-100 text-blue-700">
                      Status: {order.status}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {order.items.map((item, index) => (
                    <div key={index} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded bg-gray-50 flex-shrink-0"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/80x80?text=No+Image";
                          }}
                        />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                      </div>

                      <p className="font-semibold text-gray-800 text-sm">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-sm text-gray-600">Total Amount: </span>
                    <span className="text-lg font-bold text-gray-900">₹{order.totalAmount}</span>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded text-sm transition border border-gray-200"
                  >
                    View Order Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;
