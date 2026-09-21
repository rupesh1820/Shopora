import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Tag,
  X,
  CheckCircle,
  Ban,
} from "lucide-react";

const API_URL = import.meta.env.VITE_SERVER;

const AdminCouponManagement = () => {
  const [params, setParams] = useSearchParams();

  const action = params.get("action");
  const couponId = params.get("id");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discount: "",
    minOrder: "",
    maxDiscount: "",
    expiryDate: "",
    isActive: true,
  });

  const token = localStorage.getItem("token");

  const fetchCoupons = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/coupons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to fetch coupons"
        );
      }

      setCoupons(data.coupons || []);
    } catch (error) {
      console.error("Fetch coupons error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredCoupons = coupons.filter((e) => {
    const searchMatch = e.code
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "All" ||
      (statusFilter === "Active"
        ? e.isActive
        : !e.isActive);

    return searchMatch && statusMatch;
  });

  const selectedCoupon = coupons.find(
    (e) => e._id === couponId
  );

  const openAdd = () => {
    setForm({
      code: "",
      discountType: "percentage",
      discount: "",
      minOrder: "",
      maxDiscount: "",
      expiryDate: "",
      isActive: true,
    });

    setParams({
      section: "coupon-management",
      action: "add",
    });
  };

  const openEdit = (e) => {
    setForm({
      code: e.code || "",
      discountType: e.discountType || "percentage",
      discount: e.discount || "",
      minOrder: e.minOrder || "",
      maxDiscount: e.maxDiscount || "",
      expiryDate: e.expiryDate
        ? new Date(e.expiryDate)
            .toISOString()
            .split("T")[0]
        : "",
      isActive: e.isActive !== false,
    });

    setParams({
      section: "coupon-management",
      action: "edit",
      id: e._id,
    });
  };

  const closeForm = () => {
    setParams({
      section: "coupon-management",
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveCoupon = async (e) => {
    e.preventDefault();

    if (
      !form.code ||
      !form.discount ||
      !form.expiryDate
    ) {
      alert("Please fill required fields");
      return;
    }

    try {
      setActionLoading(true);

      const body = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discount: Number(form.discount),
        minOrder: Number(form.minOrder || 0),
        maxDiscount: Number(form.maxDiscount || 0),
        expiryDate: form.expiryDate,
        isActive: form.isActive,
      };

      const url =
        action === "edit" && couponId
          ? `${API_URL}/api/coupons/${couponId}`
          : `${API_URL}/api/coupons`;

      const res = await fetch(url, {
        method:
          action === "edit" && couponId
            ? "PUT"
            : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            `Failed to ${
              action === "edit" ? "update" : "create"
            } coupon`
        );
      }

      alert(
        action === "edit"
          ? "Coupon updated successfully!"
          : "Coupon created successfully!"
      );

      closeForm();
      fetchCoupons();
    } catch (error) {
      console.error("Save coupon error:", error);
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCoupon = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(true);

      const res = await fetch(
        `${API_URL}/api/coupons/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to delete coupon"
        );
      }

      alert("Coupon deleted successfully!");

      fetchCoupons();
    } catch (error) {
      console.error("Delete coupon error:", error);
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      setActionLoading(true);

      const res = await fetch(
        `${API_URL}/api/coupons/toggle/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: !currentStatus,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to update coupon status"
        );
      }

      fetchCoupons();
    } catch (error) {
      console.error(
        "Toggle coupon error:",
        error
      );

      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const statusClass = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-600"
      : "bg-red-100 text-red-600";
  };

  const totalUsage = coupons.reduce(
    (total, e) => total + (e.used || 0),
    0
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-3 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <p className="text-sm font-semibold text-green-500">
              Shopora Admin
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Coupon Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create and manage discount coupons.
            </p>
          </div>

          <button
            onClick={openAdd}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-white hover:bg-green-600 sm:w-auto"
          >
            <Plus size={19} />
            Add Coupon
          </button>

        </div>

        {/* STATS */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Total Coupons
            </p>

            <p className="mt-1 text-2xl font-bold">
              {coupons.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Active
            </p>

            <p className="mt-1 text-2xl font-bold text-green-500">
              {
                coupons.filter(
                  (e) => e.isActive
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Inactive
            </p>

            <p className="mt-1 text-2xl font-bold text-red-500">
              {
                coupons.filter(
                  (e) => !e.isActive
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Total Usage
            </p>

            <p className="mt-1 text-2xl font-bold">
              {totalUsage}
            </p>
          </div>

        </div>

        {/* ADD / EDIT FORM */}
        {(action === "add" ||
          action === "edit") && (
          <section className="mt-6 rounded-2xl border bg-white p-5 sm:p-6">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  {action === "edit"
                    ? "Edit Coupon"
                    : "Create Coupon"}
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {action === "edit"
                    ? "Update Coupon"
                    : "Add New Coupon"}
                </h2>
              </div>

              <button
                onClick={closeForm}
                className="rounded-full border p-2 hover:bg-gray-100"
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={saveCoupon}
              className="mt-6 grid gap-4 sm:grid-cols-2"
            >

              {/* CODE */}
              <div>
                <label className="text-sm font-semibold">
                  Coupon Code
                </label>

                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. SHOPORA20"
                  className="mt-2 w-full rounded-xl border px-4 py-3 uppercase outline-none focus:border-green-500"
                  required
                />
              </div>

              {/* TYPE */}
              <div>
                <label className="text-sm font-semibold">
                  Discount Type
                </label>

                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500"
                >
                  <option value="percentage">
                    Percentage (%)
                  </option>

                  <option value="fixed">
                    Fixed Amount (₹)
                  </option>
                </select>
              </div>

              {/* DISCOUNT */}
              <div>
                <label className="text-sm font-semibold">
                  Discount
                </label>

                <input
                  type="number"
                  min="0"
                  name="discount"
                  value={form.discount}
                  onChange={handleChange}
                  placeholder={
                    form.discountType ===
                    "percentage"
                      ? "10"
                      : "300"
                  }
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
                  required
                />
              </div>

              {/* MIN ORDER */}
              <div>
                <label className="text-sm font-semibold">
                  Minimum Order
                </label>

                <input
                  type="number"
                  min="0"
                  name="minOrder"
                  value={form.minOrder}
                  onChange={handleChange}
                  placeholder="999"
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
                />
              </div>

              {/* MAX DISCOUNT */}
              <div>
                <label className="text-sm font-semibold">
                  Maximum Discount
                </label>

                <input
                  type="number"
                  min="0"
                  name="maxDiscount"
                  value={form.maxDiscount}
                  onChange={handleChange}
                  placeholder="500"
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
                />
              </div>

              {/* EXPIRY */}
              <div>
                <label className="text-sm font-semibold">
                  Expiry Date
                </label>

                <input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
                  required
                />
              </div>

              {/* STATUS */}
              <div>
                <label className="text-sm font-semibold">
                  Status
                </label>

                <select
                  name="isActive"
                  value={String(form.isActive)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isActive:
                        e.target.value ===
                        "true",
                    }))
                  }
                  className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500"
                >
                  <option value="true">
                    Active
                  </option>

                  <option value="false">
                    Inactive
                  </option>
                </select>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600 disabled:opacity-60"
                >
                  {actionLoading
                    ? "Saving..."
                    : action === "edit"
                      ? "Update Coupon"
                      : "Create Coupon"}
                </button>

              </div>

            </form>

          </section>
        )}

        {/* FILTERS */}
        <section className="mt-6 rounded-2xl border bg-white p-4">

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">

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
                placeholder="Search coupon code..."
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
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>

          </div>

        </section>

        {/* COUPONS */}
        <section className="mt-6 overflow-hidden rounded-2xl border bg-white">

          <div className="border-b p-5">

            <h2 className="text-xl font-bold">
              All Coupons
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredCoupons.length} coupons found
            </p>

          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500">
              Loading coupons...
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[1000px] text-left">

                  <thead className="bg-gray-50 text-sm text-gray-500">

                    <tr>
                      <th className="px-5 py-4">
                        Coupon
                      </th>

                      <th className="px-5 py-4">
                        Discount
                      </th>

                      <th className="px-5 py-4">
                        Min Order
                      </th>

                      <th className="px-5 py-4">
                        Expiry
                      </th>

                      <th className="px-5 py-4">
                        Used
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>

                      <th className="px-5 py-4">
                        Actions
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {filteredCoupons.map((e) => (

                      <tr
                        key={e._id}
                        className="border-t"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="rounded-xl bg-yellow-100 p-2.5 text-yellow-600">
                              <Tag size={19} />
                            </div>

                            <div>
                              <p className="font-bold">
                                {e.code}
                              </p>

                              <p className="text-xs text-gray-500">
                                {e._id}
                              </p>
                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <p className="font-bold">
                            {e.discountType ===
                            "percentage"
                              ? `${e.discount}%`
                              : `₹${e.discount}`}
                          </p>

                          <p className="text-xs text-gray-500">
                            Max ₹
                            {e.maxDiscount || 0}
                          </p>

                        </td>

                        <td className="px-5 py-4 font-medium">
                          ₹{e.minOrder || 0}
                        </td>

                        <td className="px-5 py-4">
                          {e.expiryDate
                            ? new Date(
                                e.expiryDate
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {e.used || 0}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                              e.isActive
                            )}`}
                          >
                            {e.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <button
                              onClick={() =>
                                openEdit(e)
                              }
                              className="rounded-lg border p-2 hover:border-green-500 hover:text-green-500"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              disabled={actionLoading}
                              onClick={() =>
                                toggleStatus(
                                  e._id,
                                  e.isActive
                                )
                              }
                              className={`rounded-lg p-2 ${
                                e.isActive
                                  ? "bg-red-50 text-red-600"
                                  : "bg-green-50 text-green-600"
                              }`}
                            >
                              {e.isActive ? (
                                <Ban size={16} />
                              ) : (
                                <CheckCircle
                                  size={16}
                                />
                              )}
                            </button>

                            <button
                              disabled={actionLoading}
                              onClick={() =>
                                deleteCoupon(e._id)
                              }
                              className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* MOBILE */}
              <div className="space-y-3 p-4 md:hidden">

                {filteredCoupons.map((e) => (

                  <div
                    key={e._id}
                    className="rounded-2xl border p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-yellow-100 p-2.5 text-yellow-600">
                          <Tag size={18} />
                        </div>

                        <div>
                          <h3 className="font-bold">
                            {e.code}
                          </h3>

                          <p className="text-xs text-gray-500">
                            {e._id}
                          </p>
                        </div>

                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                          e.isActive
                        )}`}
                      >
                        {e.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </div>

                    <div className="mt-4 space-y-2 text-sm">

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Discount
                        </span>

                        <span className="font-bold">
                          {e.discountType ===
                          "percentage"
                            ? `${e.discount}%`
                            : `₹${e.discount}`}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Min Order
                        </span>

                        <span className="font-medium">
                          ₹{e.minOrder || 0}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Expiry
                        </span>

                        <span className="font-medium">
                          {e.expiryDate
                            ? new Date(
                                e.expiryDate
                              ).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Used
                        </span>

                        <span className="font-medium">
                          {e.used || 0}
                        </span>
                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">

                      <button
                        onClick={() =>
                          openEdit(e)
                        }
                        className="flex items-center justify-center gap-1 rounded-xl border py-2.5 text-sm font-semibold hover:border-green-500 hover:text-green-500"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() =>
                          toggleStatus(
                            e._id,
                            e.isActive
                          )
                        }
                        className={`rounded-xl py-2.5 text-sm font-semibold ${
                          e.isActive
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {e.isActive
                          ? "Disable"
                          : "Enable"}
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() =>
                          deleteCoupon(e._id)
                        }
                        className="flex items-center justify-center rounded-xl bg-red-50 text-red-600"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </div>

                ))}

                {!filteredCoupons.length && (
                  <div className="py-10 text-center">

                    <Tag
                      size={45}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 font-semibold">
                      No Coupons Found
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

export default AdminCouponManagement;