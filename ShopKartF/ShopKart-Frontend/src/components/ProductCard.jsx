import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";

function ProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [wishlistError, setWishlistError] = useState("");
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);
  const [cartError, setCartError] = useState("");

  const wishlisted = isWishlisted(product._id);

  const cartItem = cartItems.find(
    (item) => (item.product?._id || item.product) === product._id
  );

  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const totalStock =
    cartItem && cartItem.product && typeof cartItem.product.stock === "number"
      ? cartItem.product.stock
      : (product?.stock || 0);

  const availableStock = Math.max(0, totalStock - cartQuantity);

  const handleToggleWishlist = async () => {
    if (isUpdatingWishlist) return;

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
    if (isUpdatingCart || availableStock <= 0) return;

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
    <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 flex flex-col justify-between border border-gray-100">
      <div>
        <div className="w-full h-48 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center mb-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
            }}
          />
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">
            {product.category}
          </span>

          <button
            onClick={handleToggleWishlist}
            disabled={isUpdatingWishlist}
            className={`text-xs font-medium px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer ${
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

        <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1" title={product.name}>
          {product.name}
        </h3>

        <p className="text-xl font-bold text-gray-900 mb-2">
          ₹{product.price}
        </p>

        <p className="text-xs text-gray-500 mb-4">
          {availableStock > 0 ? (
            <span className="text-green-600 font-medium">{availableStock} units left</span>
          ) : (
            <span className="text-red-600 font-medium">Out of stock</span>
          )}
        </p>

        {cartError && (
          <p className="text-xs text-red-500 mb-3">{cartError}</p>
        )}
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-100">
        {!cartItem ? (
          <button
            onClick={handleAddToCart}
            disabled={isUpdatingCart || totalStock <= 0 || availableStock <= 0}
            className={`block text-center w-full font-medium py-2 rounded text-sm transition ${
              totalStock <= 0 || availableStock <= 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : isUpdatingCart
                ? "bg-blue-400 text-white cursor-wait"
                : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            }`}
          >
            {isUpdatingCart ? "Adding..." : totalStock <= 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        ) : (
          <div className="flex items-center justify-between border border-gray-300 rounded overflow-hidden h-9">
            <button
              onClick={handleDecrease}
              disabled={isUpdatingCart}
              className="w-10 h-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-base transition flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              -
            </button>
            <span className="text-sm font-semibold text-gray-800 text-center flex-1">
              {isUpdatingCart ? "..." : cartItem.quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={cartItem.quantity >= totalStock || isUpdatingCart}
              className="w-10 h-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-base transition flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              +
            </button>
          </div>
        )}

        <Link
          to={`/products/${product._id}`}
          className="block text-center w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded text-sm transition border border-gray-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
