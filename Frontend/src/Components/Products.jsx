import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_SERVER;

const Products = () => {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);

  const [params, setParams] = useSearchParams();

  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const sale = params.get("sale") === "true";
  const newArrivals = params.get("new") === "true";

  const handleSearch = (e) => {
    const value = e.target.value;

    if (value) {
      setParams({ search: value });
    } else {
      setParams({});
    }
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API_URL}/api/products`);

        const data =
          res.data.Products ||
          res.data.products ||
          res.data.data ||
          res.data;

        let result = Array.isArray(data) ? data : [];

        // Search
        if (search) {
          result = result.filter((e) =>
            e.title?.toLowerCase().includes(search.toLowerCase())
          );
        }

        // Category / Gender
        if (category) {
          const genderCategory = ["men", "women", "kids"];

          if (genderCategory.includes(category.toLowerCase())) {
            result = result.filter(
              (e) =>
                e.gender?.toLowerCase() === category.toLowerCase()
            );
          } else {
            result = result.filter(
              (e) =>
                e.category?.toLowerCase() ===
                category.toLowerCase()
            );
          }
        }

        // Sale
        if (sale) {
          result = result.filter(
            (e) => Number(e.oldPrice) > Number(e.price)
          );
        }

        // New Arrivals
        if (newArrivals) {
          result = result.slice(-8).reverse();
        }

        setProduct(result);
      } catch (error) {
        console.log("Products error:", error);
        setProduct([]);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [search, category, sale, newArrivals]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {newArrivals
              ? "New Arrivals"
              : sale
              ? "Sale Products"
              : category
              ? category.charAt(0).toUpperCase() + category.slice(1)
              : "Browse Products"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {product.length} products found
          </p>
        </div>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={handleSearch}
        placeholder="Search clothes..."
        className="mt-6 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
      />

      {/* Active Filters */}
      {(search || category || sale || newArrivals) && (
        <div className="mt-5 flex flex-wrap gap-2">

          {search && (
            <button
              onClick={() => setParams({})}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm"
            >
              Search: {search} ×
            </button>
          )}

          {category && (
            <button
              onClick={() => {
                const next = new URLSearchParams(params);
                next.delete("category");
                setParams(next);
              }}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm"
            >
              Category: {category} ×
            </button>
          )}

          {sale && (
            <button
              onClick={() => {
                const next = new URLSearchParams(params);
                next.delete("sale");
                setParams(next);
              }}
              className="rounded-full bg-red-100 px-4 py-2 text-sm text-red-600"
            >
              Sale ×
            </button>
          )}

          {newArrivals && (
            <button
              onClick={() => {
                const next = new URLSearchParams(params);
                next.delete("new");
                setParams(next);
              }}
              className="rounded-full bg-green-100 px-4 py-2 text-sm text-green-600"
            >
              New Arrivals ×
            </button>
          )}

        </div>
      )}

      {/* Products */}
      {loading ? (
        <p className="mt-10 text-center">
          Loading...
        </p>
      ) : product.length === 0 ? (
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold">
            No products found
          </h2>

          <p className="mt-2 text-gray-500">
            Try another search or category.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">

          {product.map((e) => (
            <Link
              key={e._id}
              to={`/product?id=${e._id}`}
              className="group overflow-hidden rounded-2xl border bg-white"
            >

              <div className="relative overflow-hidden">

                <img
                  src={e.images?.[0]}
                  alt={e.title}
                  className="h-72 w-full object-cover transition duration-300 group-hover:scale-105"
                />

                {Number(e.oldPrice) > Number(e.price) && (
                  <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                    {e.off ||
                      Math.round(
                        ((e.oldPrice - e.price) /
                          e.oldPrice) *
                          100
                      )}
                    % OFF
                  </span>
                )}

                {newArrivals && (
                  <span className="absolute right-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                    NEW
                  </span>
                )}

              </div>

              <div className="p-4">

                <h2 className="font-semibold">
                  {e.title}
                </h2>

                <div className="mt-1 flex gap-2">

                  <span className="font-bold">
                    ₹{e.price}
                  </span>

                  {Number(e.oldPrice) > Number(e.price) && (
                    <span className="text-gray-400 line-through">
                      ₹{e.oldPrice}
                    </span>
                  )}

                </div>

                <p className="text-sm text-gray-500">
                  ⭐ {e.rating || 0} ({e.reviews || 0})
                </p>

              </div>

            </Link>
          ))}

        </div>
      )}

    </div>
  );
};

export default Products;