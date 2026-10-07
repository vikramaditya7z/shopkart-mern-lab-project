import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext.jsx";

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalCount, refreshCart, clearCart } = useCart();

  const [customer, setCustomer] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get("/customers/me");
        setCustomer(res.data);
        if (res.data?.fullName) {
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || res.data.fullName,
            phone: prev.phone || res.data.phone || ""
          }));
        }
      } catch {
        navigate("/login");
      }
    };

    fetchCustomer();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const fullName = formData.fullName.trim();
    const phone = formData.phone.trim();
    const addressLine = formData.addressLine.trim();
    const city = formData.city.trim();
    const state = formData.state.trim();
    const pincode = formData.pincode.trim();

    if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
      setFormError("Please fill in all shipping address fields.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setFormError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setFormError("Pincode must contain exactly 6 digits.");
      return;
    }

    if (cartItems.length === 0) {
      setFormError("Your cart is empty. Add products before checking out.");
      return;
    }

    setIsSubmitting(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setFormError("Failed to load Razorpay payment SDK. Please check your internet connection.");
        setIsSubmitting(false);
        return;
      }

      const res = await api.post("/orders/create-payment-order", {
        shippingAddress: {
          fullName,
          phone,
          addressLine,
          city,
          state,
          pincode
        }
      });

      const orderData = res.data;

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ShopKart",
        description: "Order Checkout Payment",
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/orders/verify-payment", {
              orderId: orderData.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              clearCart();
              await refreshCart();
              navigate(`/order-success/${orderData.orderId}`);
            }
          } catch (err) {
            setFormError(err.response?.data?.error || "Payment verification failed.");
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: fullName,
          contact: phone,
          email: customer?.email || ""
        },
        theme: {
          color: "#2563EB"
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response) {
        await api.post("/orders/payment-failed", {
          orderId: orderData.orderId
        }).catch(() => null);
        setFormError(response.error?.description || "Payment failed. Please try again.");
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to initiate payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar customer={customer} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/cart"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition mb-2"
          >
            &larr; Back to Cart
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
          <p className="text-gray-600 text-sm">Provide your shipping address and complete your order</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto border border-gray-100">
            <div className="text-4xl mb-3">🛒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 text-sm mb-6">Add products to your cart before proceeding to checkout.</p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  Shipping Address
                </h2>

                {formError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line *
                    </label>
                    <input
                      type="text"
                      name="addressLine"
                      value={formData.addressLine}
                      onChange={handleChange}
                      placeholder="House No., Street Name, Area"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Mumbai"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Maharashtra"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode (6 digits) *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        maxLength="6"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="400001"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-blue-400 cursor-pointer text-center"
                    >
                      {isSubmitting ? "Processing Payment..." : `Pay ₹${subtotal} with Razorpay`}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 sticky top-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  Order Summary
                </h2>

                <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto mb-4">
                  {cartItems.map((item) => {
                    const product = item.product || {};
                    const productId = product._id || item.product;

                    return (
                      <div key={productId} className="py-3 flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded bg-gray-50 flex-shrink-0"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/60x60?text=No+Image";
                            }}
                          />
                          <div>
                            <p className="font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{product.price}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-800 flex-shrink-0">
                          ₹{(product.price || 0) * item.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Total Items:</span>
                    <span>{totalCount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                    <span>Total Amount:</span>
                    <span>₹{subtotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Checkout;
