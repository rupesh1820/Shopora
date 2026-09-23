import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Tags,
  X,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_SERVER ||
  import.meta.env.VITE_API_URL ||
  "https://shopara-official.onrender.com";

const AdminCategoryManagement = () => {
  const [params, setParams] = useSearchParams();

  const action = params.get("action");
  const editId = params.get("id");

  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    gender: "Men",
    image: null,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/categories`,
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
            "Failed to fetch categories"
        );
      }

      setCategories(data.categories || []);
    } catch (error) {
      console.error(
        "Fetch categories error:",
        error
      );

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (e) =>
      `${e.title} ${e.gender}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({
      name: "",
      gender: "Men",
      image: null,
    });

    setParams({
      section: "category-management",
      action: "add",
    });
  };

  const openEdit = (e) => {
    setForm({
      name: e.title || "",
      gender: e.gender || "Men",
      image: null,
    });

    setParams({
      section: "category-management",
      action: "edit",
      id: e._id,
    });
  };

  const closeForm = () => {
    setParams({
      section: "category-management",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter category name");
      return;
    }

    try {
      setActionLoading(true);

      const formData = new FormData();

      formData.append(
        "title",
        form.name.trim()
      );

      formData.append(
        "gender",
        form.gender
      );

      if (form.image) {
        formData.append(
          "image",
          form.image
        );
      }

      const url =
        action === "edit" && editId
          ? `${API_URL}/api/categories/${editId}`
          : `${API_URL}/api/categories`;

      const res = await fetch(url, {
        method:
          action === "edit" && editId
            ? "PUT"
            : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            `Failed to ${
              action === "edit"
                ? "update"
                : "create"
            } category`
        );
      }

      alert(
        action === "edit"
          ? "Category updated successfully!"
          : "Category added successfully!"
      );

      closeForm();
      fetchCategories();
    } catch (error) {
      console.error(
        "Save category error:",
        error
      );

      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (
      !window.confirm(
        "Delete this category?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetch(
        `${API_URL}/api/categories/${id}`,
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
          data.message ||
            "Failed to delete category"
        );
      }

      alert(
        "Category deleted successfully!"
      );

      fetchCategories();
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (
    id,
    currentStatus
  ) => {
    try {
      setActionLoading(true);

      const res = await fetch(
        `${API_URL}/api/categories/toggle/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
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
            "Failed to update category status"
        );
      }

      fetchCategories();
    } catch (error) {
      console.error(
        "Toggle category error:",
        error
      );

      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const activeCategories =
    categories.filter(
      (e) => e.isActive
    ).length;

  const inactiveCategories =
    categories.filter(
      (e) => !e.isActive
    ).length;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-3 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-semibold text-green-500">
              Shopora Admin
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Category Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage clothing categories for
              your store.
            </p>
          </div>

          <button
            onClick={openAdd}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-white hover:bg-green-600 sm:w-auto"
          >
            <Plus size={19} />
            Add Category
          </button>

        </div>

        {/* STATS */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Total Categories
            </p>

            <p className="mt-1 text-2xl font-bold">
              {categories.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Active
            </p>

            <p className="mt-1 text-2xl font-bold text-green-500">
              {activeCategories}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Inactive
            </p>

            <p className="mt-1 text-2xl font-bold text-red-500">
              {inactiveCategories}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-500">
              Products
            </p>

            <p className="mt-1 text-2xl font-bold">
              —
            </p>
          </div>

        </div>

        {/* SEARCH */}
        <section className="mt-6 rounded-2xl border bg-white p-4">

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
              placeholder="Search categories..."
              className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-green-500"
            />

          </div>

        </section>

        {/* ADD / EDIT FORM */}
        {(action === "add" ||
          action === "edit") && (
          <section className="mt-6 rounded-2xl border bg-white p-5 sm:p-6">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  {action === "edit"
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add or update a clothing
                  category.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-full border p-2 hover:bg-gray-100"
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >

              {/* NAME */}
              <div>

                <label className="text-sm font-semibold">
                  Category Name
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="T-Shirts"
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
                  required
                />

              </div>

              {/* GENDER */}
              <div>

                <label className="text-sm font-semibold">
                  Gender
                </label>

                <select
                  value={form.gender}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      gender: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500"
                >
                  <option>Men</option>
                  <option>Women</option>
                  <option>Kids</option>
                </select>

              </div>

              {/* IMAGE */}
              <div className="sm:col-span-2">

                <label className="text-sm font-semibold">
                  Category Image
                </label>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      image:
                        e.target.files?.[0] ||
                        null,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border bg-white px-4 py-3"
                />

                {action === "edit" &&
                  !form.image &&
                  editId && (
                    <p className="mt-2 text-xs text-gray-500">
                      Leave empty to keep the
                      existing image.
                    </p>
                  )}

              </div>

              {/* BUTTONS */}
              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border px-6 py-3 font-semibold"
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
                      ? "Update Category"
                      : "Add Category"}
                </button>

              </div>

            </form>

          </section>
        )}

        {/* CATEGORIES */}
        <section className="mt-6 overflow-hidden rounded-2xl border bg-white">

          <div className="border-b p-5">

            <h2 className="text-xl font-bold">
              All Categories
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredCategories.length}{" "}
              categories found
            </p>

          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500">
              Loading categories...
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[700px] text-left">

                  <thead className="bg-gray-50 text-sm text-gray-500">

                    <tr>
                      <th className="px-5 py-4">
                        Category
                      </th>

                      <th className="px-5 py-4">
                        Gender
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

                    {filteredCategories.map(
                      (e) => (
                        <tr
                          key={e._id}
                          className="border-t"
                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              {e.image ? (
                                <img
                                  src={e.image}
                                  alt={e.title}
                                  className="h-11 w-11 rounded-xl object-cover"
                                />
                              ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-500">
                                  <Tags
                                    size={20}
                                  />
                                </div>
                              )}

                              <span className="font-semibold">
                                {e.title}
                              </span>

                            </div>

                          </td>

                          <td className="px-5 py-4">
                            {e.gender}
                          </td>

                          <td className="px-5 py-4">

                            <button
                              disabled={
                                actionLoading
                              }
                              onClick={() =>
                                toggleStatus(
                                  e._id,
                                  e.isActive
                                )
                              }
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                e.isActive
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {e.isActive
                                ? "Active"
                                : "Inactive"}
                            </button>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  openEdit(e)
                                }
                                className="rounded-lg border p-2 hover:border-green-500 hover:text-green-500"
                              >
                                <Edit
                                  size={17}
                                />
                              </button>

                              <button
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  deleteCategory(
                                    e._id
                                  )
                                }
                                className="rounded-lg border p-2 text-red-500 hover:border-red-500"
                              >
                                <Trash2
                                  size={17}
                                />
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* MOBILE */}
              <div className="space-y-3 p-4 md:hidden">

                {filteredCategories.map(
                  (e) => (
                    <div
                      key={e._id}
                      className="rounded-2xl border p-4"
                    >

                      <div className="flex items-center gap-3">

                        {e.image ? (
                          <img
                            src={e.image}
                            alt={e.title}
                            className="h-11 w-11 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-500">
                            <Tags
                              size={20}
                            />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">

                          <h3 className="font-semibold">
                            {e.title}
                          </h3>

                          <p className="text-sm text-gray-500">
                            {e.gender}
                          </p>

                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            e.isActive
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {e.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </div>

                      <div className="mt-4 flex gap-2 border-t pt-3">

                        <button
                          onClick={() =>
                            openEdit(e)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 font-semibold"
                        >
                          <Edit size={17} />
                          Edit
                        </button>

                        <button
                          disabled={
                            actionLoading
                          }
                          onClick={() =>
                            toggleStatus(
                              e._id,
                              e.isActive
                            )
                          }
                          className={`flex flex-1 items-center justify-center rounded-xl border py-2.5 font-semibold ${
                            e.isActive
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {e.isActive
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          disabled={
                            actionLoading
                          }
                          onClick={() =>
                            deleteCategory(
                              e._id
                            )
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 font-semibold text-red-500"
                        >
                          <Trash2 size={17} />
                          Delete
                        </button>

                      </div>

                    </div>
                  )
                )}

                {!filteredCategories.length && (
                  <div className="py-10 text-center">

                    <Tags
                      size={45}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 font-semibold">
                      No Categories Found
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

export default AdminCategoryManagement;