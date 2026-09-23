import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const api =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_SERVER ||
  "https://shopara-official.onrender.com";

const NewArrivals = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const res = await fetch(`${api}/api/products`);
        const data = await res.json();

        setProducts(data.products || data);
      } catch (error) {
        console.log("Products fetch error:", error);
      }
    };

    getProducts();
  }, []);

  const newProducts = [...products]
    .slice(-8)
    .reverse();

  const categories = [
    {
      name: "Men",
      link: "/products?gender=Men",
    },
    {
      name: "Women",
      link: "/products?gender=Women",
    },
    {
      name: "Kids",
      link: "/products?gender=Kids",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Hero */}
      <section className="rounded-3xl bg-slate-900 px-6 py-14 text-white sm:px-10">

        <p className="text-sm uppercase tracking-widest text-green-400">
          Shopora
        </p>

        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
          New Arrivals
        </h1>

        <p className="mt-4 max-w-xl text-gray-300">
          Discover the latest styles and fresh looks added to Shopora.
        </p>

        <Link
          to="/products?new=true"
          className="mt-7 inline-block rounded-xl bg-green-500 px-6 py-3 font-semibold hover:bg-green-600"
        >
          Shop New Arrivals
        </Link>

      </section>

      {/* Categories */}
      <section className="mt-12">

        <h2 className="text-2xl font-bold">
          Explore New Styles
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {categories.map((e) => (
            <Link
              key={e.name}
              to={e.link}
              className="rounded-2xl border bg-gray-50 p-6 text-center transition hover:border-green-500 hover:bg-green-50"
            >
              <h3 className="text-xl font-bold">
                {e.name}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Explore latest {e.name.toLowerCase()} styles
              </p>
            </Link>
          ))}

        </div>

      </section>

      {/* Products */}
      <section className="mt-14">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-2xl font-bold">
              Just Arrived
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Fresh styles you might love
            </p>
          </div>

          <Link
            to="/products?new=true"
            className="text-sm font-semibold text-green-600"
          >
            View All
          </Link>

        </div>

        {newProducts.length > 0 ? (
          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

            {newProducts.map((e) => (
              <Link
                key={e._id}
                to={`/product?id=${e._id}`}
                className="group overflow-hidden rounded-2xl border bg-white"
              >

                <div className="overflow-hidden">

                  <img
                    src={e.images?.[0]}
                    alt={e.name}
                    className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                </div>

                <div className="p-4">

                  <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-600">
                    NEW
                  </span>

                  <h3 className="mt-3 line-clamp-1 font-semibold">
                    {e.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">

                    <span className="font-bold">
                      ₹{e.price}
                    </span>

                    {e.oldPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{e.oldPrice}
                      </span>
                    )}

                  </div>

                  <p className="mt-1 text-sm text-yellow-500">
                    ★ {e.rating}
                  </p>

                </div>

              </Link>
            ))}

          </div>
        ) : (
          <div className="mt-8 rounded-2xl border py-16 text-center">
            <h2 className="text-xl font-bold">
              No New Arrivals
            </h2>

            <p className="mt-2 text-gray-500">
              New products will appear here.
            </p>
          </div>
        )}

      </section>

    </main>
  );
};

export default NewArrivals;