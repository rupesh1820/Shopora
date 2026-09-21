import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import * as wishlistApi from "../api/wishlist";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from AsyncStorage on boot
  useEffect(() => {
    const loadLocalWishlist = async () => {
      try {
        const saved = await AsyncStorage.getItem("wishlist");
        if (saved) {
          setWishlist(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load local wishlist:", e);
      }
    };
    loadLocalWishlist();
  }, []);

  // Save to AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem("wishlist", JSON.stringify(wishlist)).catch((e) =>
      console.error("Failed to save wishlist:", e)
    );
  }, [wishlist]);

  // Sync with backend if logged in
  useEffect(() => {
    if (isAuthenticated && user?.id && user.id !== "admin") {
      const fetchBackendWishlist = async () => {
        try {
          const items = await wishlistApi.getWishlist(user.id);
          if (items && Array.isArray(items)) {
            setWishlist(items);
          }
        } catch (e) {
          console.warn("Backend wishlist sync error:", e.message);
        }
      };
      fetchBackendWishlist();
    }
  }, [isAuthenticated, user]);

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  const toggleWishlist = async (product) => {
    const pId = product._id;
    const exists = isInWishlist(pId);

    if (exists) {
      setWishlist((prev) => prev.filter((item) => (item._id || item) !== pId));
      if (isAuthenticated && user?.id && user.id !== "admin") {
        try {
          await wishlistApi.removeFromWishlist(user.id, pId);
        } catch (e) {
          console.warn("Backend wishlist remove error:", e.message);
        }
      }
    } else {
      setWishlist((prev) => [...prev, product]);
      if (isAuthenticated && user?.id && user.id !== "admin") {
        try {
          await wishlistApi.addToWishlist(user.id, pId);
        } catch (e) {
          console.warn("Backend wishlist add error:", e.message);
        }
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
export default WishlistContext;
