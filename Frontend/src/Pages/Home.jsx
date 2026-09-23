import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";

const API_URL = (() => {
  const env = import.meta.env.VITE_SERVER || import.meta.env.VITE_API_URL;
  if (
    !env ||
    env === "undefined" ||
    env.includes("localhost") ||
    env.includes("127.0.0.1") ||
    env.includes("10.")
  ) {
    return "https://shopara-official.onrender.com";
  }
  return env.replace(/\/+$/, "");
})();

const categories = [
  {
    name: "Men",
    icon: "👔",
    link: "/products?category=men",
  },
  {
    name: "Women",
    icon: "👗",
    link: "/products?category=women",
  },
  {
    name: "Kids",
    icon: "🧒",
    link: "/products?category=kids",
  },
  {
    name: "T-Shirts",
    icon: "👕",
    link: "/products?category=T-Shirts",
  },
  {
    name: "Jeans",
    icon: "👖",
    link: "/products?category=Jeans",
  },
  {
    name: "Hoodies",
    icon: "🧥",
    link: "/products?category=Hoodies",
  },
];

const shuffleProducts = (e) => {
  const shuffled = [...e];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
};

const Home = () => {
  const [randomProducts, setRandomProducts] =
    useState([]);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const productsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_URL}/api/products`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch products"
          );
        }

        const products = data.products || [];

        setRandomProducts(
          shuffleProducts(products)
        );
      } catch (error) {
        console.error(
          "Home products error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const totalPages = Math.ceil(
    randomProducts.length / productsPerPage
  );

  const start = (page - 1) * productsPerPage;

  const currentProducts =
    randomProducts.slice(
      start,
      start + productsPerPage
    );

  return (
    <main>

      {/* HERO */}
      <section className="bg-slate-50">

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">

          <div>

            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              New Season Collection
            </span>

            <h1 className="mt-5 max-w-xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Style that speaks
              <span className="text-green-500">
                {" "}for you.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-gray-600 sm:text-lg">
              Discover the latest fashion, everyday
              essentials and trending styles for everyone.
            </p>

            <Link
              to="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-500 px-7 py-3.5 font-semibold text-white hover:bg-green-600"
            >
              Shop Now
              <ArrowRight size={18} />
            </Link>

          </div>

          <div className="relative overflow-hidden rounded-3xl">

            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200"
              alt="Shopora Fashion"
              className="h-[420px] w-full object-cover sm:h-[500px]"
            />

            <div className="absolute bottom-5 left-5 rounded-2xl bg-white p-4 shadow-xl">

              <p className="text-xs text-gray-500">
                Summer Sale
              </p>

              <p className="text-xl font-bold">
                Up to 50% OFF
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* FEATURES */}
      <section className="border-b bg-white">

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 lg:px-8">

          <Feature
            icon={<Truck />}
            title="Fast Delivery"
            text="Quick delivery"
          />

          <Feature
            icon={<ShieldCheck />}
            title="Secure Payment"
            text="Safe checkout"
          />

          <Feature
            icon={<RotateCcw />}
            title="Easy Returns"
            text="Simple returns"
          />

        </div>

      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        <p className="text-sm font-semibold uppercase text-green-500">
          Explore
        </p>

        <h2 className="mt-1 text-3xl font-bold text-slate-900">
          Shop by Category
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

          {categories.map((e) => (
            <Link
              key={e.name}
              to={e.link}
              className="rounded-2xl border bg-gray-50 p-6 text-center hover:border-green-300 hover:bg-green-50"
            >

              <div className="text-4xl">
                {e.icon}
              </div>

              <h3 className="mt-3 font-semibold">
                {e.name}
              </h3>

            </Link>
          ))}

        </div>

      </section>

      {/* PRODUCTS */}
      <section className="bg-slate-50">

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <p className="text-sm font-semibold uppercase text-green-500">
            Trending
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            Latest Styles
          </h2>

          {loading ? (
            <div className="mt-10 text-center text-gray-500">
              Loading products...
            </div>
          ) : currentProducts.length > 0 ? (
            <>
              {/* PRODUCT GRID */}

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                {currentProducts.map((e) => (
                  <div
                    key={e._id}
                    className="overflow-hidden rounded-2xl bg-white"
                  >

                    {/* IMAGE */}

                    <Link to={`/product?id=${e._id}`}>

                      <img
                        src={e.images?.[0]}
                        alt={e.title}
                        className="h-72 w-full object-cover transition hover:scale-105"
                      />

                    </Link>

                    {/* DETAILS */}

                    <div className="p-5">

                      <h3 className="font-semibold">
                        {e.title}
                      </h3>

                      <div className="mt-2 flex gap-2">

                        <b>
                          ₹{e.price}
                        </b>

                        {e.oldPrice && (
                          <span className="text-gray-400 line-through">
                            ₹{e.oldPrice}
                          </span>
                        )}

                      </div>

                      <p className="mt-1 text-sm text-yellow-500">
                        ★ {e.rating || 0}
                      </p>

                      <Link
                        to={`/product?id=${e._id}`}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-green-500"
                      >
                        <ShoppingBag size={17} />
                        View Product
                      </Link>

                    </div>

                  </div>
                ))}

              </div>

              {/* PAGINATION */}

              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">

                  <button
                    disabled={page === 1}
                    onClick={() =>
                      setPage((e) =>
                        Math.max(1, e - 1)
                      )
                    }
                    className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, e) => e + 1
                  ).map((e) => (
                    <button
                      key={e}
                      onClick={() => setPage(e)}
                      className={`h-10 w-10 rounded-lg border ${
                        page === e
                          ? "bg-green-500 text-white"
                          : "bg-white"
                      }`}
                    >
                      {e}
                    </button>
                  ))}

                  <button
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((e) =>
                        Math.min(
                          totalPages,
                          e + 1
                        )
                      )
                    }
                    className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40"
                  >
                    Next
                  </button>

                </div>
              )}

            </>
          ) : (
            <p className="mt-10 text-center text-gray-500">
              No products available
            </p>
          )}

        </div>

      </section>

      {/* SALE */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="rounded-3xl bg-green-500 px-6 py-12 text-center">

          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Upgrade Your Wardrobe
          </h2>

          <p className="mt-3 text-green-50">
            Discover fresh styles at prices you'll love.
          </p>

          <Link
            to="/products?sale=true"
            className="mt-7 inline-flex rounded-full bg-white px-7 py-3.5 font-semibold text-green-600"
          >
            Shop Sale
          </Link>

        </div>

      </section>

    </main>
  );
};

const Feature = ({ icon, title, text }) => (
  <div className="flex items-center gap-3">

    <div className="text-green-500">
      {icon}
    </div>

    <div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="text-sm text-gray-500">
        {text}
      </p>

    </div>

  </div>
);

export default Home;