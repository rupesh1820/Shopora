import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Users,
  Eye,
  Ban,
  CheckCircle,
  X,
  ShoppingBag,
} from "lucide-react";

const API_URL = import.meta.env.VITE_SERVER;

const AdminUserManagement = () => {
  const [params, setParams] = useSearchParams();

  const userId = params.get("id");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      const formattedUsers = data.users.map((e) => ({
        id: e._id,
        name: e.fullName,
        email: e.email,
        phone: e.address?.find((x) => x.isDefault)?.phone ||
          e.address?.[0]?.phone ||
          "Not added",
        orders: e.orders || 0,
        spent: e.spent || 0,
        status: e.isBlocked ? "Blocked" : "Active",
        joined: e.createdAt
          ? new Date(e.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A",
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Fetch users error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Selected user
  useEffect(() => {
    if (!userId) {
      setSelectedUser(null);
      return;
    }

    const fetchSingleUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch user");
        }

        const e = data.user;

        setSelectedUser({
          id: e._id,
          name: e.fullName,
          email: e.email,
          phone:
            e.address?.find((x) => x.isDefault)?.phone ||
            e.address?.[0]?.phone ||
            "Not added",
          orders: e.orders || 0,
          spent: e.spent || 0,
          status: e.isBlocked ? "Blocked" : "Active",
          joined: e.createdAt
            ? new Date(e.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A",
        });
      } catch (error) {
        console.error("Fetch user error:", error);
      }
    };

    fetchSingleUser();
  }, [userId]);

  const statuses = ["All", "Active", "Blocked"];

  const filteredUsers = users.filter((e) => {
    const searchValue = search.toLowerCase();

    const searchMatch =
      e.id.toLowerCase().includes(searchValue) ||
      e.name.toLowerCase().includes(searchValue) ||
      e.email.toLowerCase().includes(searchValue) ||
      e.phone.includes(search);

    const statusMatch =
      statusFilter === "All" ||
      e.status === statusFilter;

    return searchMatch && statusMatch;
  });

  // Block / Unblock
  const toggleUserStatus = async (id) => {
    try {
      setActionLoading(true);

      const res = await fetch(
        `${API_URL}/api/users/toggle-block/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update user");
      }

      const newStatus = data.user.isBlocked
        ? "Blocked"
        : "Active";

      setUsers((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                status: newStatus,
              }
            : e
        )
      );

      setSelectedUser((e) =>
        e && e.id === id
          ? {
              ...e,
              status: newStatus,
            }
          : e
      );
    } catch (error) {
      console.error("Toggle user error:", error);
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const closeUser = () => {
    setParams({
      section: "user-management",
    });
  };

  const statusClass = (status) => {
    if (status === "Active") {
      return "bg-green-100 text-green-600";
    }

    return "bg-red-100 text-red-600";
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-3 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div>
          <p className="text-sm font-semibold text-green-500">
            Shopora Admin
          </p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            User Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage all registered customers.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Total Users
            </p>

            <p className="mt-1 text-2xl font-bold">
              {loading ? "..." : users.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Active Users
            </p>

            <p className="mt-1 text-2xl font-bold text-green-500">
              {loading
                ? "..."
                : users.filter((e) => e.status === "Active").length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Blocked Users
            </p>

            <p className="mt-1 text-2xl font-bold text-red-500">
              {loading
                ? "..."
                : users.filter((e) => e.status === "Blocked").length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-1 text-2xl font-bold">
              {loading
                ? "..."
                : users.reduce(
                    (total, e) => total + e.orders,
                    0
                  )}
            </p>
          </div>

        </div>

        {/* Filters */}
        <section className="mt-6 rounded-2xl border bg-white p-4">

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">

            <div className="relative">

              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user name, email, phone or ID..."
                className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-green-500"
              />

            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500"
            >
              {statuses.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>

          </div>

        </section>

        {/* Selected User */}
        {selectedUser && (
          <section className="mt-6 rounded-2xl border bg-white p-5 sm:p-6">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-sm text-gray-500">
                  User Details
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {selectedUser.name}
                </h2>
              </div>

              <button
                onClick={closeUser}
                className="rounded-full border p-2 hover:bg-gray-100"
              >
                <X size={18} />
              </button>

            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  User ID
                </p>

                <p className="mt-1 break-all font-semibold">
                  {selectedUser.id}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Email
                </p>

                <p className="mt-1 break-all font-semibold">
                  {selectedUser.email}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Phone
                </p>

                <p className="mt-1 font-semibold">
                  {selectedUser.phone}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Joined
                </p>

                <p className="mt-1 font-semibold">
                  {selectedUser.joined}
                </p>
              </div>

            </div>

            <div className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row">

              <button
                disabled={actionLoading}
                onClick={() =>
                  toggleUserStatus(selectedUser.id)
                }
                className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold ${
                  selectedUser.status === "Active"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {selectedUser.status === "Active" ? (
                  <>
                    <Ban size={18} />
                    {actionLoading ? "Updating..." : "Block User"}
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    {actionLoading ? "Updating..." : "Unblock User"}
                  </>
                )}
              </button>

              <Link
                to={`/admin?section=order-management&user=${selectedUser.id}`}
                className="flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-semibold hover:border-green-500 hover:text-green-500"
              >
                <ShoppingBag size={18} />
                View User Orders
              </Link>

            </div>

          </section>
        )}

        {/* Users Table */}
        <section className="mt-6 overflow-hidden rounded-2xl border bg-white">

          <div className="border-b p-5">

            <h2 className="text-xl font-bold">
              All Users
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredUsers.length} users found
            </p>

          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading users...
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[950px] text-left">

                  <thead className="bg-gray-50 text-sm text-gray-500">
                    <tr>
                      <th className="px-5 py-4">User</th>
                      <th className="px-5 py-4">Contact</th>
                      <th className="px-5 py-4">Orders</th>
                      <th className="px-5 py-4">Total Spent</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((e) => (
                      <tr
                        key={e.id}
                        className="border-t"
                      >

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-600">
                              {e.name?.charAt(0)?.toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold">
                                {e.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                {e.id}
                              </p>
                            </div>

                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {e.email}
                          </p>

                          <p className="text-xs text-gray-500">
                            {e.phone}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {e.orders}
                        </td>

                        <td className="px-5 py-4 font-bold">
                          ₹{e.spent.toLocaleString("en-IN")}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                              e.status
                            )}`}
                          >
                            {e.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <Link
                              to={`/admin?section=user-management&id=${e.id}`}
                              className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold hover:border-green-500 hover:text-green-500"
                            >
                              <Eye size={16} />
                              View
                            </Link>

                            <button
                              disabled={actionLoading}
                              onClick={() =>
                                toggleUserStatus(e.id)
                              }
                              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                                e.status === "Active"
                                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                              } disabled:opacity-50`}
                            >
                              {e.status === "Active"
                                ? "Block"
                                : "Unblock"}
                            </button>

                          </div>

                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>

              {/* Mobile */}
              <div className="space-y-3 p-4 md:hidden">

                {filteredUsers.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-2xl border p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-600">
                          {e.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-bold">
                            {e.name}
                          </h3>

                          <p className="text-xs text-gray-500">
                            {e.id}
                          </p>
                        </div>

                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                          e.status
                        )}`}
                      >
                        {e.status}
                      </span>

                    </div>

                    <div className="mt-4 space-y-2 text-sm">

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          Email
                        </span>

                        <span className="max-w-[60%] break-all text-right font-medium">
                          {e.email}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          Phone
                        </span>

                        <span className="font-medium">
                          {e.phone}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Orders
                        </span>

                        <span className="font-medium">
                          {e.orders}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Total Spent
                        </span>

                        <span className="font-bold">
                          ₹{e.spent.toLocaleString("en-IN")}
                        </span>
                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">

                      <Link
                        to={`/admin?section=user-management&id=${e.id}`}
                        className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold hover:border-green-500 hover:text-green-500"
                      >
                        <Eye size={16} />
                        View
                      </Link>

                      <button
                        disabled={actionLoading}
                        onClick={() =>
                          toggleUserStatus(e.id)
                        }
                        className={`rounded-xl py-2.5 text-sm font-semibold ${
                          e.status === "Active"
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        } disabled:opacity-50`}
                      >
                        {e.status === "Active"
                          ? "Block"
                          : "Unblock"}
                      </button>

                    </div>

                  </div>
                ))}

                {!filteredUsers.length && (
                  <div className="py-10 text-center">

                    <Users
                      size={45}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 font-semibold">
                      No Users Found
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

export default AdminUserManagement;