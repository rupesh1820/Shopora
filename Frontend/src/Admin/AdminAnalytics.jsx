import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Users,
  IndianRupee,
  Download,
  CalendarDays,
  ArrowUpRight,
  Package,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_SERVER ||
  import.meta.env.VITE_API_URL ||
  "https://shopara-official.onrender.com";

const AdminAnalytics = () => {
  const [range, setRange] = useState("Last 30 Days");

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/analytics/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch analytics"
        );
      }

      setAnalytics(data.analytics);
    } catch (error) {
      console.error(
        "Analytics fetch error:",
        error
      );

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatMoney = (value = 0) => {
    return `₹${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  const monthName = (month) => {
    return new Date(
      2000,
      month - 1,
      1
    ).toLocaleString("en-US", {
      month: "short",
    });
  };

  const salesData = useMemo(() => {
    if (!analytics?.monthlySales) return [];

    return analytics.monthlySales.map((e) => ({
      month: `${monthName(e._id.month)} ${e._id.year}`,
      sales: e.sales || 0,
      orders: e.orders || 0,
    }));
  }, [analytics]);

  const maxSales = useMemo(() => {
    if (!salesData.length) return 1;

    return Math.max(
      ...salesData.map((e) => e.sales)
    );
  }, [salesData]);

  const orderStatus = useMemo(() => {
    const data = analytics?.orderStatus || [];

    const getCount = (status) =>
      data.find((e) => e._id === status)
        ?.count || 0;

    return [
      {
        title: "Delivered",
        count: getCount("DELIVERED"),
        icon: CheckCircle2,
      },
      {
        title: "Processing",
        count:
          getCount("CONFIRMED") +
          getCount("PLACED"),
        icon: Package,
      },
      {
        title: "Shipped",
        count: getCount("SHIPPED"),
        icon: Truck,
      },
      {
        title: "Out for Delivery",
        count: getCount("OUT_FOR_DELIVERY"),
        icon: Clock3,
      },
      {
        title: "Cancelled",
        count: getCount("CANCELLED"),
        icon: XCircle,
      },
    ];
  }, [analytics]);

  const handleExport = () => {
    if (!analytics) return;

    const csvRows = [
      ["Report", "Value"],
      [
        "Total Sales",
        analytics.totalSales || 0,
      ],
      [
        "Total Orders",
        analytics.totalOrders || 0,
      ],
      [
        "Total Customers",
        analytics.totalCustomers || 0,
      ],
      [
        "Total Products",
        analytics.totalProducts || 0,
      ],
      [
        "Average Order Value",
        analytics.averageOrderValue || 0,
      ],
    ];

    const csv = csvRows
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download =
      "shopora-analytics-report.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <BarChart3
            size={45}
            className="mx-auto text-gray-300"
          />

          <p className="mt-3 text-gray-500">
            Loading analytics...
          </p>
        </div>
      </main>
    );
  }

  if (!analytics) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Analytics data not available.
        </p>
      </main>
    );
  }

  const stats = [
    {
      title: "Total Sales",
      value: formatMoney(
        analytics.totalSales
      ),
      icon: IndianRupee,
    },
    {
      title: "Total Orders",
      value: analytics.totalOrders || 0,
      icon: ShoppingBag,
    },
    {
      title: "Customers",
      value: analytics.totalCustomers || 0,
      icon: Users,
    },
    {
      title: "Avg. Order Value",
      value: formatMoney(
        analytics.averageOrderValue
      ),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Analytics & Reports
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Track your store performance, sales
              and customer activity.
            </p>

          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3">

              <CalendarDays
                size={18}
                className="text-gray-500"
              />

              <select
                value={range}
                onChange={(e) =>
                  setRange(e.target.value)
                }
                className="bg-transparent text-sm font-medium outline-none"
              >
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>

            </div>

            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <Download size={18} />
              Export Report
            </button>

          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map((e) => {

            const Icon = e.icon;

            return (
              <div
                key={e.title}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm text-gray-500">
                      {e.title}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-gray-900">
                      {e.value}
                    </h2>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                    <Icon size={21} />
                  </div>

                </div>

                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-gray-500">
                  <ArrowUpRight size={16} />
                  Live data
                </div>

              </div>
            );
          })}

        </div>

        {/* SALES + ORDER STATUS */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* SALES CHART */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-bold text-gray-900">
                  Sales Overview
                </h2>

                <p className="text-sm text-gray-500">
                  Sales performance from backend
                  data
                </p>

              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <TrendingUp size={17} />
                {salesData.length} months
              </div>

            </div>

            {salesData.length ? (
              <div className="mt-8 flex h-72 items-end gap-2 overflow-x-auto border-b border-gray-200 px-1 sm:gap-4">

                {salesData.map((e) => {

                  const height = `${
                    (e.sales / maxSales) * 100
                  }%`;

                  return (
                    <div
                      key={e.month}
                      className="group flex h-full min-w-[45px] flex-1 flex-col justify-end"
                    >

                      <div className="relative flex flex-1 items-end">

                        <div
                          style={{ height }}
                          className="w-full rounded-t-lg bg-black transition-all duration-300 group-hover:bg-gray-700"
                        >

                          <div className="hidden group-hover:block">

                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white">
                              {formatMoney(
                                e.sales
                              )}
                            </div>

                          </div>

                        </div>

                      </div>

                      <p className="mt-3 text-center text-xs text-gray-500">
                        {e.month}
                      </p>

                    </div>
                  );
                })}

              </div>
            ) : (
              <div className="flex h-72 items-center justify-center text-gray-400">
                No sales data available.
              </div>
            )}

          </div>

          {/* ORDER STATUS */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Order Status
              </h2>

              <p className="text-sm text-gray-500">
                Current order distribution
              </p>

            </div>

            <div className="mt-6 space-y-4">

              {orderStatus.map((e) => {

                const Icon = e.icon;

                return (
                  <div
                    key={e.title}
                    className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                        <Icon size={18} />
                      </div>

                      <span className="text-sm font-medium text-gray-700">
                        {e.title}
                      </span>

                    </div>

                    <span className="font-bold text-gray-900">
                      {e.count}
                    </span>

                  </div>
                );
              })}

            </div>

          </div>

        </div>

        {/* RECENT ORDERS */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Recent Orders
              </h2>

              <p className="text-sm text-gray-500">
                Latest orders from your store
              </p>

            </div>

            <ShoppingBag size={22} />

          </div>

          <div className="mt-5 space-y-3">

            {analytics.recentOrders?.length ? (
              analytics.recentOrders.map(
                (e) => (
                  <div
                    key={e._id}
                    className="flex flex-col gap-3 rounded-xl border border-gray-100 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="min-w-0">

                      <p className="break-all text-sm font-semibold">
                        #{e._id}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {e.userId?.fullName ||
                          "Unknown Customer"}
                      </p>

                    </div>

                    <div className="flex items-center justify-between gap-5 sm:justify-end">

                      <span className="text-sm font-bold">
                        {formatMoney(
                          e.totalAmount
                        )}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                        {e.orderStatus}
                      </span>

                    </div>

                  </div>
                )
              )
            ) : (
              <p className="py-8 text-center text-gray-400">
                No recent orders.
              </p>
            )}

          </div>

        </div>

        {/* SUMMARY */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
              <BarChart3 size={19} />
            </div>

            <div>

              <h3 className="font-semibold text-gray-900">
                Analytics Summary
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Your store has generated{" "}
                <span className="font-semibold text-gray-700">
                  {formatMoney(
                    analytics.totalSales
                  )}
                </span>{" "}
                in sales across{" "}
                <span className="font-semibold text-gray-700">
                  {analytics.totalOrders}
                </span>{" "}
                orders, with an average order
                value of{" "}
                <span className="font-semibold text-gray-700">
                  {formatMoney(
                    analytics.averageOrderValue
                  )}
                </span>
                .
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

// done

export default AdminAnalytics;