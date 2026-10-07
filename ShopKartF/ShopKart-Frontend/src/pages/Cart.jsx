import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext.jsx";
import Navbar from "../components/Navbar";

function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    subtotal,
    totalCount,
    updateQuantity,
    removeFromCart,
    refreshCart
  } = useCart();

  const [customer, setCustomer] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

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

  const handleIncrease = async (item) => {
    const productId = item.product?._id || item.product;
    const stock = item.product?.stock || 0;
    if (item.quantity >= stock || updatingId || removingId) return;

    setUpdatingId(productId);
    await updateQuantity(productId, item.quantity + 1);
    setUpdatingId(null);
  };

  const handleDecrease = async (item) => {
    const productId = item.product?._id || item.product;
    if (updatingId || removingId) return;

    setUpdatingId(productId);
    if (item.quantity <= 1) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, item.quantity - 1);
    }
    setUpdatingId(null);
  };

  const handleRemove = async (item) => {
    const productId = item.product?._id || item.product;
    if (updatingId || removingId) return;
    setRemovingId(productId);
    await removeFromCart(productId);
    setRemovingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar customer={customer} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
          <p className="text-gray-600 text-sm">
            Review and manage the items you wish to purchase
          </p>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <p className="text-gray-600 text-lg">Loading your cart...</p>
          </div>
        )}

        {error && !loading && (
          <div className="py-16 text-center bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={refreshCart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded text-sm transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="py-16 text-center bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
            <div className="text-4xl mb-3">🛒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Your cart is empty 🛒
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Looks like you haven't added anything yet.
            </p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = item.product || {};
                const productId = product._id || item.product;
                const isUpdating = updatingId === productId;
                const isRemoving = removingId === productId;
                const totalStock = typeof product.stock === "number" ? product.stock : 0;
                const availableStock = Math.max(0, totalStock - item.quantity);

                return (
                  <div
                    key={productId}
                    className="bg-white rounded-lg shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between border border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/150x150?text=No+Image";
                          }}
                        />
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-800 text-base">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-1">
                          ₹{product.price} each
                        </p>
                        <p className="text-xs text-gray-500">
                          {availableStock > 0 ? (
                            <span className="text-green-600 font-medium">
                              {availableStock} units left
                            </span>
                          ) : (
                            <span className="text-red-600 font-medium">
                              Out of stock
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                        <button
                          onClick={() => handleDecrease(item)}
                          disabled={isUpdating || isRemoving}
                          className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          title={item.quantity === 1 ? "Remove from cart" : "Decrease quantity"}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-sm font-semibold text-gray-800 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrease(item)}
                          disabled={
                            item.quantity >= totalStock || isUpdating || isRemoving
                          }
                          className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          title={item.quantity >= totalStock ? "Maximum stock reached" : "Increase quantity"}
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal & Remove */}
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-base">
                          ₹{(product.price || 0) * item.quantity}
                        </p>
                        <button
                          onClick={() => handleRemove(item)}
                          disabled={isRemoving || isUpdating}
                          className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline transition cursor-pointer disabled:opacity-50 mt-1"
                        >
                          {isRemoving ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 sticky top-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({totalCount}):</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-3 border-t border-gray-100">
                    <span>Subtotal:</span>
                    <span>₹{subtotal}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer text-center"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
