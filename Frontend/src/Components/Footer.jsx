import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-16 bg-slate-950 px-8 py-10 text-gray-300">

      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">

        <div>
          <h2 className="text-2xl font-bold text-white">
            Shop<span className="text-green-500">ora</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Fashion that fits your style.
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-white">Shop</h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/products?category=men">Men</Link>
            <Link to="/products?category=women">Women</Link>
            <Link to="/products?category=kids">Kids</Link>
            <Link to="/products?sale=true">Sale</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-white">Help</h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/orders">My Orders</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>
        </div>

      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-gray-800 pt-5 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Shopora. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;