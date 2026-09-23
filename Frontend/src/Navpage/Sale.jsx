
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const api =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_SERVER ||
  "https://shopara-official.onrender.com";

const Sale = () => {
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

  const saleProducts = products.filter(
    (e) => Number(e.price) < Number(e.oldPrice)
  );

  const categories = [
    {
      name: "Men",
      link: "/products?sale=true&gender=Men",
    },
    {
      name: "Women",
      link: "/products?sale=true&gender=Women",
    },
    {
      name: "Kids",
      link: "/products?sale=true&gender=Kids",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Hero */}
      <section className="rounded-3xl bg-slate-900 px-6 py-14 text-white sm:px-10">

        <p className="text-sm uppercase tracking-widest text-red-400">
          Shopora Sale
        </p>

        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
          Big Sale
        </h1>

        <p className="mt-4 max-w-xl text-gray-300">
          Grab your favorite fashion styles at special prices.
          Limited time offers available now.
        </p>

        <Link
          to="/products?sale=true"
          className="mt-7 inline-block rounded-xl bg-green-500 px-6 py-3 font-semibold hover:bg-green-600"
        >
          Shop Sale
        </Link>

      </section>

      {/* Categories */}
      <section className="mt-12">

        <h2 className="text-2xl font-bold">
          Shop Sale By Category
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {categories.map((e) => (
            <Link
              key={e.name}
              to={e.link}
              className="rounded-2xl border bg-gray-50 p-6 text-center transition hover:border-red-500 hover:bg-red-50"
            >

              <h3 className="text-xl font-bold">
                {e.name}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Explore {e.name.toLowerCase()} sale
              </p>

            </Link>
          ))}

        </div>

      </section>

      {/* Sale Products */}
      <section className="mt-14">

        <h2 className="text-2xl font-bold">
          Sale Products
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Fashion deals you don't want to miss
        </p>

        {saleProducts.length > 0 ? (

          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

            {saleProducts.map((e) => (

              <Link
                key={e._id}
                to={`/product?id=${e._id}`}
                className="group overflow-hidden rounded-2xl border bg-white"
              >

                <div className="relative overflow-hidden">

                  <img
                    src={e.images?.[0]}
                    alt={e.name}
                    className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                    {e.off ||
                      Math.round(
                        ((e.oldPrice - e.price) / e.oldPrice) * 100
                      )}%
                    OFF
                  </span>

                </div>

                <div className="p-4">

                  <h3 className="font-semibold">
                    {e.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">

                    <span className="font-bold">
                      ₹{e.price}
                    </span>

                    <span className="text-sm text-gray-400 line-through">
                      ₹{e.oldPrice}
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-yellow-500">
                    ★ {e.rating}
                  </p>

                </div>

              </Link>

            ))}

          </div>

        ) : (

          <div className="py-20 text-center">

            <h2 className="text-xl font-bold">
              No Sale Products
            </h2>

            <p className="mt-2 text-gray-500">
              New offers will be available soon.
            </p>

          </div>

        )}

      </section>

    </main>
  );
};

export default Sale;

