import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const api =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_SERVER ||
  "https://shopara-official.onrender.com";

const shuffleProducts = (products) => {
  const shuffled = [...products];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

const Kids = () => {
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

  const kidsProducts = products.filter(
    (e) => e.gender === "Kids"
  );

  const randomProducts = shuffleProducts(kidsProducts);

  const categories = [
    "T-Shirts",
    "Jeans",
    "Dresses",
    "Hoodies",
    "Shirts",
    "Jackets",
  ].map((name) => ({
    name,
    image: kidsProducts.find(
      (e) => e.category === name
    )?.images?.[0],
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      <section className="rounded-3xl bg-slate-900 px-6 py-14 text-white sm:px-10">
        <p className="text-sm uppercase tracking-widest text-green-400">
          Shopara Kids
        </p>

        <h1 className="mt-3 max-w-2xl text-4xl font-bold sm:text-5xl">
          Kids' Fashion
        </h1>

        <p className="mt-4 max-w-xl text-gray-300">
          Fun, comfortable and stylish clothing for little ones.
        </p>

        <Link
          to="/products?gender=Kids"
          className="mt-7 inline-block rounded-xl bg-green-500 px-6 py-3 font-semibold hover:bg-green-600"
        >
          Shop Kids
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">
          Shop Kids' Clothing
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((e) => (
            <Link
              key={e.name}
              to={`/products?gender=Kids&category=${e.name}`}
              className="group overflow-hidden rounded-2xl bg-gray-100"
            >
              {e.image && (
                <img
                  src={e.image}
                  alt={e.name}
                  className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                />
              )}

              <div className="p-3 text-center">
                <h3 className="font-semibold">{e.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Trending For Kids
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Latest styles for kids
            </p>
          </div>

          <Link
            to="/products?gender=Kids"
            className="text-sm font-semibold text-green-600"
          >
            View All
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {randomProducts.slice(0, 8).map((e) => (
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
                <h3 className="font-semibold">{e.name}</h3>

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
      </section>

    </main>
  );
};

export default Kids;