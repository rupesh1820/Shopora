import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_SERVER ||
  import.meta.env.VITE_API_URL ||
  "https://shopara-official.onrender.com";

const Wishlist = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const savedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userId =
    savedUser?._id ||
    savedUser?.id ||
    savedUser?.userId;

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ================= GET WISHLIST =================

  const getWishlist = async () => {
    try {
      setLoading(true);

      if (!userId) {
        navigate("/login");
        return;
      }

      const res = await axios.get(
        `${API_URL}/api/wishlist/${userId}`,
        config
      );

      console.log(
        "WISHLIST RESPONSE:",
        res.data
      );

      const data =
        res.data?.wishlist ||
        res.data?.data ||
        res.data;

      const products =
        data?.products ||
        data ||
        [];

      setWishlist(
        Array.isArray(products)
          ? products
          : []
      );

    } catch (error) {
      console.log(
        "Wishlist error:",
        error.response?.data || error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD =================

  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    getWishlist();
  }, [userId]);

  // ================= REMOVE =================

  const removeItem = async (productId) => {
    try {
      await axios.delete(
        `${API_URL}/api/wishlist/${userId}/remove/${productId}`,
        config
      );

      setWishlist((items) =>
        items.filter((item) => {
          const id =
            item.productId?._id ||
            item.productId ||
            item._id;

          return id?.toString() !==
            productId?.toString();
        })
      );

    } catch (error) {
      console.log(
        "Remove wishlist error:",
        error.response?.data || error
      );
    }
  };

  // ================= CLEAR =================

  const clearWishlist = async () => {
    try {
      await axios.delete(
        `${API_URL}/api/wishlist/${userId}/clear`,
        config
      );

      setWishlist([]);
    } catch (error) {
      console.log(
        "Clear wishlist error:",
        error.response?.data || error
      );
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">

          <Heart
            size={50}
            className="mx-auto animate-pulse text-gray-300"
          />

          <p className="mt-4 text-gray-500">
            Loading wishlist...
          </p>

        </div>
      </main>
    );
  }

  // ================= PAGE =================

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* HEADER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            My Wishlist
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Save your favorite products for later
          </p>

        </div>

        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={16} />
            Clear Wishlist
          </button>
        )}

      </div>

      {/* PRODUCTS */}

      {wishlist.length > 0 ? (

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

          {wishlist.map((item, index) => {

            /*
              Backend populated ho:
              item.productId = Product object

              Backend populate na ho:
              item.productId = ObjectId

              Dono cases handle kar rahe hain.
            */

            const product =
              item.productId &&
              typeof item.productId === "object"
                ? item.productId
                : item;

            const productId =
              product?._id ||
              item?.productId;

            if (!productId) {
              return null;
            }

            return (
              <div
                key={`${productId}-${index}`}
                className="overflow-hidden rounded-2xl border bg-white"
              >

                {/* IMAGE */}

                <Link
                  to={`/product?id=${productId}`}
                >
                  {product?.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={
                        product?.title ||
                        "Product"
                      }
                      className="h-56 w-full object-cover transition hover:scale-105 sm:h-72"
                    />
                  ) : (
                    <div className="flex h-56 w-full items-center justify-center bg-gray-100 text-sm text-gray-400 sm:h-72">
                      No Image
                    </div>
                  )}
                </Link>

                {/* DETAILS */}

                <div className="p-4">

                  <h2 className="line-clamp-1 font-semibold">
                    {product?.title ||
                      "Product"}
                  </h2>

                  <div className="mt-2 flex items-center gap-2">

                    <span className="font-bold">
                      ₹{product?.price || 0}
                    </span>

                    {product?.oldPrice > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{product.oldPrice}
                      </span>
                    )}

                  </div>

                  <div className="mt-4 flex gap-2">

                    {/* VIEW */}

                    <Link
                      to={`/product?id=${productId}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-green-600"
                    >
                      <ShoppingBag size={16} />
                      View
                    </Link>

                    {/* REMOVE */}

                    <button
                      onClick={() =>
                        removeItem(productId)
                      }
                      className="rounded-xl border px-3 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      ) : (

        /* EMPTY STATE */

        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">

          <Heart
            size={60}
            className="text-gray-300"
          />

          <h2 className="mt-5 text-xl font-bold">
            Your Wishlist is Empty
          </h2>

          <p className="mt-2 text-gray-500">
            Save products you love and find them here later.
          </p>

          <Link
            to="/products"
            className="mt-5 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600"
          >
            Start Shopping
          </Link>

        </div>
      )}

    </main>
  );
};

export default Wishlist;