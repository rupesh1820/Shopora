import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";

const API_URL =
  import.meta.env.VITE_SERVER ||
  import.meta.env.VITE_API_URL ||
  "https://shopara-official.onrender.com";

const AdminProduct = () => {
  const [params] = useSearchParams();

  const id = params.get("id");
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "",
    category: "T-Shirts",
    gender: "Men",
    price: "",
    oldPrice: "",
    off: "",
    sizes: [],
    colors: [],
    images: [],
    description: "",
    stock: 0,
    isActive: true,
  });

  const [colorInput, setColorInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const categoryData = {
    Men: [
      "T-Shirts",
      "Shirts",
      "Jeans",
      "Trousers",
      "Hoodies",
      "Jackets",
    ],
    Women: [
      "Dresses",
      "T-Shirts",
      "Jeans",
      "Shirts",
      "Hoodies",
      "Jackets",
    ],
    Kids: [
      "T-Shirts",
      "Jeans",
      "Dresses",
      "Hoodies",
      "Shirts",
      "Jackets",
    ],
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const token = localStorage.getItem("token");

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const changeGender = (gender) => {
    setForm((prev) => ({
      ...prev,
      gender,
      category: categoryData[gender][0],
    }));
  };

  // Get product for edit
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setFetching(true);

        const res = await fetch(
          `${API_URL}/api/products/${id}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Failed to fetch product"
          );
        }

        const e = data.product || data.data;

        setForm({
          name: e.title || "",
          category: e.category || "T-Shirts",
          gender: e.gender || "Men",
          price: e.price || "",
          oldPrice: e.oldPrice || "",
          off: e.off || "",
          sizes: e.sizes || [],
          colors: e.colors || [],
          images: e.images || [],
          description: e.description || "",
          stock: e.stock || 0,
          isActive: e.isActive !== false,
        });
      } catch (error) {
        console.error("Fetch product error:", error);
        alert(error.message);
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addSize = (size) => {
    if (form.sizes.includes(size)) return;

    setForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, size],
    }));
  };

  const removeSize = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((e) => e !== size),
    }));
  };

  const addColor = () => {
    const color = colorInput.trim();

    if (!color || form.colors.includes(color)) return;

    setForm((prev) => ({
      ...prev,
      colors: [...prev.colors, color],
    }));

    setColorInput("");
  };

  const removeColor = (color) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((e) => e !== color),
    }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    const images = [...form.images, ...files].slice(0, 3);

    setForm((prev) => ({
      ...prev,
      images,
    }));

    e.target.value = "";
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, e) => e !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.sizes.length) {
      alert("Please select at least one size.");
      return;
    }

    if (!form.colors.length) {
      alert("Please add at least one color.");
      return;
    }

    if (!form.images.length) {
      alert("Please upload at least one image.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", form.name);
      formData.append("category", form.category);
      formData.append("gender", form.gender);
      formData.append("price", Number(form.price));
      formData.append("oldPrice", Number(form.oldPrice || 0));
      formData.append("off", Number(form.off || 0));
      formData.append("description", form.description);
      formData.append("stock", Number(form.stock || 0));
      formData.append("isActive", form.isActive);

      form.sizes.forEach((e) => {
        formData.append("sizes", e);
      });

      form.colors.forEach((e) => {
        formData.append("colors", e);
      });

      form.images.forEach((e) => {
        if (e instanceof File) {
          formData.append("images", e);
        }
      });

      const url = isEdit
        ? `${API_URL}/api/products/update/${id}`
        : `${API_URL}/api/products/add`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            `Failed to ${isEdit ? "update" : "add"} product`
        );
      }

      alert(
        isEdit
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      window.location.href =
        "/admin?section=product-management";
    } catch (error) {
      console.error("Product save error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading product...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">

        {/* HEADER */}
        <div className="mb-6 sm:mb-8">

          <Link
            to="/admin?section=product-management"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-500"
          >
            <ArrowLeft size={18} />
            Back to Products
          </Link>

          <h1 className="mt-4 text-2xl font-bold sm:mt-5 sm:text-3xl">
            {isEdit ? "Edit Product" : "Add Product"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {isEdit
              ? "Update your product details."
              : "Add a new product to your Shopora store."}
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 sm:space-y-6"
        >

          {/* BASIC INFORMATION */}
          <section className="w-full rounded-2xl border bg-white p-4 sm:p-6">

            <h2 className="text-lg font-bold sm:text-xl">
              Basic Information
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div className="w-full sm:col-span-2">

                <label className="text-sm font-semibold">
                  Product Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    updateForm("name", e.target.value)
                  }
                  placeholder="Oversized Premium T-Shirt"
                  className="mt-2 box-border w-full min-w-0 rounded-xl border px-4 py-3 outline-none focus:border-green-500"
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
                    changeGender(e.target.value)
                  }
                  className="mt-2 box-border w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500"
                >
                  <option>Men</option>
                  <option>Women</option>
                  <option>Kids</option>
                </select>

              </div>

              {/* CATEGORY */}
              <div>

                <label className="text-sm font-semibold">
                  Category
                </label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    updateForm("category", e.target.value)
                  }
                  className="mt-2 box-border w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500"
                >
                  {categoryData[form.gender].map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>

              </div>

              {/* PRICE */}
              <div>

                <label className="text-sm font-semibold">
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) =>
                    updateForm("price", e.target.value)
                  }
                  placeholder="799"
                  className="mt-2 box-border w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
                  required
                />

              </div>

              {/* OLD PRICE */}
              <div>

                <label className="text-sm font-semibold">
                  Old Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.oldPrice}
                  onChange={(e) =>
                    updateForm("oldPrice", e.target.value)
                  }
                  placeholder="1299"
                  className="mt-2 box-border w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
                />

              </div>

              {/* DISCOUNT */}
              <div>

                <label className="text-sm font-semibold">
                  Discount %
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.off}
                  onChange={(e) =>
                    updateForm("off", e.target.value)
                  }
                  placeholder="38"
                  className="mt-2 box-border w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
                />

              </div>

              {/* STOCK */}
              <div>

                <label className="text-sm font-semibold">
                  Stock
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) =>
                    updateForm("stock", e.target.value)
                  }
                  placeholder="50"
                  className="mt-2 box-border w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
                />

              </div>

            </div>

          </section>

          {/* SIZES */}
          <section className="w-full rounded-2xl border bg-white p-4 sm:p-6">

            <h2 className="text-lg font-bold sm:text-xl">
              Sizes
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select available sizes.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">

              {sizes.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => addSize(e)}
                  className={`min-w-[48px] rounded-lg border px-3 py-2 text-sm font-medium sm:px-4 ${
                    form.sizes.includes(e)
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 hover:border-green-500"
                  }`}
                >
                  {e}
                </button>
              ))}

            </div>

            {form.sizes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">

                {form.sizes.map((e) => (
                  <span
                    key={e}
                    className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                  >
                    {e}

                    <button
                      type="button"
                      onClick={() => removeSize(e)}
                    >
                      <X size={14} />
                    </button>

                  </span>
                ))}

              </div>
            )}

          </section>

          {/* COLORS */}
          <section className="w-full rounded-2xl border bg-white p-4 sm:p-6">

            <h2 className="text-lg font-bold sm:text-xl">
              Colors
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add all available colors.
            </p>

            <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row">

              <input
                value={colorInput}
                onChange={(e) =>
                  setColorInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColor();
                  }
                }}
                placeholder="Black"
                className="box-border w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
              />

              <button
                type="button"
                onClick={addColor}
                className="w-full shrink-0 rounded-xl bg-green-500 px-5 py-3 font-semibold text-white hover:bg-green-600 sm:w-auto"
              >
                Add
              </button>

            </div>

            {form.colors.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">

                {form.colors.map((e) => (
                  <span
                    key={e}
                    className="flex max-w-full items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                  >
                    <span className="break-all">
                      {e}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeColor(e)}
                    >
                      <X size={14} />
                    </button>

                  </span>
                ))}

              </div>
            )}

          </section>

          {/* IMAGES */}
          <section className="w-full rounded-2xl border bg-white p-4 sm:p-6">

            <h2 className="text-lg font-bold sm:text-xl">
              Product Images
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload up to 3 product images.
            </p>

            <label className="mt-5 flex min-h-44 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-5 text-center hover:border-green-500 hover:bg-green-50">

              <Upload
                size={36}
                className="text-green-500"
              />

              <p className="mt-3 text-sm font-semibold sm:text-base">
                Click to upload images
              </p>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                PNG, JPG, JPEG or WEBP
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Maximum 3 images
              </p>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleImages}
                disabled={form.images.length >= 3}
                className="hidden"
              />

            </label>

            {form.images.length > 0 && (
              <div className="mt-5 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:grid-cols-3">

                {form.images.map((e, index) => {

                  const imageUrl =
                    e instanceof File
                      ? URL.createObjectURL(e)
                      : e;

                  return (
                    <div
                      key={`${index}-${e.name || e}`}
                      className="relative overflow-hidden rounded-xl border bg-gray-100"
                    >

                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="h-52 w-full object-cover sm:h-48"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow"
                      >
                        <X size={16} />
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2 text-xs text-white">
                        Image {index + 1}
                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </section>

          {/* DESCRIPTION */}
          <section className="w-full rounded-2xl border bg-white p-4 sm:p-6">

            <h2 className="text-lg font-bold sm:text-xl">
              Description
            </h2>

            <textarea
              rows="5"
              value={form.description}
              onChange={(e) =>
                updateForm(
                  "description",
                  e.target.value
                )
              }
              placeholder="Premium cotton oversized t-shirt with a comfortable fit..."
              className="mt-4 box-border w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-green-500"
              required
            />

          </section>

          {/* STATUS */}
          <section className="flex w-full flex-col gap-4 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div>

              <h2 className="font-bold">
                Product Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Make this product visible in the store.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                updateForm(
                  "isActive",
                  !form.isActive
                )
              }
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                form.isActive
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  form.isActive
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>

          </section>

          {/* BUTTONS */}
          <div className="grid w-full grid-cols-1 gap-3 pb-4 sm:flex sm:justify-end">

            <Link
              to="/admin?section=product-management"
              className="flex min-h-12 w-full items-center justify-center rounded-xl border px-6 py-3 text-center font-semibold hover:bg-white sm:w-auto"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <Upload size={18} />

              {loading
                ? isEdit
                  ? "Updating..."
                  : "Adding..."
                : isEdit
                  ? "Update Product"
                  : "Add Product"}
            </button>

          </div>

        </form>

      </div>
    </main>
  );
};

export default AdminProduct;