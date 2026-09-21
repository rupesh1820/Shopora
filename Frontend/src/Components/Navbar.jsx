import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setOpen(false);
    navigate("/login");
  };

  return (
    <nav className="border-b bg-white">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          Shop<span className="text-green-500">ora</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 text-sm font-medium lg:flex">
          <Link to="/">Home</Link>
          <Link to="/products?category=men">Men</Link>
          <Link to="/products?category=women">Women</Link>
          <Link to="/products?category=kids">Kids</Link>
          <Link to="/products?category=new">New Arrivals</Link>
          <Link to="/products?sale=true" className="text-red-500">
            Sale
          </Link>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">

          <Link to="/products?search=">
            <Search size={20} />
          </Link>

          {token && user && (
            <>
              <Link to={`/wishlist?user=${user._id}`}>
                <Heart size={20} />
              </Link>

              <Link to={`/cart?user=${user._id}`}>
                <ShoppingBag size={20} />
              </Link>

              <Link to={`/profile?user=${user._id}`}>
                <User size={20} />
              </Link>

              {user.role === "admin" && (
                <Link to="/admin?section=dashboard">
                  Admin
                </Link>
              )}

              <button onClick={logout}>
                <LogOut size={20} />
              </button>
            </>
          )}

          {!token && (
            <Link to="/login">
              <User size={20} />
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden"
          >
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-4 text-sm font-medium">

            <Link
              to="/"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>

            <Link
              to="/products?category=men"
              onClick={() => setOpen(false)}
            >
              Men
            </Link>

            <Link
              to="/products?category=women"
              onClick={() => setOpen(false)}
            >
              Women
            </Link>

            <Link
              to="/products?category=kids"
              onClick={() => setOpen(false)}
            >
              Kids
            </Link>

            <Link
              to="/products?category=new"
              onClick={() => setOpen(false)}
            >
              New Arrivals
            </Link>

            <Link
              to="/products?sale=true"
              onClick={() => setOpen(false)}
              className="text-red-500"
            >
              Sale
            </Link>

            {token && user ? (
              <>
                <Link
                  to={`/profile?user=${user._id}`}
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>

                <Link
                  to={`/orders?user=${user._id}`}
                  onClick={() => setOpen(false)}
                >
                  My Orders
                </Link>

                <button
                  onClick={logout}
                  className="text-left text-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;