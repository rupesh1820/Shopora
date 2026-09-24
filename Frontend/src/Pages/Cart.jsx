import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const savedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userId =
    savedUser?._id ||
    savedUser?.id ||
    savedUser?.userId;

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ================= GET CART =================

  const getCart = async () => {
    try {
      setLoading(true);

      if (!userId) {
        navigate("/login");
        return;
      }

      const res = await axios.get(
        `${API_URL}/api/cart/${userId}`,
        config
      );

      console.log("CART RESPONSE:", res.data);

      const data =
        res.data?.cart ||
        res.data?.data ||
        res.data;

      const products = data?.products || [];

      console.log("CART PRODUCTS:", products);

      setCart(
        Array.isArray(products)
          ? products
          : []
      );
    } catch (error) {
      console.error(
        "Cart error:",
        error.response?.data || error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD =================

  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    getCart();
  }, [userId]);

  // ================= UPDATE QUANTITY =================

  const updateQnty = async (item, value) => {
    const qty =
      Number(item.quantity) + value;

    if (qty < 1) return;

    if (
      item.productId?.stock !== undefined &&
      qty > Number(item.productId.stock)
    ) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/cart/${userId}/update/${item.productId._id}`,
        {
          quantity: qty,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        },
        config
      );

      await getCart();
    } catch (error) {
      console.error(
        "Update cart error:",
        error.response?.data || error
      );
    }
  };

  // ================= REMOVE ITEM =================

  const removeItem = async (item) => {
    try {
      await axios.delete(
        `${API_URL}/api/cart/${userId}/remove/${item.productId._id}`,
        {
          ...config,
          data: {
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          },
        }
      );

      await getCart();
    } catch (error) {
      console.error(
        "Remove cart error:",
        error.response?.data || error
      );
    }
  };

  // ================= CLEAR CART =================

  const clearCart = async () => {
    try {
      await axios.delete(
        `${API_URL}/api/cart/${userId}/clear`,
        config
      );

      setCart([]);
    } catch (error) {
      console.error(
        "Clear cart error:",
        error.response?.data || error
      );
    }
  };

  // ================= TOTAL =================

  const subtotal = cart.reduce(
    (total, item) => {
      const price =
        Number(item.productId?.price) || 0;

      const quantity =
        Number(item.quantity) || 0;

      return total + price * quantity;
    },
    0
  );

  const delivery =
    subtotal >= 999 ? 0 : 99;

  const total =
    subtotal + delivery;

  // ================= LOADING =================

  if (loading) {
    return (
      <p className="p-10 text-center">
        Loading cart...
      </p>
    );
  }

  // ================= EMPTY CART =================

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

  // ================= CART =================

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Shopping Cart
          </h1>

          <p className="mt-2 text-gray-500">
            {cart.length}{" "}
            {cart.length === 1
              ? "item"
              : "items"}{" "}
            in your cart
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

          {cart.map((item, index) => {
            const product =
              item.productId;

            const price =
              Number(product?.price) || 0;

            const quantity =
              Number(item.quantity) || 0;

            const image =
              product?.images?.[0] ||
              product?.image ||
              product?.imageUrl ||
              "";

            const productId =
              product?._id;

            return (
              <div
                key={`${productId || index}-${item.selectedSize}-${item.selectedColor}`}
                className="flex gap-4 rounded-2xl border bg-white p-4"
              >

                {/* IMAGE */}

                <Link
                  to={
                    productId
                      ? `/product?id=${productId}`
                      : "/products"
                  }
                  className="shrink-0"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={
                        product?.title ||
                        "Product"
                      }
                      className="h-32 w-28 rounded-xl object-cover sm:h-40 sm:w-32"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-32 w-28 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400 sm:h-40 sm:w-32">
                      No Image
                    </div>
                  )}
                </Link>

                {/* DETAILS */}

                <div className="flex flex-1 flex-col">

                  <div className="flex justify-between gap-3">

                    <div>
                      <h2 className="font-semibold sm:text-lg">
                        {product?.title ||
                          "Product"}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Size:{" "}
                        {item.selectedSize ||
                          "-"}{" "}
                        · Color:{" "}
                        {item.selectedColor ||
                          "-"}
                      </p>

                      <p className="mt-1 font-semibold">
                        ₹{price}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        removeItem(item)
                      }
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={19} />
                    </button>
                  </div>

                  {/* QUANTITY */}

                  <div className="mt-auto flex items-end justify-between">

                    <div className="flex items-center rounded-lg border">

                      <button
                        disabled={
                          quantity <= 1
                        }
                        onClick={() =>
                          updateQnty(
                            item,
                            -1
                          )
                        }
                        className="p-2 disabled:opacity-30"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="px-3">
                        {quantity}
                      </span>

                      <button
                        disabled={
                          product?.stock !==
                            undefined &&
                          quantity >=
                            Number(
                              product.stock
                            )
                        }
                        onClick={() =>
                          updateQnty(
                            item,
                            1
                          )
                        }
                        className="p-2 disabled:opacity-30"
                      >
                        <Plus size={15} />
                      </button>

                    </div>

                    <p className="font-bold">
                      ₹{price * quantity}
                    </p>

                  </div>
                </div>
              </div>
            );
          })}

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
                type="button"
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

                <span>
                  Total
                </span>

                <span>
                  ₹{total}
                </span>

              </div>

            </div>

          </div>

          {/* CHECKOUT */}

          <Link
            to="/checkout"
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