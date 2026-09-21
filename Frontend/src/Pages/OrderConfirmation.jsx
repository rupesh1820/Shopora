import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";

const OrderConfirmation = () => {
  const [params] = useSearchParams();

  const orderId = params.get("id");
  const payment = params.get("payment") || "paid";

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id;

  if (!orderId) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Order not found
          </h1>

          <Link
            to="/products"
            className="mt-5 inline-block rounded-xl bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-4xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-3xl border bg-white p-6 text-center shadow-sm sm:p-10">

        {/* SUCCESS */}
        <CheckCircle
          size={70}
          className="mx-auto text-green-500"
        />

        <h1 className="mt-5 text-3xl font-bold">
          Order Confirmed!
        </h1>

        <p className="mt-2 text-gray-500">
          Thank you for shopping with Shopora.
        </p>

        {/* ORDER INFO */}
        <div className="mx-auto mt-8 max-w-md rounded-2xl bg-gray-50 p-5 text-left">

          <div className="flex justify-between gap-4">
            <span className="text-gray-500">
              Order ID
            </span>

            <span className="break-all text-right font-semibold">
              {orderId}
            </span>
          </div>

          <div className="mt-4 flex justify-between">
            <span className="text-gray-500">
              Payment
            </span>

            <span className="font-semibold text-green-600">
              {payment === "paid"
                ? "Paid"
                : "Cash on Delivery"}
            </span>
          </div>

          <div className="mt-4 flex justify-between">
            <span className="text-gray-500">
              Estimated Delivery
            </span>

            <span className="font-semibold">
              3-5 Days
            </span>
          </div>

        </div>

        {/* DELIVERY STATUS */}
        <div className="mx-auto mt-6 flex max-w-md items-center gap-4 rounded-2xl border p-4 text-left">

          <Package className="shrink-0 text-green-500" />

          <div>
            <h3 className="font-semibold">
              Your order is being processed
            </h3>

            <p className="text-sm text-gray-500">
              You can track your order from My Orders.
            </p>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <Link
            to={
              userId
                ? `/orders?user=${userId}`
                : "/login"
            }
            className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600"
          >
            View Order
          </Link>

          <Link
            to="/products"
            className="flex items-center justify-center gap-2 rounded-xl border px-6 py-3 font-semibold hover:bg-gray-50"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>

        </div>

      </div>
    </main>
  );
};

export default OrderConfirmation;