import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInitialCart = async () => {
      try {
        const res = await api.get("/cart");
        setCartItems(res.data.cart || []);
      } catch (err) {
        if (err.response?.status === 401) {
          setCartItems([]);
        } else {
          setError("Unable to load your cart.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialCart();
  }, []);

  const refreshCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/cart");
      setCartItems(res.data.cart || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setCartItems([]);
      } else {
        setError("Unable to load your cart.");
      }
    } finally {
      setLoading(false);
    }
  };


  const addToCart = async (productId) => {
    try {
      const res = await api.post(`/cart/${productId}`);
      if (res.data.cart) {
        setCartItems(res.data.cart);
      }
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Failed to add product to cart",
        status: err.response?.status
      };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.patch(`/cart/${productId}`, { quantity });
      if (res.data.cart) {
        setCartItems(res.data.cart);
      }
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Failed to update quantity",
        status: err.response?.status
      };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      if (res.data.cart) {
        setCartItems(res.data.cart);
      } else {
        setCartItems((prev) =>
          prev.filter(
            (item) => (item.product?._id || item.product) !== productId
          )
        );
      }
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Failed to remove item from cart",
        status: err.response?.status
      };
    }
  };

  const totalCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + (item.product?.price || 0) * (item.quantity || 0),
    0
  );

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        totalCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export default CartContext;
