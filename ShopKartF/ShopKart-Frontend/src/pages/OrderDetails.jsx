import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const userRes = await api.get("/customers/me");
        setCustomer(userRes.data);

        const orderRes = await api.get(`/orders/${id}`);
        setOrder(orderRes.data.order);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else if (err.response?.status === 403) {
          setError("You are not authorized to view this order.");
        } else if (err.response?.status === 404) {
          setError("Order not found.");
        } else {
          setError(err.response?.data?.error || "Failed to load order details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar customer={customer} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition mb-2"
          >
            &larr; Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
          <p className="text-gray-600 text-sm">Review details and items for this order</p>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <p className="text-gray-600 text-lg">Loading order details...</p>
          </div>
        )}

        {error && !loading && (
          <div className="py-16 text-center bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto border border-gray-100">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <Link
              to="/orders"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded text-sm transition"
            >
              Back to Orders
            </Link>
          </div>
        )}

        {!loading && !error && order && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-gray-500 text-sm">Order ID: </span>
                  <span className="font-mono font-bold text-gray-800 text-base">{order._id}</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded ${
                      order.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-700"
                        : order.paymentStatus === "FAILED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    Payment: {order.paymentStatus}
                  </span>

                  <span className="text-xs font-semibold px-3 py-1 rounded bg-blue-100 text-blue-700">
                    Status: {order.status}
                  </span>
                </div>
              </div>

              {order.razorpayPaymentId && (
                <div className="pt-3 text-xs text-gray-600">
                  <span className="font-semibold">Razorpay Payment ID: </span>
                  <span className="font-mono">{order.razorpayPaymentId}</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-base font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
                Shipping Address
              </h2>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.addressLine}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
                <p className="text-gray-500 pt-1">Phone: {order.shippingAddress?.phone}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Purchased Items ({order.items?.length || 0})
              </h2>

              <div className="divide-y divide-gray-100">
                {order.items?.map((item, index) => (
                  <div key={index} className="py-4 flex items-center justify-between gap-4">
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
                        <p className="text-xs text-gray-500">Unit Price: ₹{item.price}</p>
                        <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center text-base font-bold text-gray-900">
                <span>Total Amount:</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OrderDetails;
