import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  Tag,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_SERVER ||
  import.meta.env.VITE_API_URL ||
  "https://shopara-official.onrender.com";

const Cart = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const userId = params.get("user");
  const token = localStorage.getItem("token");

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // GET CART
  const getCart = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/cart/${userId}`,
        config
      );

      const e = res.data.cart || res.data.data || res.data;

      setCart(e?.products || []);
    } catch (error) {
      console.log("Cart error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    getCart();
  }, [userId]);

  // UPDATE QUANTITY
  const updateQnty = async (e, value) => {
    const qty = e.quantity + value;

    if (qty < 1) return;

    try {
      await axios.put(
        `${API_URL}/api/cart/${userId}/update/${e.productId._id}`,
        {
          quantity: qty,
          selectedSize: e.selectedSize,
          selectedColor: e.selectedColor,
        },
        config
      );

      getCart();
    } catch (error) {
      console.log("Update cart error:", error);
    }
  };

  // REMOVE ITEM
  const removeItem = async (e) => {
    try {
      await axios.delete(
        `${API_URL}/api/cart/${userId}/remove/${e.productId._id}`,
        config
      );

      getCart();
    } catch (error) {
      console.log("Remove cart error:", error);
    }
  };

  // CLEAR CART
  const clearCart = async () => {
    try {
      await axios.delete(
        `${API_URL}/api/cart/${userId}/clear`,
        config
      );

      setCart([]);
    } catch (error) {
      console.log("Clear cart error:", error);
    }
  };

  const subtotal = cart.reduce(
    (total, e) =>
      total + e.productId.price * e.quantity,
    0
  );

  const delivery = subtotal > 999 ? 0 : 99;
  const total = subtotal + delivery;

  if (loading) {
    return (
      <p className="p-10 text-center">
        Loading cart...
      </p>
    );
  }

  if (!cart.length) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <ShoppingBag
          size={55}
          className="text-gray-300"
        />

        <h1 className="mt-5 text-2xl font-bold">
          Your Cart is Empty
        </h1>

        <p className="mt-2 text-gray-500">
          Looks like you haven't added anything yet.
        </p>

        <Link
          to="/products"
          className="mt-6 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Shopping Cart
          </h1>

          <p className="mt-2 text-gray-500">
            {cart.length} items in your cart
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">

        {/* CART ITEMS */}
        <div className="space-y-4 lg:col-span-2">

          {cart.map((e) => (
            <div
              key={`${e.productId._id}-${e.selectedSize}-${e.selectedColor}`}
              className="flex gap-4 rounded-2xl border bg-white p-4"
            >

              {/* IMAGE */}
              <Link
                to={`/product?id=${e.productId._id}`}
              >
                <img
                  src={e.productId.images?.[0]}
                  alt={e.productId.title}
                  className="h-32 w-28 rounded-xl object-cover sm:h-40 sm:w-32"
                />
              </Link>

              {/* DETAILS */}
              <div className="flex flex-1 flex-col">

                <div className="flex justify-between gap-3">
                  <div>
                    <h2 className="font-semibold sm:text-lg">
                      {e.productId.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Size: {e.selectedSize} · Color:{" "}
                      {e.selectedColor}
                    </p>

                    <p className="mt-1 font-semibold">
                      ₹{e.productId.price}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(e)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={19} />
                  </button>
                </div>

                {/* QUANTITY */}
                <div className="mt-auto flex items-end justify-between">

                  <div className="flex items-center rounded-lg border">

                    <button
                      disabled={e.quantity <= 1}
                      onClick={() =>
                        updateQnty(e, -1)
                      }
                      className="p-2 disabled:opacity-30"
                    >
                      <Minus size={15} />
                    </button>

                    <span className="px-3">
                      {e.quantity}
                    </span>

                    <button
                      disabled={
                        e.quantity >= e.productId.stock
                      }
                      onClick={() =>
                        updateQnty(e, 1)
                      }
                      className="p-2 disabled:opacity-30"
                    >
                      <Plus size={15} />
                    </button>

                  </div>

                  <p className="font-bold">
                    ₹{e.productId.price * e.quantity}
                  </p>

                </div>
              </div>
            </div>
          ))}

          {/* COUPON */}
          <div className="rounded-2xl border p-5">
            <h3 className="flex items-center gap-2 font-semibold">
              <Tag size={18} />
              Apply Coupon
            </h3>

            <div className="mt-4 flex gap-3">
              <input
                value={couponCode}
                onChange={(e) =>
                  setCouponCode(
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="Enter coupon code"
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
              />

              <button
                className="rounded-xl bg-slate-900 px-5 font-semibold text-white"
              >
                Apply
              </button>
            </div>
          </div>

        </div>

        {/* SUMMARY */}
        <div className="h-fit rounded-2xl border bg-gray-50 p-6">

          <h2 className="text-xl font-bold">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4 text-sm">

            <div className="flex justify-between">
              <span className="text-gray-500">
                Subtotal
              </span>

              <span>
                ₹{subtotal}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Delivery
              </span>

              <span>
                {delivery === 0
                  ? "FREE"
                  : `₹${delivery}`}
              </span>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>

                <span>
                  ₹{total}
                </span>
              </div>
            </div>

          </div>

          <Link
            to={`/checkout?user=${userId}`}
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-green-500 py-3 font-semibold text-white hover:bg-green-600"
          >
            Proceed to Checkout
          </Link>

          <Link
            to="/products"
            className="mt-3 block text-center text-sm text-gray-500 hover:text-green-500"
          >
            Continue Shopping
          </Link>

        </div>
      </div>
    </main>
  );
};

export default Cart;