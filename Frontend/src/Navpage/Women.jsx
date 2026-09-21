import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_SERVER;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [params, setParams] = useSearchParams();

  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const sale = params.get("sale") === "true";

  const getProducts = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/products`
      );

      const data =
        res.data.Products ||
        res.data.products ||
        res.data.data ||
        res.data;

      let result = Array.isArray(data) ? data : [];

      /* SEARCH */
      if (search) {
        result = result.filter((e) =>
          e.title
            ?.toLowerCase()
            .includes(search.toLowerCase())
        );
      }

      /* CATEGORY / GENDER */
      if (category) {
        const genderCategory = [
          "men",
          "women",
          "kids",
        ];

        if (
          genderCategory.includes(
            category.toLowerCase()
          )
        ) {
          result = result.filter(
            (e) =>
              e.gender?.toLowerCase() ===
              category.toLowerCase()
          );
        } else {
          result = result.filter(
            (e) =>
              e.category?.toLowerCase() ===
              category.toLowerCase()
          );
        }
      }

      /* SALE */
      if (sale) {
        result = result.filter(
          (e) =>
            Number(e.oldPrice) > Number(e.price)
        );
      }

      setProducts(result);
    } catch (error) {
      console.log("Products error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, [search, category, sale]);

  const handleSearch = (e) => {
    const value = e.target.value;

    if (value) {
      setParams({ search: value });
    } else {
      setParams({});
    }
  };

  const heading = category
    ? category.charAt(0).toUpperCase() +
      category.slice(1)
    : search
    ? `Search Results`
    : sale
    ? "Sale"
    : "All Products";

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">
          Loading products...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            {heading}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {products.length} product
            {products.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* SEARCH */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search products..."
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
          />
        </div>

      </div>

      {/* ACTIVE FILTER */}
      {(category || search || sale) && (
        <div className="mt-6 flex flex-wrap items-center gap-3">

          {category && (
            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
              Category: {category}
            </span>
          )}

          {search && (
            <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
              Search: {search}
            </span>
          )}

          {sale && (
            <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-600">
              Sale
            </span>
          )}

          <button
            onClick={() => setParams({})}
            className="text-sm font-semibold text-red-500 hover:text-red-600"
          >
            Clear Filters
          </button>

        </div>
      )}

      {/* PRODUCTS */}
      {products.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

          {products.map((e) => (
            <Link
              key={e._id}
              to={`/product?id=${e._id}`}
              className="group overflow-hidden rounded-2xl border bg-white"
            >

              {/* IMAGE */}
              <div className="overflow-hidden">

                <img
                  src={e.images?.[0]}
                  alt={e.title}
                  className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
                />

              </div>

              {/* DETAILS */}
              <div className="p-4">

                <h2 className="line-clamp-1 font-semibold">
                  {e.title}
                </h2>

                <div className="mt-2 flex items-center gap-2">

                  <span className="font-bold">
                    ₹{e.price}
                  </span>

                  {e.oldPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{e.oldPrice}
                    </span>
                  )}

                  {e.off > 0 && (
                    <span className="text-xs font-semibold text-green-600">
                      {e.off}% OFF
                    </span>
                  )}

                </div>

                {e.rating && (
                  <p className="mt-1 text-sm text-yellow-500">
                    ★ {e.rating}
                  </p>
                )}

                {e.stock <= 0 && (
                  <p className="mt-2 text-sm font-semibold text-red-500">
                    Out of Stock
                  </p>
                )}

              </div>

            </Link>
          ))}

        </div>
      ) : (
        /* EMPTY STATE */
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">

          <h2 className="text-2xl font-bold">
            No Products Found
          </h2>

          <p className="mt-2 max-w-md text-gray-500">
            We couldn't find any products matching
            your current search or category.
          </p>

          <button
            onClick={() => setParams({})}
            className="mt-5 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600"
          >
            View All Products
          </button>

        </div>
      )}

    </main>
  );
};

export default Products;