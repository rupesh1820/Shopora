import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_SERVER ||
  import.meta.env.VITE_API_URL ||
  "https://shopara-official.onrender.com";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("user");
  const token = localStorage.getItem("token");

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ================= LOAD CHECKOUT =================

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
      return;
    }

    loadCheckout();
  }, [userId]);

  const loadCheckout = async () => {
    try {
      setLoading(true);
      setError("");

      const [cartRes, addressRes] = await Promise.all([
        axios.get(`${API_URL}/api/cart/${userId}`, config),
        axios.get(`${API_URL}/api/address/${userId}`, config),
      ]);

      // DEBUG
      console.log("========== CART RESPONSE ==========");
      console.log(cartRes.data);

      console.log("========== ADDRESS RESPONSE ==========");
      console.log(addressRes.data);

      const cartData =
        cartRes.data?.cart ||
        cartRes.data?.data ||
        null;

      const addressData =
        cartRes.data?.addresses ||
        addressRes.data?.addresses ||
        addressRes.data?.data ||
        [];

      console.log("========== CART DATA ==========");
      console.log(cartData);

      console.log("========== CART PRODUCTS ==========");
      console.log(cartData?.products);

      setCart(cartData);
      setAddresses(Array.isArray(addressData) ? addressData : []);

      if (Array.isArray(addressData) && addressData.length > 0) {
        setSelectedAddress(
          addressData.find((address) => address.isDefault) ||
            addressData[0]
        );
      }

      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Checkout Load Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load checkout details"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= CART DATA =================

  const items = Array.isArray(cart?.products)
    ? cart.products
    : [];

  // ================= GET PRODUCT =================

  const getProduct = (item) => {
    if (!item) return null;

    // If productId is populated object
    if (
      typeof item.productId === "object" &&
      item.productId !== null
    ) {
      return item.productId;
    }

    // Some backend responses may use product
    if (
      typeof item.product === "object" &&
      item.product !== null
    ) {
      return item.product;
    }

    return null;
  };

  // ================= PRICE =================

  const getProductPrice = (item) => {
    const product = getProduct(item);

    const price =
      product?.price ??
      item?.price ??
      0;

    return Number(price) || 0;
  };

  // ================= IMAGE =================

  const getProductImage = (item) => {
    const product = getProduct(item);

    if (!product) {
      return "";
    }

    // images array
    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }

    // single image fields
    return (
      product.image ||
      product.imageUrl ||
      product.thumbnail ||
      ""
    );
  };

  // ================= TOTAL =================

  const subtotal = items.reduce((sum, item) => {
    const price = getProductPrice(item);
    const quantity = Number(item?.quantity) || 0;

    return sum + price * quantity;
  }, 0);

  const shipping = subtotal >= 999 ? 0 : 49;

  const displayTotal = subtotal + shipping;

  // DEBUG TOTAL
  console.log("Checkout Items:", items);
  console.log("Checkout Subtotal:", subtotal);
  console.log("Checkout Shipping:", shipping);
  console.log("Checkout Total:", displayTotal);

  // ================= CLEAR CART =================

  const clearCart = async () => {
    try {
      await axios.delete(
        `${API_URL}/api/cart/${userId}/clear`,
        config
      );

      setCart((prev) => ({
        ...(prev || {}),
        products: [],
      }));
    } catch (err) {
      console.error("Clear cart error:", err);
    }
  };

  // ================= CREATE ORDER =================

  const createOrder = async () => {
    if (!selectedAddress) {
      throw new Error(
        "Please select a delivery address"
      );
    }

    if (!items.length) {
      throw new Error("Your cart is empty");
    }

    const products = items.map((item) => ({
      productId:
        typeof item.productId === "object"
          ? item.productId?._id
          : item.productId,

      quantity: item.quantity,

      selectedSize: item.selectedSize,

      selectedColor: item.selectedColor,
    }));

    console.log("ORDER PRODUCTS:", products);

    const { data } = await axios.post(
      `${API_URL}/api/orders/${userId}/create`,
      {
        products,

        shippingAddress: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          addressLine: selectedAddress.addressLine,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
        },

        paymentMethod,

        couponCode: couponCode
          .trim()
          .toUpperCase(),
      },
      config
    );

    console.log("CREATE ORDER RESPONSE:", data);

    if (!data.success) {
      throw new Error(
        data.message ||
          "Unable to create order"
      );
    }

    return data.order;
  };

  // ================= COD =================

  const handleCOD = async () => {
    try {
      setPlacingOrder(true);
      setError("");

      const order = await createOrder();

      await clearCart();

      navigate(
        `/order-confirmation?id=${order._id}&payment=cod`
      );
    } catch (err) {
      console.error("COD ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // ================= RAZORPAY =================

  const handleRazorpay = async () => {
    try {
      setPlacingOrder(true);
      setError("");

      // Check frontend Razorpay key
      const razorpayKey =
        import.meta.env.VITE_RAZORPAY_KEY_ID;

      console.log(
        "Razorpay Key:",
        razorpayKey
      );

      if (!razorpayKey) {
        throw new Error(
          "Razorpay key missing. Add VITE_RAZORPAY_KEY_ID to frontend .env and restart Vite."
        );
      }

      // Check SDK
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay SDK not loaded. Please refresh the page."
        );
      }

      // Create Shopara order
      const order = await createOrder();

      console.log(
        "SHOPARA ORDER:",
        order
      );

      // Create Razorpay order
      const { data } = await axios.post(
        `${API_URL}/api/payment/create-order`,
        {
          orderId: order._id,
        },
        config
      );

      console.log(
        "RAZORPAY ORDER RESPONSE:",
        data
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to start payment"
        );
      }

      if (!data.order?.id) {
        throw new Error(
          "Razorpay order ID missing from backend."
        );
      }

      const rzp = new window.Razorpay({
        key: razorpayKey,

        amount: Number(data.order.amount),

        currency:
          data.order.currency || "INR",

        name: "Shopara",

        description:
          "Shopara Clothing Order",

        order_id: data.order.id,

        prefill: {
          name:
            user?.fullName ||
            selectedAddress?.name ||
            "",

          email:
            user?.email || "",

          contact:
            selectedAddress?.phone || "",
        },

        notes: {
          shoparaOrderId: order._id,
        },

        theme: {
          color: "#000000",
        },

        handler: async (response) => {
          try {
            setPlacingOrder(true);
            setError("");

            console.log(
              "RAZORPAY SUCCESS:",
              response
            );

            const { data: verify } =
              await axios.post(
                `${API_URL}/api/payment/verify`,
                {
                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_signature:
                    response.razorpay_signature,
                },
                config
              );

            console.log(
              "PAYMENT VERIFY RESPONSE:",
              verify
            );

            if (!verify.success) {
              throw new Error(
                verify.message ||
                  "Payment verification failed"
              );
            }

            await clearCart();

            navigate(
              `/order-confirmation?id=${verify.orderId}&payment=paid`
            );
          } catch (err) {
            console.error(
              "Payment verification error:",
              err
            );

            setError(
              err.response?.data?.message ||
                err.message ||
                "Payment verification failed"
            );
          } finally {
            setPlacingOrder(false);
          }
        },
      });

      rzp.on(
        "payment.failed",
        (response) => {
          console.error(
            "Payment failed:",
            response.error
          );

          setError(
            response.error?.description ||
              "Payment failed. Please try again."
          );

          setPlacingOrder(false);
        }
      );

      rzp.open();

      setPlacingOrder(false);
    } catch (err) {
      console.error(
        "Razorpay ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start payment"
      );

      setPlacingOrder(false);
    }
  };

  // ================= PLACE ORDER =================

  const placeOrder = () => {
    if (placingOrder) return;

    setError("");

    if (!selectedAddress) {
      setError(
        "Please select a delivery address"
      );
      return;
    }

    if (!items.length) {
      setError("Your cart is empty");
      return;
    }

    if (subtotal <= 0) {
      setError(
        "Product price could not be loaded. Please refresh the page."
      );
      return;
    }

    if (paymentMethod === "COD") {
      handleCOD();
    } else {
      handleRazorpay();
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-3" />

          <p className="text-gray-600">
            Loading checkout...
          </p>
        </div>
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-5 py-5 sm:py-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-2xl sm:text-3xl font-bold mb-5 sm:mb-8">
          Checkout
        </h1>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">

          {/* ================= LEFT ================= */}

          <div className="lg:col-span-2 space-y-5">

            {/* ADDRESS */}

            <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">

              <div className="flex items-center justify-between gap-3 mb-4">

                <h2 className="text-lg sm:text-xl font-semibold">
                  Delivery Address
                </h2>

                <button
                  onClick={() =>
                    navigate(
                      `/profile?user=${userId}`
                    )
                  }
                  className="text-xs sm:text-sm underline whitespace-nowrap"
                >
                  Manage Address
                </button>

              </div>

              {!addresses.length ? (
                <div className="border border-dashed rounded-lg p-5 text-center">

                  <p className="text-gray-500 mb-3">
                    No delivery address found.
                  </p>

                  <button
                    onClick={() =>
                      navigate(
                        `/profile?user=${userId}`
                      )
                    }
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Add Address
                  </button>

                </div>
              ) : (
                <div className="space-y-3">

                  {addresses.map((address) => {

                    const selected =
                      selectedAddress?._id ===
                      address._id;

                    return (
                      <div
                        key={address._id}
                        onClick={() =>
                          !placingOrder &&
                          setSelectedAddress(address)
                        }
                        className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition ${
                          selected
                            ? "border-black ring-1 ring-black"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >

                        <div className="flex gap-3">

                          <div
                            className={`mt-1 w-4 h-4 rounded-full border flex-shrink-0 ${
                              selected
                                ? "border-black bg-black"
                                : "border-gray-400"
                            }`}
                          />

                          <div className="min-w-0">

                            <div className="flex flex-wrap gap-2 items-center">

                              <p className="font-semibold">
                                {address.name}
                              </p>

                              {address.isDefault && (
                                <span className="text-[10px] sm:text-xs bg-gray-100 px-2 py-1 rounded">
                                  Default
                                </span>
                              )}

                            </div>

                            <p className="text-sm text-gray-600 mt-1">
                              {address.phone}
                            </p>

                            <p className="text-sm text-gray-600 mt-1 break-words">
                              {address.addressLine},{" "}
                              {address.city},{" "}
                              {address.state} -{" "}
                              {address.pincode}
                            </p>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>
              )}

            </section>

            {/* ================= PAYMENT ================= */}

            <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">

              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* COD */}

                <label
                  className={`border rounded-lg p-4 cursor-pointer ${
                    paymentMethod === "COD"
                      ? "border-black ring-1 ring-black"
                      : "border-gray-200"
                  }`}
                >

                  <div className="flex gap-3">

                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={
                        paymentMethod === "COD"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                    />

                    <div>

                      <p className="font-medium">
                        Cash on Delivery
                      </p>

                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Pay when your order arrives
                      </p>

                    </div>

                  </div>

                </label>

                {/* RAZORPAY */}

                <label
                  className={`border rounded-lg p-4 cursor-pointer ${
                    paymentMethod === "RAZORPAY"
                      ? "border-black ring-1 ring-black"
                      : "border-gray-200"
                  }`}
                >

                  <div className="flex gap-3">

                    <input
                      type="radio"
                      name="payment"
                      value="RAZORPAY"
                      checked={
                        paymentMethod ===
                        "RAZORPAY"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                    />

                    <div>

                      <p className="font-medium">
                        Razorpay
                      </p>

                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        UPI, Card, Net Banking & Wallet
                      </p>

                    </div>

                  </div>

                </label>

              </div>

            </section>

            {/* ================= COUPON ================= */}

            <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">

              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Coupon
              </h2>

              <div className="flex flex-col sm:flex-row gap-2">

                <input
                  type="text"
                  value={couponCode}
                  disabled={placingOrder}
                  onChange={(e) =>
                    setCouponCode(
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="Enter coupon code"
                  className="flex-1 border rounded-lg px-4 py-3 outline-none focus:border-black"
                />

                <button
                  type="button"
                  disabled={
                    !couponCode.trim() ||
                    placingOrder
                  }
                  onClick={() => setError("")}
                  className="px-5 py-3 bg-black text-white rounded-lg disabled:opacity-40"
                >
                  Apply
                </button>

              </div>

              <p className="text-xs text-gray-500 mt-2">
                Coupon will be validated by the
                server when you place the order.
              </p>

            </section>

          </div>

          {/* ================= SUMMARY ================= */}

          <aside>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm lg:sticky lg:top-5">

              <h2 className="text-lg sm:text-xl font-semibold mb-5">
                Order Summary
              </h2>

              {/* PRODUCTS */}

              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">

                {items.map((item, index) => {

                  const product =
                    getProduct(item);

                  const price =
                    getProductPrice(item);

                  const image =
                    getProductImage(item);

                  const quantity =
                    Number(item?.quantity) || 0;

                  return (
                    <div
                      key={
                        `${
                          product?._id ||
                          item?.productId ||
                          index
                        }-${item?.selectedSize}-${item?.selectedColor}`
                      }
                      className="flex gap-3"
                    >

                      {/* IMAGE */}

                      {image ? (
                        <img
                          src={image}
                          alt={
                            product?.title ||
                            "Product"
                          }
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                          No Image
                        </div>
                      )}

                      {/* PRODUCT INFO */}

                      <div className="min-w-0 flex-1">

                        <p className="font-medium text-sm truncate">
                          {product?.title ||
                            "Product"}
                        </p>

                        {item?.selectedSize && (
                          <p className="text-xs text-gray-500 mt-1">
                            Size:{" "}
                            {item.selectedSize}
                          </p>
                        )}

                        {item?.selectedColor && (
                          <p className="text-xs text-gray-500">
                            Color:{" "}
                            {item.selectedColor}
                          </p>
                        )}

                        <p className="text-sm mt-1">
                          ₹{price} × {quantity}
                        </p>

                        <p className="text-xs text-gray-500">
                          Item Total: ₹
                          {price * quantity}
                        </p>

                      </div>

                    </div>
                  );
                })}

              </div>

              {/* TOTAL */}

              <div className="border-t mt-5 pt-5 space-y-3 text-sm">

                <div className="flex justify-between">

                  <span className="text-gray-600">
                    Subtotal
                  </span>

                  <span>
                    ₹{subtotal}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-gray-600">
                    Shipping
                  </span>

                  <span>
                    {shipping === 0
                      ? "FREE"
                      : `₹${shipping}`}
                  </span>

                </div>

                <div className="border-t pt-3 flex justify-between text-base sm:text-lg font-bold">

                  <span>
                    Total
                  </span>

                  <span>
                    ₹{displayTotal}
                  </span>

                </div>

              </div>

              {/* PLACE ORDER */}

              <button
                onClick={placeOrder}
                disabled={
                  placingOrder ||
                  !selectedAddress ||
                  !items.length
                }
                className="w-full mt-5 bg-black text-white py-3.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
              >

                {placingOrder ? (
                  <span className="flex items-center justify-center gap-2">

                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                    Processing...

                  </span>
                ) : paymentMethod ===
                  "COD" ? (
                  "Place Order"
                ) : (
                  `Pay ₹${displayTotal}`
                )}

              </button>

              <p className="text-[11px] text-gray-500 text-center mt-3">
                Your payment and order details
                are securely processed.
              </p>

            </div>

          </aside>

        </div>

      </div>
    </div>
  );
};

export default Checkout;