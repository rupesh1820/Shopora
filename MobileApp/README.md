# 📱 Shopara Mobile App

The official cross-platform mobile application for **Shopara** built with **React Native** and **Expo**, designed to match the Shopara website's modern look, features, and brand identity.

---

## 🚀 Key Features

- **🏠 Home Screen**:
  - Hero banner with quick "Shop Sale" CTA
  - Category chips with emoji icons (Men, Women, Kids, T-Shirts, Jeans, Hoodies, Jackets, Dresses)
  - Perks bar (Free delivery over ₹999, 100% Genuine, Easy returns)
  - Trending products grid with prices, discounts, and real-time wishlist toggling
- **🧭 Categories & Explore**:
  - Gender tabs: **Men**, **Women**, **Kids**
  - Category cards with preview images and style counts
- **🔍 Search & Filtering**:
  - Instant text search across title, category, and gender
  - Filter pills: All, Men, Women, Kids, Sale items
  - Dynamic result counts and empty state handling
- **👕 Product Details**:
  - Full-width swipeable image gallery with indicator dots
  - Interactive Size selector (`XS`, `S`, `M`, `L`, `XL`, `XXL`)
  - Interactive Color chip selector
  - Stock availability pill
  - Trust badges & description
  - Floating wishlist button + Sticky "Add to Cart" & "Buy Now" actions
- **🛍️ Shopping Bag (Cart)**:
  - Quantity increment/decrement stepper and item removal
  - Coupon code support (`SHOPARA20`, `FLAT10`)
  - Price summary: Subtotal, Discount, Delivery Fee, Total Amount
  - Sticky "Proceed to Checkout" bar
- **💳 Checkout & Orders**:
  - Shipping address form (Name, Phone, Street, City, State, PIN)
  - Payment options: Cash on Delivery (COD) and Online Payment
  - Instant order placement synced with MongoDB backend
- **💖 Wishlist**:
  - Saved favorites grid with quick add to cart
- **👤 Account & Profile**:
  - User greeting with custom avatar
  - Order history with status tags (*Pending, Processing, Shipped, Delivered*)
  - Login & Register authentication flows

---

## ⚙️ How to Run the Mobile App

### 1. Prerequisites
Make sure the **Shopara Backend** server is running:
```bash
# In Shopara/Backend:
npm start
# Server runs on http://localhost:3000
```

### 2. Start the Expo Development Server
Navigate to the `MobileApp` directory and run:
```bash
cd MobileApp
npm start
```
This opens the Expo interactive terminal and prints a **QR Code**.

### 3. Run on Physical Phone (Android / iPhone)
1. Install **Expo Go** from the Google Play Store or Apple App Store.
2. Ensure your phone and PC are connected to the **same Wi-Fi network**.
3. Scan the QR code displayed in your terminal using the Expo Go app (on Android) or Camera app (on iOS).

### 4. Run on Android Emulator / iOS Simulator / Web
```bash
npm run android   # For Android Emulator
npm run ios       # For iOS Simulator (macOS required)
npm run web       # For Web Browser Preview
```

---

## 🌐 API Configuration (`src/constants/config.js`)

The mobile app automatically resolves the correct backend IP:
- **Physical Phone (via Wi-Fi)**: Uses your computer's local IP address (configured as `10.29.51.38:3000`).
- **Web**: Uses `http://localhost:3000`.
- To change the IP address for a new Wi-Fi network, edit `src/constants/config.js`:
  ```javascript
  const LAN_IP = "YOUR_NEW_WIFI_IP";
  ```
