import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Package,
  Eye,
  X,
  IndianRupee,
} from "lucide-react";

const API_URL = import.meta.env.VITE_SERVER;

const AdminOrderManagement = () => {
  const [params, setParams] = useSearchParams();

  const orderId = params.get("id");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  const statuses = [
    "All",
    "PLACED",
    "CONFIRMED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ];

  const payments = [
    "All",
    "PAID",
    "PENDING",
    "FAILED",
    "REFUNDED",
  ];

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to fetch orders"
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Fetch orders error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Selected order
  useEffect(() => {
    if (!orderId) {
      setSelectedOrder(null);
      return;
    }

    const found = orders.find(
      (e) => e._id === orderId
    );

    setSelectedOrder(found || null);
  }, [orderId, orders]);

  const filteredOrders = orders.filter((e) => {
    const customerName =
      e.userId?.fullName || "";

    const customerEmail =
      e.userId?.email || "";

    const searchMatch =
      e._id
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      customerName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      customerEmail
        .toLowerCase()
        .includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "All" ||
      e.orderStatus === statusFilter;

    const paymentMatch =
      paymentFilter === "All" ||
      e.paymentStatus === paymentFilter;

    return (
      searchMatch &&
      statusMatch &&
      paymentMatch
    );
  });

  // Update order status
  const updateStatus = async (id, status) => {
    try {
      setActionLoading(true);

      const res = await fetch(
        `${API_URL}/api/orders/status/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderStatus: status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to update order status"
        );
      }

      setOrders((prev) =>
        prev.map((e) =>
          e._id === id
            ? {
                ...e,
                orderStatus: status,
              }
            : e
        )
      );

      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              orderStatus: status,
            }
          : prev
      );

      alert("Order status updated!");
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const closeOrder = () => {
    setParams({
      section: "order-management",
    });
  };

  const statusClass = (status) => {
    if (status === "DELIVERED")
      return "bg-green-100 text-green-600";

    if (status === "CANCELLED")
      return "bg-red-100 text-red-600";

    if (status === "SHIPPED")
      return "bg-blue-100 text-blue-600";

    if (status === "OUT_FOR_DELIVERY")
      return "bg-purple-100 text-purple-600";

    return "bg-yellow-100 text-yellow-600";
  };

  const statusLabel = (status) => {
    const labels = {
      PLACED: "Placed",
      CONFIRMED: "Confirmed",
      SHIPPED: "Shipped",
      OUT_FOR_DELIVERY: "Out for Delivery",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    };

    return labels[status] || status;
  };

  const paymentLabel = (status) => {
    const labels = {
      PAID: "Paid",
      PENDING: "Pending",
      FAILED: "Failed",
      REFUNDED: "Refunded",
    };

    return labels[status] || status;
  };

  const totalSales = orders
    .filter(
      (e) =>
        e.paymentStatus === "PAID" &&
        e.orderStatus !== "CANCELLED"
    )
    .reduce(
      (total, e) => total + (e.totalAmount || 0),
      0
    );

  const pendingOrders = orders.filter(
    (e) =>
      e.orderStatus === "PLACED" ||
      e.orderStatus === "CONFIRMED"
  ).length;

  const processingOrders = orders.filter(
    (e) =>
      e.orderStatus === "SHIPPED" ||
      e.orderStatus === "OUT_FOR_DELIVERY"
  ).length;

  const deliveredOrders = orders.filter(
    (e) => e.orderStatus === "DELIVERED"
  ).length;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-3 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div>
          <p className="text-sm font-semibold text-green-500">
            Shopora Admin
          </p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Order Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage all customer orders.
          </p>
        </div>

        {/* STATS */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-1 text-2xl font-bold">
              {orders.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="mt-1 text-2xl font-bold text-yellow-500">
              {pendingOrders}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Processing
            </p>

            <p className="mt-1 text-2xl font-bold text-orange-500">
              {processingOrders}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Delivered
            </p>

            <p className="mt-1 text-2xl font-bold text-green-500">
              {deliveredOrders}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border bg-white p-4 lg:col-span-1">
            <p className="text-sm text-gray-500">
              Sales
            </p>

            <p className="mt-1 flex items-center text-2xl font-bold">
              <IndianRupee size={19} />
              {totalSales}
            </p>
          </div>

        </div>

        {/* FILTERS */}
        <section className="mt-6 rounded-2xl border bg-white p-4">

          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">

            <div className="relative">

              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search order ID, customer or email..."
                className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-green-500"
              />

            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500"
            >
              {statuses.map((e) => (
                <option key={e} value={e}>
                  {e === "All"
                    ? "All Status"
                    : statusLabel(e)}
                </option>
              ))}
            </select>

            <select
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(e.target.value)
              }
              className="rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500"
            >
              {payments.map((e) => (
                <option key={e} value={e}>
                  {e === "All"
                    ? "All Payments"
                    : paymentLabel(e)}
                </option>
              ))}
            </select>

          </div>

        </section>

        {/* SELECTED ORDER */}
        {selectedOrder && (
          <section className="mt-6 rounded-2xl border bg-white p-5 sm:p-6">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-sm text-gray-500">
                  Order Details
                </p>

                <h2 className="mt-1 break-all text-xl font-bold">
                  {selectedOrder._id}
                </h2>
              </div>

              <button
                onClick={closeOrder}
                className="rounded-full border p-2 hover:bg-gray-100"
              >
                <X size={18} />
              </button>

            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Customer
                </p>

                <p className="mt-1 font-semibold">
                  {selectedOrder.userId?.fullName ||
                    "Unknown"}
                </p>

                <p className="mt-1 break-all text-sm text-gray-500">
                  {selectedOrder.userId?.email ||
                    "No email"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Phone
                </p>

                <p className="mt-1 font-semibold">
                  {selectedOrder.shippingAddress?.phone ||
                    "Not added"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Amount
                </p>

                <p className="mt-1 font-bold">
                  ₹{selectedOrder.totalAmount}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Payment
                </p>

                <p className="mt-1 font-semibold">
                  {paymentLabel(
                    selectedOrder.paymentStatus
                  )}
                </p>

                <p className="text-sm text-gray-500">
                  {selectedOrder.paymentMethod}
                </p>
              </div>

            </div>

            {/* SHIPPING ADDRESS */}
            <div className="mt-5 rounded-xl bg-gray-50 p-4">

              <p className="text-sm text-gray-500">
                Shipping Address
              </p>

              <p className="mt-1 font-semibold">
                {selectedOrder.shippingAddress?.name}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {selectedOrder.shippingAddress?.addressLine},{" "}
                {selectedOrder.shippingAddress?.city},{" "}
                {selectedOrder.shippingAddress?.state} -{" "}
                {selectedOrder.shippingAddress?.pincode}
              </p>

            </div>

            {/* PRODUCTS */}
            <div className="mt-5 border-t pt-5">

              <p className="font-semibold">
                Products
              </p>

              <div className="mt-3 space-y-3">

                {selectedOrder.products?.map(
                  (e, index) => (
                    <div
                      key={index}
                      className="flex gap-3 rounded-xl border p-3"
                    >

                      {e.image && (
                        <img
                          src={e.image}
                          alt={e.title}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}

                      <div className="min-w-0">

                        <p className="font-semibold">
                          {e.title}
                        </p>

                        <p className="text-sm text-gray-500">
                          Size: {e.selectedSize} · Color:{" "}
                          {e.selectedColor}
                        </p>

                        <p className="text-sm">
                          Qty: {e.quantity} · ₹{e.price}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* UPDATE STATUS */}
            <div className="mt-5 border-t pt-5">

              <label className="text-sm font-semibold">
                Update Order Status
              </label>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">

                <select
                  value={selectedOrder.orderStatus}
                  disabled={actionLoading}
                  onChange={(e) =>
                    updateStatus(
                      selectedOrder._id,
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500 sm:max-w-xs"
                >
                  {statuses
                    .filter((e) => e !== "All")
                    .map((e) => (
                      <option key={e} value={e}>
                        {statusLabel(e)}
                      </option>
                    ))}
                </select>

                {actionLoading && (
                  <span className="flex items-center text-sm text-gray-500">
                    Updating...
                  </span>
                )}

              </div>

            </div>

          </section>
        )}

        {/* ORDERS */}
        <section className="mt-6 overflow-hidden rounded-2xl border bg-white">

          <div className="border-b p-5">

            <h2 className="text-xl font-bold">
              All Orders
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredOrders.length} orders found
            </p>

          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500">
              Loading orders...
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[900px] text-left">

                  <thead className="bg-gray-50 text-sm text-gray-500">

                    <tr>

                      <th className="px-5 py-4">
                        Order
                      </th>

                      <th className="px-5 py-4">
                        Customer
                      </th>

                      <th className="px-5 py-4">
                        Amount
                      </th>

                      <th className="px-5 py-4">
                        Payment
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>

                      <th className="px-5 py-4">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredOrders.map((e) => (

                      <tr
                        key={e._id}
                        className="border-t"
                      >

                        <td className="px-5 py-4">

                          <p className="font-semibold">
                            {e._id}
                          </p>

                          <p className="text-xs text-gray-500">
                            {new Date(
                              e.createdAt
                            ).toLocaleDateString()}
                          </p>

                        </td>

                        <td className="px-5 py-4">

                          <p className="font-medium">
                            {e.userId?.fullName ||
                              "Unknown"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {e.userId?.email || ""}
                          </p>

                        </td>

                        <td className="px-5 py-4 font-bold">
                          ₹{e.totalAmount}
                        </td>

                        <td className="px-5 py-4">

                          <p className="font-medium">
                            {paymentLabel(
                              e.paymentStatus
                            )}
                          </p>

                          <p className="text-xs text-gray-500">
                            {e.paymentMethod}
                          </p>

                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                              e.orderStatus
                            )}`}
                          >
                            {statusLabel(
                              e.orderStatus
                            )}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <Link
                            to={`/admin?section=order-management&id=${e._id}`}
                            className="flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold hover:border-green-500 hover:text-green-500"
                          >
                            <Eye size={16} />
                            View
                          </Link>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* MOBILE */}
              <div className="space-y-3 p-4 md:hidden">

                {filteredOrders.map((e) => (

                  <div
                    key={e._id}
                    className="rounded-2xl border p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <h3 className="break-all font-bold">
                          {e._id}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {new Date(
                            e.createdAt
                          ).toLocaleDateString()}
                        </p>

                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                          e.orderStatus
                        )}`}
                      >
                        {statusLabel(
                          e.orderStatus
                        )}
                      </span>

                    </div>

                    <div className="mt-4 space-y-2 text-sm">

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          Customer
                        </span>

                        <span className="text-right font-medium">
                          {e.userId?.fullName ||
                            "Unknown"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          Items
                        </span>

                        <span className="font-medium">
                          {e.products?.length || 0}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          Payment
                        </span>

                        <span className="font-medium">
                          {paymentLabel(
                            e.paymentStatus
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          Total
                        </span>

                        <span className="font-bold">
                          ₹{e.totalAmount}
                        </span>
                      </div>

                    </div>

                    <Link
                      to={`/admin?section=order-management&id=${e._id}`}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 font-semibold hover:border-green-500 hover:text-green-500"
                    >
                      <Eye size={17} />
                      View Order
                    </Link>

                  </div>

                ))}

                {!filteredOrders.length && (
                  <div className="py-10 text-center">

                    <Package
                      size={45}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 font-semibold">
                      No Orders Found
                    </p>

                  </div>
                )}

              </div>
            </>
          )}

        </section>

      </div>
    </main>
  );
};

export default AdminOrderManagement;