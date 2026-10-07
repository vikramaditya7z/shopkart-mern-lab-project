import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInitialWishlist = async () => {
      try {
        const res = await api.get("/wishlist");
        setWishlist(res.data.wishlist || []);
      } catch (err) {
        if (err.response?.status === 401) {
          setWishlist([]);
        } else {
          setError("Unable to load your wishlist.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialWishlist();
  }, []);

  const refreshWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/wishlist");
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setWishlist([]);
      } else {
        setError("Unable to load your wishlist.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isWishlisted = (productId) => {
    if (!productId) return false;
    return wishlist.some(
      (item) => (item._id || item.id || item).toString() === productId.toString()
    );
  };

  const addToWishlist = async (product) => {
    const productId = product._id || product.id || product;
    try {
      const res = await api.post(`/wishlist/${productId}`);
      setWishlist((prev) => {
        const already = prev.some(
          (item) => (item._id || item.id || item).toString() === productId.toString()
        );
        if (already) return prev;
        return [...prev, typeof product === "object" ? product : { _id: productId }];
      });
      return { success: true, message: res.data.message };
    } catch (err) {
      if (err.response?.status === 409) {
        setWishlist((prev) => {
          const already = prev.some(
            (item) => (item._id || item.id || item).toString() === productId.toString()
          );
          if (already) return prev;
          return [...prev, typeof product === "object" ? product : { _id: productId }];
        });
        return { success: true, message: "Already in Wishlist" };
      }
      return {
        success: false,
        error: err.response?.data?.error || "Failed to add to wishlist",
        status: err.response?.status
      };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      setWishlist((prev) =>
        prev.filter(
          (item) => (item._id || item.id || item).toString() !== productId.toString()
        )
      );
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Failed to remove from wishlist",
        status: err.response?.status
      };
    }
  };

  const toggleWishlist = async (product) => {
    const productId = product._id || product.id || product;
    if (isWishlisted(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        error,
        isWishlisted,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        refreshWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}


// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

export default WishlistContext;
