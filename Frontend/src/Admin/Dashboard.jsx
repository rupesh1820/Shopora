import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

import AdminProductManagement from "./AdminProductManagement";
import AdminCategoryManagement from "./AdminCategoryManagement";
import AdminOrderManagement from "./AdminOrderManagement";
import AdminUserManagement from "./AdminUserManagement";
import AdminCouponManagement from "./AdminCouponManagement";
import AdminAnalytics from "./AdminAnalytics";

import {
  ShoppingBag,
  Users,
  IndianRupee,
  Package,
  Plus,
  ArrowUpRight,
  Tags,
  TicketPercent,
  BarChart3,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_SERVER ||
  import.meta.env.VITE_API_URL ||
  "https://shopara-official.onrender.com";

const AdminDashboard = () => {
  const [params] = useSearchParams();
  const section = params.get("section");

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/analytics/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setAnalytics(data.analytics);
        }
      } catch (error) {
        console.error("Dashboard analytics error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (section === "product-management") {
    return <AdminProductManagement />;
  }

  if (section === "category-management") {
    return <AdminCategoryManagement />;
  }

  if (section === "order-management") {
    return <AdminOrderManagement />;
  }

  if (section === "user-management") {
    return <AdminUserManagement />;
  }

  if (section === "coupon-management") {
    return <AdminCouponManagement />;
  }

  if (section === "analytics") {
    return <AdminAnalytics />;
  }

  const stats = [
    {
      title: "Total Users",
      value: analytics?.totalCustomers || 0,
      icon: Users,
    },
    {
      title: "Total Products",
      value: analytics?.totalProducts || 0,
      icon: Package,
    },
    {
      title: "Total Orders",
      value: analytics?.totalOrders || 0,
      icon: ShoppingBag,
    },
    {
      title: "Revenue",
      value: `₹${(analytics?.totalSales || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
  ];

  const recentOrders = analytics?.recentOrders || [];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-green-500">
              Shopora Admin
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage, control and grow your store.
            </p>
          </div>

          <Link
            to="/admin/product?type=add"
            className="flex w-fit items-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-white hover:bg-green-600"
          >
            <Plus size={19} />
            Add Product
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((e) => {
            const Icon = e.icon;

            return (
              <div
                key={e.title}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-500">
                    <Icon size={21} />
                  </div>
                </div>

                <p className="mt-5 text-sm text-gray-500">
                  {e.title}
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {loading ? "..." : e.value}
                </h2>
              </div>
            );
          })}
        </div>

        {/* Management */}
        <section className="mt-10">
          <div>
            <h2 className="text-xl font-bold">
              Store Management
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage every part of your Shopora store.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">

            <ManagementCard
              title="Product Management"
              text="Add, edit and manage products"
              icon={Package}
              link="/admin?section=product-management"
            />

            <ManagementCard
              title="Category Management"
              text="Manage clothing categories"
              icon={Tags}
              link="/admin?section=category-management"
            />

            <ManagementCard
              title="Order Management"
              text="View and manage customer orders"
              icon={ShoppingBag}
              link="/admin?section=order-management"
            />

            <ManagementCard
              title="User Management"
              text="Manage your customers"
              icon={Users}
              link="/admin?section=user-management"
            />

            <ManagementCard
              title="Coupon Management"
              text="Create and manage coupons"
              icon={TicketPercent}
              link="/admin?section=coupon-management"
            />

            <ManagementCard
              title="Analytics & Reports"
              text="Sales and business reports"
              icon={BarChart3}
              link="/admin?section=analytics"
            />

          </div>
        </section>

        {/* Sales + Quick Actions */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">

          {/* Sales */}
          <section className="rounded-2xl border bg-white p-5 lg:col-span-2">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Sales Overview
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Monthly sales performance
                </p>
              </div>
            </div>

            {analytics?.monthlySales?.length > 0 ? (
              <div className="mt-8 flex h-64 items-end gap-3 border-b sm:gap-6">

                {analytics.monthlySales
                  .slice(-7)
                  .map((e, index, arr) => {

                    const maxSales = Math.max(
                      ...arr.map((x) => x.sales),
                      1
                    );

                    const height =
                      (e.sales / maxSales) * 100;

                    return (
                      <div
                        key={index}
                        className="flex h-full flex-1 flex-col justify-end"
                      >
                        <div
                          className="rounded-t-lg bg-green-500 transition hover:bg-green-600"
                          style={{
                            height: `${Math.max(height, 5)}%`,
                          }}
                        />

                        <span className="mt-2 text-center text-xs text-gray-500">
                          {e._id.month}/{e._id.year}
                        </span>
                      </div>
                    );
                  })}

              </div>
            ) : (
              <div className="mt-8 flex h-64 items-center justify-center text-gray-500">
                No sales data available
              </div>
            )}

            <div className="mt-5">
              <p className="text-sm text-gray-500">
                Total Revenue
              </p>

              <p className="text-2xl font-bold">
                ₹{(analytics?.totalSales || 0).toLocaleString("en-IN")}
              </p>
            </div>

          </section>

          {/* Quick Actions */}
          <section className="rounded-2xl border bg-white p-5">

            <h2 className="text-xl font-bold">
              Quick Actions
            </h2>

            <div className="mt-5 space-y-3">

              <Link
                to="/admin/product?type=add"
                className="flex items-center gap-3 rounded-xl border p-4 hover:border-green-400 hover:bg-green-50"
              >
                <Plus className="text-green-500" size={20} />

                <div>
                  <p className="font-semibold">
                    Add Product
                  </p>

                  <p className="text-xs text-gray-500">
                    Add new clothing
                  </p>
                </div>
              </Link>

              <Link
                to="/admin?section=category-management&action=add"
                className="flex items-center gap-3 rounded-xl border p-4 hover:border-green-400 hover:bg-green-50"
              >
                <Tags className="text-green-500" size={20} />

                <div>
                  <p className="font-semibold">
                    Add Category
                  </p>

                  <p className="text-xs text-gray-500">
                    Create new category
                  </p>
                </div>
              </Link>

              <Link
                to="/admin?section=coupon-management&action=add"
                className="flex items-center gap-3 rounded-xl border p-4 hover:border-green-400 hover:bg-green-50"
              >
                <TicketPercent
                  className="text-green-500"
                  size={20}
                />

                <div>
                  <p className="font-semibold">
                    Create Coupon
                  </p>

                  <p className="text-xs text-gray-500">
                    Add discount coupon
                  </p>
                </div>
              </Link>

            </div>
          </section>

        </div>

        {/* Recent Orders */}
        <section className="mt-8 rounded-2xl border bg-white">

          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="text-xl font-bold">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest customer orders
              </p>
            </div>

            <Link
              to="/admin?section=order-management"
              className="flex items-center gap-1 text-sm font-semibold text-green-600"
            >
              View All
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="overflow-x-auto">

            {recentOrders.length > 0 ? (
              <table className="w-full min-w-[650px] text-left">

                <thead className="bg-gray-50 text-sm text-gray-500">
                  <tr>
                    <th className="px-5 py-4">
                      Order ID
                    </th>

                    <th className="px-5 py-4">
                      Customer
                    </th>

                    <th className="px-5 py-4">
                      Amount
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

                  {recentOrders.map((e) => (
                    <tr
                      key={e._id}
                      className="border-t"
                    >
                      <td className="px-5 py-4 font-semibold">
                        #{e._id.slice(-8)}
                      </td>

                      <td className="px-5 py-4">
                        {e.userId?.fullName || "Customer"}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        ₹{(e.totalAmount || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            e.orderStatus === "DELIVERED"
                              ? "bg-green-100 text-green-600"
                              : e.orderStatus === "CANCELLED"
                                ? "bg-red-100 text-red-600"
                                : e.orderStatus === "PLACED"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {e.orderStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          to={`/admin?section=order-management&id=${e._id}`}
                          className="text-sm font-semibold text-green-600"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}

                </tbody>

              </table>
            ) : (
              <div className="p-10 text-center text-gray-500">
                No orders found
              </div>
            )}

          </div>
        </section>

      </div>
    </main>
  );
};

const ManagementCard = ({
  title,
  text,
  icon: Icon,
  link,
}) => (
  <Link
    to={link}
    className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-green-400 hover:shadow-md"
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-500">
      <Icon size={23} />
    </div>

    <h3 className="mt-4 font-bold">
      {title}
    </h3>

    <p className="mt-1 text-sm text-gray-500">
      {text}
    </p>

    <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-green-600">
      Manage
      <ArrowUpRight size={15} />
    </div>
  </Link>
);

export default AdminDashboard;