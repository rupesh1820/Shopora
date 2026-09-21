import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import * as cartApi from "../api/cart";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from AsyncStorage on boot
  useEffect(() => {
    const loadLocalCart = async () => {
      try {
        const saved = await AsyncStorage.getItem("cart");
        if (saved) {
          setCartItems(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load local cart:", e);
      }
    };
    loadLocalCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem("cart", JSON.stringify(cartItems)).catch((e) =>
      console.error("Failed to save cart to storage:", e)
    );
  }, [cartItems]);

  // Sync with backend if user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id && user.id !== "admin") {
      const fetchBackendCart = async () => {
        try {
          setLoading(true);
          const backendCart = await cartApi.getCart(user.id);
          if (backendCart?.products) {
            const formatted = backendCart.products.map((item) => ({
              product: item.productId,
              productId: item.productId?._id || item.productId,
              quantity: item.quantity,
              selectedSize: item.selectedSize,
              selectedColor: item.selectedColor,
            }));
            if (formatted.length > 0) {
              setCartItems(formatted);
            }
          }
        } catch (e) {
          console.warn("Backend cart sync error:", e.message);
        } finally {
          setLoading(false);
        }
      };
      fetchBackendCart();
    }
  }, [isAuthenticated, user]);

  const addToCart = async (product, size, color, quantity = 1) => {
    const pId = product._id;
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === pId &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            productId: pId,
            selectedSize: size,
            selectedColor: color,
            quantity,
          },
        ];
      }
    });

    // Also sync to backend if logged in
    if (isAuthenticated && user?.id && user.id !== "admin") {
      try {
        await cartApi.addToCart(user.id, {
          productId: pId,
          quantity,
          selectedSize: size,
          selectedColor: color,
        });
      } catch (e) {
        console.warn("Cart backend add error:", e.message);
      }
    }
  };

  const updateQuantity = async (productId, size, color, newQty) => {
    if (newQty < 1) {
      removeFromCart(productId, size, color);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (
          item.productId === productId &&
          item.selectedSize === size &&
          item.selectedColor === color
        ) {
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );

    if (isAuthenticated && user?.id && user.id !== "admin") {
      try {
        await cartApi.updateCartItem(user.id, productId, {
          quantity: newQty,
          selectedSize: size,
          selectedColor: color,
        });
      } catch (e) {
        console.warn("Cart backend update error:", e.message);
      }
    }
  };

  const removeFromCart = async (productId, size, color) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
          )
      )
    );

    if (isAuthenticated && user?.id && user.id !== "admin") {
      try {
        await cartApi.removeCartItem(user.id, productId);
      } catch (e) {
        console.warn("Cart backend remove error:", e.message);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    await AsyncStorage.removeItem("cart");

    if (isAuthenticated && user?.id && user.id !== "admin") {
      try {
        await cartApi.clearCart(user.id);
      } catch (e) {
        console.warn("Cart backend clear error:", e.message);
      }
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
