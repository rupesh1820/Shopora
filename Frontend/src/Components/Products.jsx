import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_SERVER ||
  import.meta.env.VITE_API_URL ||
  "https://shopara-official.onrender.com";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [params, setParams] = useSearchParams();

  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const sale = params.get("sale") === "true";
  const newParam = params.get("new") === "true";

  // category=new OR new=true => New Arrivals
  const newArrivals =
    category.toLowerCase() === "new" || newParam;

  // ================= SEARCH =================

  const handleSearch = (e) => {
    const value = e.target.value;

    const next = new URLSearchParams(params);

    if (value) {
      next.set("search", value);
    } else {
      next.delete("search");
    }

    setParams(next);
  };

  // ================= GET PRODUCTS =================

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_URL}/api/products`
        );

        console.log("PRODUCT API RESPONSE:", res.data);

        const data =
          res.data?.products ||
          res.data?.Products ||
          res.data?.data ||
          res.data;

        let result = Array.isArray(data) ? data : [];

        console.log("ALL PRODUCTS:", result);

        // ================= SEARCH =================

        if (search) {
          result = result.filter((e) =>
            (
              e.title ||
              e.name ||
              ""
            )
              .toLowerCase()
              .includes(search.toLowerCase())
          );
        }

        // ================= NEW ARRIVALS =================
        // IMPORTANT:
        // category=new ko normal category nahi maana jayega

        if (newArrivals) {
          result = [...result]
            .slice()
            .reverse()
            .slice(0, 8);
        }

        // ================= NORMAL CATEGORY =================

        else if (category) {
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

        // ================= SALE =================

        if (sale) {
          result = result.filter(
            (e) =>
              Number(e.oldPrice) >
              Number(e.price)
          );
        }

        console.log(
          "FINAL PRODUCTS:",
          result
        );

        setProducts(result);
      } catch (error) {
        console.error(
          "Products error:",
          error.response?.data || error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [
    search,
    category,
    sale,
    newParam,
  ]);

  // ================= REMOVE FILTER =================

  const removeCategory = () => {
    const next = new URLSearchParams(params);

    next.delete("category");

    setParams(next);
  };

  const removeNew = () => {
    const next = new URLSearchParams(params);

    next.delete("new");
    next.delete("category");

    setParams(next);
  };

  // ================= UI =================

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold">
          {newArrivals
            ? "New Arrivals"
            : sale
            ? "Sale Products"
            : category
            ? category.charAt(0).toUpperCase() +
              category.slice(1)
            : "Browse Products"}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {products.length} products found
        </p>
      </div>

      {/* SEARCH */}

      <input
        value={search}
        onChange={handleSearch}
        placeholder="Search clothes..."
        className="mt-6 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
      />

      {/* ACTIVE FILTERS */}

      {(search ||
        (category && !newArrivals) ||
        sale ||
        newArrivals) && (

        <div className="mt-5 flex flex-wrap gap-2">

          {/* SEARCH */}

          {search && (
            <button
              onClick={() => {
                const next =
                  new URLSearchParams(params);

                next.delete("search");

                setParams(next);
              }}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm"
            >
              Search: {search} ×
            </button>
          )}

          {/* NORMAL CATEGORY */}

          {category && !newArrivals && (
            <button
              onClick={removeCategory}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm"
            >
              Category: {category} ×
            </button>
          )}

          {/* NEW ARRIVALS */}

          {newArrivals && (
            <button
              onClick={removeNew}
              className="rounded-full bg-green-100 px-4 py-2 text-sm text-green-600"
            >
              New Arrivals ×
            </button>
          )}

          {/* SALE */}

          {sale && (
            <button
              onClick={() => {
                const next =
                  new URLSearchParams(params);

                next.delete("sale");

                setParams(next);
              }}
              className="rounded-full bg-red-100 px-4 py-2 text-sm text-red-600"
            >
              Sale ×
            </button>
          )}

        </div>
      )}

      {/* PRODUCTS */}

      {loading ? (

        <p className="mt-10 text-center">
          Loading...
        </p>

      ) : products.length === 0 ? (

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

          {products.map((e) => {

            const title =
              e.title ||
              e.name ||
              "Product";

            const image =
              e.images?.[0] ||
              e.image ||
              e.imageUrl ||
              "";

            const price =
              Number(e.price) || 0;

            const oldPrice =
              Number(e.oldPrice) || 0;

            const discount =
              e.off ||
              (oldPrice > price
                ? Math.round(
                    ((oldPrice - price) /
                      oldPrice) *
                      100
                  )
                : 0);

            return (

              <Link
                key={e._id}
                to={`/product?id=${e._id}`}
                className="group overflow-hidden rounded-2xl border bg-white"
              >

                {/* IMAGE */}

                <div className="relative overflow-hidden">

                  {image ? (

                    <img
                      src={image}
                      alt={title}
                      className="h-72 w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                  ) : (

                    <div className="flex h-72 w-full items-center justify-center bg-gray-100 text-gray-400">
                      No Image
                    </div>

                  )}

                  {/* SALE */}

                  {oldPrice > price && (
                    <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                      {discount}% OFF
                    </span>
                  )}

                  {/* NEW */}

                  {newArrivals && (
                    <span className="absolute right-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                      NEW
                    </span>
                  )}

                </div>

                {/* INFO */}

                <div className="p-4">

                  <h2 className="font-semibold">
                    {title}
                  </h2>

                  <div className="mt-1 flex gap-2">

                    <span className="font-bold">
                      ₹{price}
                    </span>

                    {oldPrice > price && (
                      <span className="text-gray-400 line-through">
                        ₹{oldPrice}
                      </span>
                    )}

                  </div>

                  <p className="text-sm text-gray-500">
                    ⭐ {e.rating || 0} (
                    {e.reviews || 0})
                  </p>

                </div>

              </Link>

            );
          })}

        </div>

      )}

    </div>
  );
};

export default Products;