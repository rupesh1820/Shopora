import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_SERVER ||
  "https://shopara-official.onrender.com";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") || "";

  // ================= GET PRODUCTS =================
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();

        console.log("PRODUCT API RESPONSE:", data);

        const list =
          data?.products ||
          data?.Products ||
          data?.data ||
          data;

        setProducts(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Products fetch error:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  // ================= FILTER =================
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (search.trim()) {
      const value = search.toLowerCase();

      result = result.filter((product) =>
        (
          product?.title ||
          product?.name ||
          ""
        )
          .toLowerCase()
          .includes(value)
      );
    }

    // NEW ARRIVALS
    // "new" ko actual category mat samjho
    if (category.toLowerCase() === "new") {
      result = [...result].reverse().slice(0, 8);
    }

    // NORMAL CATEGORY
    else if (category) {
      const selectedCategory = category.toLowerCase();

      result = result.filter((product) => {
        const productCategory = (
          product?.category ||
          product?.gender ||
          ""
        ).toLowerCase();

        return productCategory === selectedCategory;
      });
    }

    return result;
  }, [products, search, category]);

  // ================= REMOVE CATEGORY =================
  const removeCategory = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("category");

    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ================= HEADER ================= */}
      <div className="px-4 md:px-8 pt-10">

        <h1 className="text-4xl font-semibold">
          {category.toLowerCase() === "new"
            ? "New"
            : category
            ? category.charAt(0).toUpperCase() + category.slice(1)
            : "All Products"}
        </h1>

        <p className="text-gray-500 mt-2">
          {filteredProducts.length} products found
        </p>

        {/* ================= SEARCH ================= */}
        <div className="mt-8">
          <input
            type="text"
            placeholder="Search clothes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-black rounded-2xl px-5 py-4 outline-none text-lg"
          />
        </div>

        {/* ================= CATEGORY CHIP ================= */}
        {category && (
          <div className="mt-6 inline-flex items-center gap-2 bg-gray-100 px-5 py-3 rounded-full">
            <span>
              Category: {category}
            </span>

            <button
              onClick={removeCategory}
              className="text-gray-600 hover:text-black"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* ================= PRODUCTS ================= */}
      <div className="px-4 md:px-8 py-10">

        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-medium">
              No products found
            </h2>

            <p className="text-gray-500 mt-2">
              Try another search or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">

            {filteredProducts.map((product) => {
              const productId = product?._id;

              const title =
                product?.title ||
                product?.name ||
                "Product";

              const image =
                product?.images?.[0] ||
                product?.image ||
                product?.imageUrl ||
                "";

              const price = Number(product?.price) || 0;

              const oldPrice =
                Number(product?.oldPrice) || 0;

              return (
                <Link
                  key={productId}
                  to={`/product?id=${productId}`}
                  className="group"
                >

                  {/* IMAGE */}
                  <div className="w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden">

                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}

                  </div>

                  {/* INFO */}
                  <div className="mt-3">

                    <h3 className="font-medium truncate">
                      {title}
                    </h3>

                    <div className="flex items-center gap-2 mt-1">

                      <span className="font-semibold">
                        ₹{price}
                      </span>

                      {oldPrice > price && (
                        <span className="text-gray-400 line-through text-sm">
                          ₹{oldPrice}
                        </span>
                      )}

                    </div>

                  </div>

                </Link>
              );
            })}

          </div>
        )}
      </div>

    </div>
  );
};

export default Products;