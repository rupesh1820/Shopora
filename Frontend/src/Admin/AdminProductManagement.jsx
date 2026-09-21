import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Image,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_SERVER;

const AdminProductManagement = () => {
  const [params, setParams] = useSearchParams();

  const stockId = params.get("stock");

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const categories = [
    "All",
    "T-Shirts",
    "Shirts",
    "Jeans",
    "Trousers",
    "Dresses",
    "Hoodies",
    "Jackets",
  ];

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/api/products`);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(data.products || data.data || []);
    } catch (error) {
      console.error("Fetch products error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((e) => {
    const title = e.title || e.name || "";

    const matchSearch = title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      category === "All" || e.category === category;

    return matchSearch && matchCategory;
  });

  // Delete product
  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(true);

      const res = await fetch(
        `${API_URL}/api/products/delete/${id}`,
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
          data.message || "Failed to delete product"
        );
      }

      setProducts((prev) =>
        prev.filter((e) => e._id !== id)
      );
    } catch (error) {
      console.error("Delete product error:", error);
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Activate / Deactivate
  const toggleStatus = async (id) => {
    try {
      setActionLoading(true);

      const product = products.find((e) => e._id === id);

      if (!product) return;

      const res = await fetch(
        `${API_URL}/api/products/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: product.isActive === false,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to update product"
        );
      }

      const updatedProduct =
        data.product || data.data;

      setProducts((prev) =>
        prev.map((e) =>
          e._id === id
            ? updatedProduct || {
                ...e,
                isActive: e.isActive === false,
              }
            : e
        )
      );
    } catch (error) {
      console.error("Toggle product error:", error);
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const stockProduct = products.find(
    (e) => e._id === stockId
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-3 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-semibold text-green-500">
              Shopora Admin
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Product Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Add, edit and manage your clothing products.
            </p>
          </div>

          <Link
            to="/admin/product?type=add"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-white hover:bg-green-600 sm:w-auto"
          >
            <Plus size={19} />
            Add Product
          </Link>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Total Products
            </p>

            <p className="mt-1 text-2xl font-bold">
              {loading ? "..." : products.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Active
            </p>

            <p className="mt-1 text-2xl font-bold text-green-500">
              {loading
                ? "..."
                : products.filter(
                    (e) => e.isActive !== false
                  ).length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Inactive
            </p>

            <p className="mt-1 text-2xl font-bold text-red-500">
              {loading
                ? "..."
                : products.filter(
                    (e) => e.isActive === false
                  ).length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Categories
            </p>

            <p className="mt-1 text-2xl font-bold">
              {categories.length - 1}
            </p>
          </div>

        </div>

        {/* Search + Filter */}
        <section className="mt-6 rounded-2xl border bg-white p-4">

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative flex-1">

              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-green-500"
              />

            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500"
            >
              {categories.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>

          </div>

        </section>

        {/* Stock Panel */}
        {stockProduct && (
          <section className="mt-5 rounded-2xl border bg-white p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Manage Stock
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {stockProduct.title}
                </h2>
              </div>

              <button
                onClick={() =>
                  setParams({
                    section: "product-management",
                  })
                }
                className="rounded-full border p-2 hover:bg-gray-100"
              >
                <X size={18} />
              </button>

            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Category
                </p>

                <p className="mt-1 font-semibold">
                  {stockProduct.category}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Sizes
                </p>

                <p className="mt-1 font-semibold">
                  {stockProduct.sizes?.join(", ") || "N/A"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Stock
                </p>

                <p className="mt-1 font-semibold">
                  {stockProduct.stock || 0}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <p
                  className={`mt-1 font-semibold ${
                    stockProduct.isActive === false
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {stockProduct.isActive === false
                    ? "Inactive"
                    : "Active"}
                </p>
              </div>

            </div>
          </section>
        )}

        {/* Products */}
        <section className="mt-6 overflow-hidden rounded-2xl border bg-white">

          <div className="border-b p-5">

            <h2 className="text-xl font-bold">
              All Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredProducts.length} products found
            </p>

          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading products...
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[900px] text-left">

                  <thead className="bg-gray-50 text-sm text-gray-500">
                    <tr>
                      <th className="px-5 py-4">
                        Product
                      </th>

                      <th className="px-5 py-4">
                        Category
                      </th>

                      <th className="px-5 py-4">
                        Price
                      </th>

                      <th className="px-5 py-4">
                        Gender
                      </th>

                      <th className="px-5 py-4">
                        Stock
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

                    {filteredProducts.map((e) => (

                      <tr
                        key={e._id}
                        className="border-t"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <img
                              src={e.images?.[0]}
                              alt={e.title}
                              className="h-14 w-14 rounded-xl object-cover"
                            />

                            <div>
                              <p className="font-semibold">
                                {e.title}
                              </p>

                              <p className="text-xs text-gray-500">
                                ID: {e._id}
                              </p>
                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-4">
                          {e.category}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          ₹{e.price}
                        </td>

                        <td className="px-5 py-4">
                          {e.gender}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {e.stock || 0}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              e.isActive === false
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {e.isActive === false
                              ? "Inactive"
                              : "Active"}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <Link
                              to={`/admin/product?id=${e._id}`}
                              title="Edit Product"
                              className="rounded-lg border p-2 hover:border-green-500 hover:text-green-500"
                            >
                              <Edit size={17} />
                            </Link>

                            <button
                              onClick={() =>
                                setParams({
                                  section:
                                    "product-management",
                                  stock: e._id,
                                })
                              }
                              title="Manage Stock"
                              className="rounded-lg border p-2 hover:border-green-500 hover:text-green-500"
                            >
                              <Package size={17} />
                            </button>

                            <Link
                              to={`/admin/product?id=${e._id}&image=edit`}
                              title="Manage Images"
                              className="rounded-lg border p-2 hover:border-green-500 hover:text-green-500"
                            >
                              <Image size={17} />
                            </Link>

                            <button
                              disabled={actionLoading}
                              onClick={() =>
                                toggleStatus(e._id)
                              }
                              title={
                                e.isActive === false
                                  ? "Activate"
                                  : "Deactivate"
                              }
                              className="rounded-lg border p-2 hover:border-green-500 hover:text-green-500 disabled:opacity-50"
                            >
                              {e.isActive === false ? (
                                <Eye size={17} />
                              ) : (
                                <EyeOff size={17} />
                              )}
                            </button>

                            <button
                              disabled={actionLoading}
                              onClick={() =>
                                deleteProduct(e._id)
                              }
                              title="Delete Product"
                              className="rounded-lg border p-2 text-red-500 hover:border-red-500 disabled:opacity-50"
                            >
                              <Trash2 size={17} />
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* Mobile */}
              <div className="space-y-4 p-4 md:hidden">

                {filteredProducts.map((e) => (

                  <div
                    key={e._id}
                    className="rounded-2xl border p-4"
                  >

                    <div className="flex gap-3">

                      <img
                        src={e.images?.[0]}
                        alt={e.title}
                        className="h-24 w-20 shrink-0 rounded-xl object-cover"
                      />

                      <div className="min-w-0 flex-1">

                        <h3 className="font-semibold">
                          {e.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {e.category} • {e.gender}
                        </p>

                        <p className="mt-2 font-bold">
                          ₹{e.price}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Stock: {e.stock || 0}
                        </p>

                        <span
                          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            e.isActive === false
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {e.isActive === false
                            ? "Inactive"
                            : "Active"}
                        </span>

                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-5 gap-2 border-t pt-4">

                      <Link
                        to={`/admin/product?id=${e._id}`}
                        className="flex items-center justify-center rounded-lg border p-2 text-gray-600 hover:text-green-500"
                      >
                        <Edit size={17} />
                      </Link>

                      <button
                        onClick={() =>
                          setParams({
                            section:
                              "product-management",
                            stock: e._id,
                          })
                        }
                        className="flex items-center justify-center rounded-lg border p-2 text-gray-600 hover:text-green-500"
                      >
                        <Package size={17} />
                      </button>

                      <Link
                        to={`/admin/product?id=${e._id}&image=edit`}
                        className="flex items-center justify-center rounded-lg border p-2 text-gray-600 hover:text-green-500"
                      >
                        <Image size={17} />
                      </Link>

                      <button
                        disabled={actionLoading}
                        onClick={() =>
                          toggleStatus(e._id)
                        }
                        className="flex items-center justify-center rounded-lg border p-2 text-gray-600 hover:text-green-500 disabled:opacity-50"
                      >
                        {e.isActive === false ? (
                          <Eye size={17} />
                        ) : (
                          <EyeOff size={17} />
                        )}
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() =>
                          deleteProduct(e._id)
                        }
                        className="flex items-center justify-center rounded-lg border p-2 text-red-500 disabled:opacity-50"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </div>

                ))}

                {!filteredProducts.length && (
                  <div className="py-10 text-center">

                    <Package
                      size={45}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 font-semibold">
                      No products found
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

export default AdminProductManagement;