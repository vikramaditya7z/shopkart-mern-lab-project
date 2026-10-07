import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useWishlist } from "../context/WishlistContext.jsx";

function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, loading, error, removeFromWishlist, refreshWishlist } = useWishlist();
  const [customer, setCustomer] = useState(null);
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

  const handleRetry = async () => {
    await refreshWishlist();
  };

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    await removeFromWishlist(productId);
    setRemovingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar customer={customer} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
          <p className="text-gray-600 text-sm">Products you saved for later</p>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <p className="text-gray-600 text-lg">Loading your wishlist...</p>
          </div>
        )}

        {error && !loading && (
          <div className="py-16 text-center bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded text-sm transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div className="py-16 text-center bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
            <div className="text-4xl mb-3">🛒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Your wishlist is empty 
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Start saving products you love.
            </p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-4 flex flex-col justify-between border border-gray-100"
              >
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

                  <div className="mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                      {product.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1" title={product.name}>
                    {product.name}
                  </h3>

                  <p className="text-xl font-bold text-gray-900 mb-2">
                    ₹{product.price}
                  </p>

                  <p className="text-xs text-gray-500 mb-4">
                    {product.stock > 0 ? (
                      <span className="text-green-600 font-medium">{product.stock} units left</span>
                    ) : (
                      <span className="text-red-600 font-medium">Out of stock</span>
                    )}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <Link
                    to={`/products/${product._id}`}
                    className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded text-sm transition"
                  >
                    View Details
                  </Link>

                  <button
                    onClick={() => handleRemove(product._id)}
                    disabled={removingId === product._id}
                    className="block text-center w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded text-sm transition border border-red-200 cursor-pointer disabled:opacity-50"
                  >
                    {removingId === product._id ? "Removing..." : "Remove from Wishlist"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Wishlist;
