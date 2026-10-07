import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";

function ProductDetails() {
  const { id } = useParams();
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);
  const [cartError, setCartError] = useState("");

  const wishlisted = isWishlisted(product?._id);

  const cartItem = product
    ? cartItems.find((item) => (item.product?._id || item.product) === product._id)
    : null;

  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const totalStock =
    cartItem && cartItem.product && typeof cartItem.product.stock === "number"
      ? cartItem.product.stock
      : (product?.stock || 0);

  const availableStock = Math.max(0, totalStock - cartQuantity);

  useEffect(() => {
    api.get("/customers/me")
      .then((res) => setCustomer(res.data))
      .catch(() => {

      });
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product || response.data);
      } catch (err) {
        console.error("Failed to load product details:", err);
        setError("Product not found or something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleToggleWishlist = async () => {
    if (isUpdatingWishlist || !product) return;

    setIsUpdatingWishlist(true);
    setWishlistError("");

    const res = await toggleWishlist(product);
    if (!res.success) {
      if (res.status === 401) {
        setWishlistError("Please login to add to wishlist");
      } else {
        setWishlistError(res.error || "Failed to update wishlist");
      }
    }
    setIsUpdatingWishlist(false);
  };

  const handleAddToCart = async () => {
    if (isUpdatingCart || !product || availableStock <= 0) return;
    setIsUpdatingCart(true);
    setCartError("");

    const res = await addToCart(product._id);
    if (!res.success) {
      if (res.status === 401) {
        setCartError("Please login to add to cart");
      } else {
        setCartError(res.error || "Failed to add to cart");
      }
    }
    setIsUpdatingCart(false);
  };

  const handleIncrease = async () => {
    if (!cartItem || isUpdatingCart || cartItem.quantity >= totalStock) return;
    setIsUpdatingCart(true);
    setCartError("");

    const res = await updateQuantity(product._id, cartItem.quantity + 1);
    if (!res.success) {
      setCartError(res.error || "Failed to update quantity");
    }
    setIsUpdatingCart(false);
  };

  const handleDecrease = async () => {
    if (!cartItem || isUpdatingCart) return;

    setIsUpdatingCart(true);
    setCartError("");

    if (cartItem.quantity <= 1) {
      const res = await removeFromCart(product._id);
      if (!res.success) {
        setCartError(res.error || "Failed to remove item from cart");
      }
    } else {
      const res = await updateQuantity(product._id, cartItem.quantity - 1);
      if (!res.success) {
        setCartError(res.error || "Failed to update quantity");
      }
    }
    setIsUpdatingCart(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar customer={customer} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition"
          >
            &larr; Back to Products
          </Link>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <p className="text-gray-600 text-lg">Loading product details...</p>
          </div>
        )}

        {error && !loading && (
          <div className="py-16 text-center bg-white rounded-lg shadow-sm p-6">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
            >
              Back to Catalog
            </Link>
          </div>
        )}

        {!loading && !error && product && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div className="w-full h-80 md:h-96 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/500x500?text=No+Image";
                  }}
                />
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-600 uppercase tracking-wider">
                      {product.category}
                    </span>

                    <button
                      onClick={handleToggleWishlist}
                      disabled={isUpdatingWishlist}
                      className={`text-xs font-medium px-3 py-1.5 rounded transition flex items-center gap-1 cursor-pointer ${
                        wishlisted
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                      title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      {isUpdatingWishlist ? "⏳ Saving..." : wishlisted ? "♥ Added to Wishlist" : "♡ Add to Wishlist"}
                    </button>
                  </div>

                  {wishlistError && (
                    <p className="text-xs text-red-500 mb-2">{wishlistError}</p>
                  )}

                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {product.name}
                  </h1>

                  <p className="text-3xl font-bold text-gray-900 mb-4">
                    ₹{product.price}
                  </p>

                  <div className="mb-4">
                    <span className="text-sm font-semibold text-gray-700">Availability: </span>
                    {availableStock > 0 ? (
                      <span className="text-sm text-green-600 font-semibold">
                        In Stock ({availableStock} units left)
                      </span>
                    ) : (
                      <span className="text-sm text-red-600 font-semibold">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div>
                  {cartError && (
                    <p className="text-sm text-red-500 mb-2">{cartError}</p>
                  )}
                  {!cartItem ? (
                    <button
                      onClick={handleAddToCart}
                      disabled={isUpdatingCart || totalStock <= 0 || availableStock <= 0}
                      className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                        totalStock <= 0 || availableStock <= 0
                          ? "bg-gray-400 cursor-not-allowed"
                          : isUpdatingCart
                          ? "bg-blue-400 cursor-wait"
                          : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                      }`}
                    >
                      {isUpdatingCart ? "Adding..." : totalStock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                  ) : (
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-12">
                      <button
                        onClick={handleDecrease}
                        disabled={isUpdatingCart}
                        className="w-14 h-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-lg transition flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-base font-semibold text-gray-800 text-center flex-1">
                        {isUpdatingCart ? "Updating..." : `In Cart: ${cartItem.quantity}`}
                      </span>
                      <button
                        onClick={handleIncrease}
                        disabled={cartItem.quantity >= totalStock || isUpdatingCart}
                        className="w-14 h-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-lg transition flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductDetails;
