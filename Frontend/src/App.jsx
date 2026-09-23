import { Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";

import Login from "./Auth/Login";
import Register from "./Auth/Register";

import Products from "./Components/Products";
import ProductDetails from "./Pages/ProductDetails";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/Checkout";
import OrderConfirmation from "./Pages/OrderConfirmation";
import Orders from "./Pages/Order";
import OrderDetails from "./Pages/OrderDetails";
import Wishlist from "./Pages/Wishlist";
import Profile from "./Pages/Profile";

import Men from "./Navpage/Men";
import Women from "./Navpage/Women";
import Kids from "./Navpage/Kids";
import NewArrivals from "./Navpage/NewArivals";
import Sale from "./Navpage/Sale";

import AdminDashboard from "./Admin/Dashboard";
import AdminProduct from "./Admin/AdminProduct";
import AdminProductManagement from "./Admin/AdminProductManagement";

function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Products */}
        <Route path="/products" element={<Products />} />
        <Route path="/product" element={<ProductDetails />} />

        {/* User */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order" element={<OrderDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />

        {/* Order */}
        <Route
          path="/order-confirmation"
          element={<OrderConfirmation />}
        />

        {/* Categories */}
        <Route path="/men" element={<Men />} />
        <Route path="/women" element={<Women />} />
        <Route path="/kids" element={<Kids />} />
        <Route path="/new-arrivals" element={<NewArrivals />} />
        <Route path="/sale" element={<Sale />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/product" element={<AdminProduct />} />
        <Route
          path="/admin/products"
          element={<AdminProductManagement />}
        />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
{/* DOne */}
      <Footer />
    </div>
  );
}

export default App;