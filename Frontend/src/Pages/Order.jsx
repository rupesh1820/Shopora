import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Package, Truck, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER;

const Orders = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const userId = params.get("user");
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const getOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/orders/${userId}`,
        config
      );

      const e =
        res.data.orders ||
        res.data.data ||
        res.data;

      setOrders(Array.isArray(e) ? e : []);
    } catch (error) {
      console.log("Orders error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    getOrders();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">
          Loading orders...
        </p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

      <h1 className="text-3xl font-bold">
        My Orders
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Track and manage your orders
      </p>

      {!orders.length ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">

          <Package
            size={55}
            className="text-gray-300"
          />

          <h2 className="mt-5 text-xl font-bold">
            No Orders Yet
          </h2>

          <p className="mt-2 text-gray-500">
            Your placed orders will appear here.
          </p>

          <Link
            to="/products"
            className="mt-5 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white"
          >
            Start Shopping
          </Link>

        </div>
      ) : (
        <div className="mt-8 space-y-5">

          {orders.map((e) => {

            const firstProduct = e.products?.[0];

            return (
              <div
                key={e._id}
                className="overflow-hidden rounded-2xl border bg-white"
              >

                {/* HEADER */}
                <div className="flex flex-col gap-2 border-b bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="font-semibold break-all">
                      {e._id}
                    </p>
                  </div>

                  <p className="text-sm text-gray-500">
                    {new Date(
                      e.createdAt
                    ).toLocaleDateString()}
                  </p>

                </div>

                {/* ORDER */}
                <div className="p-4">

                  <div className="flex gap-4">

                    <img
                      src={firstProduct?.image}
                      alt={firstProduct?.title}
                      className="h-24 w-20 rounded-xl object-cover sm:h-28 sm:w-24"
                    />

                    <div className="min-w-0 flex-1">

                      <h2 className="font-semibold sm:text-lg">
                        {firstProduct?.title}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Quantity:{" "}
                        {firstProduct?.quantity || 0}
                      </p>

                      <p className="mt-2 font-bold">
                        ₹{firstProduct?.price || 0}
                      </p>

                      {e.products?.length > 1 && (
                        <p className="mt-1 text-xs text-gray-500">
                          + {e.products.length - 1} more item
                          {e.products.length - 1 > 1 ? "s" : ""}
                        </p>
                      )}

                    </div>

                    {/* DESKTOP STATUS */}
                    <span
                      className={`hidden h-fit rounded-full px-3 py-1 text-xs font-semibold sm:block ${
                        e.orderStatus === "DELIVERED"
                          ? "bg-green-100 text-green-600"
                          : e.orderStatus === "CANCELLED"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {e.orderStatus}
                    </span>

                  </div>

                  {/* MOBILE STATUS */}
                  <span
                    className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold sm:hidden ${
                      e.orderStatus === "DELIVERED"
                        ? "bg-green-100 text-green-600"
                        : e.orderStatus === "CANCELLED"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {e.orderStatus}
                  </span>

                  {/* FOOTER */}
                  <div className="mt-5 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex gap-8">

                      <div>
                        <p className="text-sm text-gray-500">
                          Payment
                        </p>

                        <p className="font-medium">
                          {e.paymentStatus === "PAID"
                            ? "Paid"
                            : e.paymentMethod === "COD"
                            ? "Cash on Delivery"
                            : e.paymentStatus}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Total
                        </p>

                        <p className="font-bold">
                          ₹{e.totalAmount}
                        </p>
                      </div>

                    </div>

                    {/* BUTTONS */}
                    <div className="flex flex-col gap-2 sm:flex-row">

                      <Link
                        to={`/order?id=${e._id}`}
                        className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-gray-50"
                      >
                        <Eye size={17} />
                        View Order
                      </Link>

                      {e.orderStatus !== "CANCELLED" && (
                        <Link
                          to={`/order?id=${e._id}`}
                          className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600"
                        >
                          <Truck size={17} />
                          Track Order
                        </Link>
                      )}

                    </div>

                  </div>

                </div>
              </div>
            );
          })}

        </div>
      )}

    </main>
  );
};

export default Orders;