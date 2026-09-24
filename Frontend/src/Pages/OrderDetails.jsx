import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_SERVER ||
  import.meta.env.VITE_API_URL ||
  "https://shopara-official.onrender.com";

const statusSteps = [
  { key: "PLACED", title: "Order Placed", icon: CheckCircle },
  { key: "CONFIRMED", title: "Confirmed", icon: Package },
  { key: "SHIPPED", title: "Shipped", icon: Truck },
  { key: "OUT_FOR_DELIVERY", title: "Out for Delivery", icon: Truck },
  { key: "DELIVERED", title: "Delivered", icon: CheckCircle },
];

const statusText = {
  PLACED: "Order Placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const OrderDetails = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const orderId = params.get("id");
  const token = localStorage.getItem("token");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const getOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API_URL}/api/orders/single/${orderId}`,
        config
      );

      const data = res.data.order || res.data.data || res.data;

      if (!data || !data._id) {
        setError("Order not found");
        return;
      }

      setOrder(data);
    } catch (error) {
      console.log("Order details error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to load order details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!orderId) {
      setError("Order ID is missing");
      setLoading(false);
      return;
    }

    getOrder();
  }, [orderId]);

  const cancelOrder = async () => {
    if (!order) return;

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    try {
      setCancelLoading(true);

      await axios.patch(
        `${API_URL}/api/orders/${order.userId}/cancel/${order._id}`,
        {},
        config
      );

      await getOrder();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to cancel order"
      );
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <Package
            size={50}
            className="mx-auto animate-pulse text-gray-300"
          />
          <p className="mt-4 text-gray-500">
            Loading order details...
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center">
          <XCircle
            size={55}
            className="mx-auto text-red-400"
          />

          <h1 className="mt-5 text-2xl font-bold">
            Order Not Found
          </h1>

          <p className="mt-2 text-gray-500">
            {error || "This order could not be found."}
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  const currentStatus = order.orderStatus;

  const currentStepIndex = statusSteps.findIndex(
    (e) => e.key === currentStatus
  );

  const subtotal = order.products?.reduce(
    (total, e) => total + e.price * e.quantity,
    0
  ) || 0;

  const shipping =
    order.totalAmount - subtotal + (order.discountAmount || 0);

  const isCancelled = currentStatus === "CANCELLED";

  const canCancel =
    !isCancelled &&
    ["PLACED", "CONFIRMED"].includes(currentStatus);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Order Details
          </h1>

          <p className="mt-1 break-all text-sm text-gray-500">
            Order ID: {order._id}
          </p>
        </div>

        <Link
          to={`/orders?user=${order.userId}`}
          className="w-fit rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Back to Orders
        </Link>

      </div>

      {/* STATUS */}
      <div className="mt-8 rounded-2xl border bg-white p-5">

        <div className="flex items-center gap-3">

          {isCancelled ? (
            <XCircle className="text-red-500" />
          ) : (
            <Truck className="text-green-500" />
          )}

          <div>
            <h2 className="font-bold">
              {isCancelled
                ? "Your order has been cancelled"
                : `Your order is ${statusText[currentStatus] || currentStatus}`}
            </h2>

            <p className="text-sm text-gray-500">
              {isCancelled
                ? "This order will not be delivered."
                : currentStatus === "DELIVERED"
                ? "Your order has been delivered."
                : "Your order is being processed."}
            </p>
          </div>

        </div>

        {/* STATUS STEPS */}
        {!isCancelled && (
          <div className="mt-8 overflow-x-auto pb-2">
            <div className="grid min-w-[600px] grid-cols-5 gap-2">

              {statusSteps.map((step, index) => {
                const Icon = step.icon;

                const done =
                  currentStepIndex >= index;

                return (
                  <div
                    key={step.key}
                    className="text-center"
                  >
                    <div
                      className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${
                        done
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <p className="mt-2 text-xs font-medium sm:text-sm">
                      {step.title}
                    </p>
                  </div>
                );
              })}

            </div>
          </div>
        )}

      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">

        {/* PRODUCTS */}
        <div className="rounded-2xl border bg-white p-5 lg:col-span-2">

          <h2 className="text-xl font-bold">
            Order Items
          </h2>

          <div className="mt-5 space-y-5">

            {order.products?.map((e, index) => (
              <div
                key={index}
                className="flex gap-4 border-b pb-5 last:border-b-0 last:pb-0"
              >

                <img
                  src={e.image}
                  alt={e.title}
                  className="h-28 w-24 rounded-xl object-cover"
                />

                <div className="flex-1">

                  <h3 className="font-semibold">
                    {e.title}
                  </h3>

                  {e.selectedSize && (
                    <p className="mt-2 text-sm text-gray-500">
                      Size: {e.selectedSize}
                    </p>
                  )}

                  {e.selectedColor && (
                    <p className="text-sm text-gray-500">
                      Color: {e.selectedColor}
                    </p>
                  )}

                  <p className="text-sm text-gray-500">
                    Quantity: {e.quantity}
                  </p>

                  <p className="mt-2 font-bold">
                    ₹{e.price}
                  </p>

                </div>

              </div>
            ))}

          </div>

        </div>

        {/* SUMMARY */}
        <div className="rounded-2xl border bg-white p-5">

          <h2 className="text-xl font-bold">
            Order Summary
          </h2>

          <div className="mt-5 space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-gray-500">
                Subtotal
              </span>

              <span>
                ₹{subtotal}
              </span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>
                  Discount
                </span>

                <span>
                  -₹{order.discountAmount}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-500">
                Delivery
              </span>

              <span>
                ₹{Math.max(0, shipping)}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3 text-base font-bold">
              <span>Total</span>

              <span>
                ₹{order.totalAmount}
              </span>
            </div>

          </div>

          <div className="mt-5 rounded-xl bg-green-50 p-3">

            <p className="text-sm text-gray-500">
              Payment
            </p>

            <p className="font-semibold text-green-600">
              {order.paymentStatus === "PAID"
                ? "Paid"
                : order.paymentMethod === "COD"
                ? "Cash on Delivery"
                : order.paymentStatus}
            </p>

          </div>

        </div>

      </div>

      {/* ADDRESS */}
      <div className="mt-6 rounded-2xl border bg-white p-5">

        <div className="flex items-center gap-2">
          <MapPin
            className="text-green-500"
            size={20}
          />

          <h2 className="text-xl font-bold">
            Delivery Address
          </h2>
        </div>

        <div className="mt-4 text-sm text-gray-600">

          <p className="font-semibold text-gray-900">
            {order.shippingAddress?.name}
          </p>

          <p>
            {order.shippingAddress?.addressLine}
          </p>

          <p>
            {order.shippingAddress?.city},{" "}
            {order.shippingAddress?.state}
          </p>

          <p>
            India - {order.shippingAddress?.pincode}
          </p>

          <p className="mt-1">
            Phone: {order.shippingAddress?.phone}
          </p>

        </div>

      </div>

      {/* ACTIONS */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">

        {canCancel && (
          <button
            onClick={cancelOrder}
            disabled={cancelLoading}
            className="flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-semibold hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle size={18} />

            {cancelLoading
              ? "Cancelling..."
              : "Cancel Order"}
          </button>
        )}

        <Link
          to="/products"
          className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-white hover:bg-green-600"
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </Link>
{/* Done */}
      </div>

    </main>
  );
};

export default OrderDetails;