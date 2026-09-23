import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Star,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_SERVER ||
  import.meta.env.VITE_API_URL ||
  "https://shopara-official.onrender.com";

const ProductDetails = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const id = params.get("id");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [image, setImage] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReview, setEditingReview] = useState(null);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = user._id || user.id;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // GET PRODUCT
  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API_URL}/api/products/${id}`);

        const e = res.data.product || res.data.data || res.data;

        setProduct(e);
        setSize(e.sizes?.[0] || "");
        setColor(e.colors?.[0] || "");

        const all = await axios.get(`${API_URL}/api/products`);

        const data =
          all.data.products ||
          all.data.Products ||
          all.data.data ||
          all.data;

        setRecommended(
          Array.isArray(data)
            ? data
                .filter(
                  (p) =>
                    p.category === e.category &&
                    p._id !== e._id
                )
                .slice(0, 4)
            : []
        );
      } catch (err) {
        console.log("Product error:", err);
        setError(
          err.response?.data?.message || "Unable to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) getProduct();
  }, [id]);

  // GET REVIEWS
  const getReviews = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/reviews/${id}`
      );

      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.log("Reviews error:", err);
    }
  };

  useEffect(() => {
    if (id) getReviews();
  }, [id]);
// ho gya yar
  // ADD / UPDATE REVIEW
  const submitReview = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a review");
      return;
    }

    try {
      setReviewLoading(true);
      setError("");

      if (editingReview) {
        await axios.put(
          `${API_URL}/api/reviews/update/${editingReview._id}`,
          {
            rating,
            comment: comment.trim(),
          },
          config
        );
      } else {
        await axios.post(
          `${API_URL}/api/reviews/${id}`,
          {
            rating,
            comment: comment.trim(),
          },
          config
        );
      }

      setComment("");
      setRating(5);
      setEditingReview(null);

      await getReviews();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit review"
      );
    } finally {
      setReviewLoading(false);
    }
  };

  // DELETE REVIEW
  const deleteReview = async (reviewId) => {
    try {
      setReviewLoading(true);
      setError("");

      await axios.delete(
        `${API_URL}/api/reviews/delete/${reviewId}`,
        config
      );

      await getReviews();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete review"
      );
    } finally {
      setReviewLoading(false);
    }
  };

  // EDIT REVIEW
  const editReview = (e) => {
    setEditingReview(e);
    setRating(e.rating);
    setComment(e.comment);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  // ADD TO CART
  const addToCart = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!size || !color) {
      setError("Please select size and color");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(
        `${API_URL}/api/cart/${userId}/add`,
        {
          productId: product._id,
          quantity: qty,
          selectedSize: size,
          selectedColor: color,
        },
        config
      );

      navigate(`/cart?user=${userId}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to add product to cart"
      );
    } finally {
      setLoading(false);
    }
  };

  // WISHLIST
  const addWishlist = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(
        `${API_URL}/api/wishlist/${userId}/add`,
        {
          productId: product._id,
        },
        config
      );

      setError("Added to wishlist");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to add to wishlist"
      );
    } finally {
      setLoading(false);
    }
  };

  // BUY NOW
  const buyNow = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!size || !color) {
      setError("Please select size and color");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(
        `${API_URL}/api/cart/${userId}/add`,
        {
          productId: product._id,
          quantity: qty,
          selectedSize: size,
          selectedColor: color,
        },
        config
      );

      navigate(`/checkout?user=${userId}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to continue to checkout"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !product) {
    return (
      <p className="p-10 text-center">
        Loading...
      </p>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Product is not found
          </h1>

          <Link
            to="/products"
            className="mt-4 inline-block underline"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">

      {/* BREADCRUMB */}
      <p className="mb-5 text-xs text-gray-500 sm:mb-8 sm:text-sm">
        <Link to="/" className="hover:text-black">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/products" className="hover:text-black">
          Products
        </Link>{" "}
        / {product.title}
      </p>

      {/* ERROR */}
      {error && (
        <div className="mb-5 rounded-lg border bg-gray-100 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* PRODUCT */}
      <div className="grid gap-7 md:grid-cols-2 lg:gap-10">

        {/* IMAGES */}
        <div>
          <div className="overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={product.images?.[image]}
              alt={product.title}
              className="h-[350px] w-full object-cover sm:h-[500px] lg:h-[580px]"
            />
          </div>

          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {product.images?.map((e, index) => (
              <button
                key={e}
                onClick={() => setImage(index)}
                className={`shrink-0 overflow-hidden rounded-xl border-2 ${
                  image === index
                    ? "border-green-500"
                    : "border-transparent"
                }`}
              >
                <img
                  src={e}
                  alt=""
                  className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                />
              </button>
            ))}
          </div>
        </div>

        {/* DETAILS */}
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
            {product.title}
          </h1>

          {/* RATING */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex text-yellow-500">
              {[1, 2, 3, 4, 5].map((e) => (
                <Star
                  key={e}
                  size={17}
                  fill={
                    e <= Math.round(product.rating || 0)
                      ? "currentColor"
                      : "none"
                  }
                />
              ))}
            </div>

            <span className="text-sm text-gray-500">
              {product.rating || 0} ({product.reviews || 0} reviews)
            </span>
          </div>

          {/* PRICE */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold sm:text-3xl">
              ₹{product.price}
            </span>

            {product.oldPrice > 0 && (
              <span className="text-lg text-gray-400 line-through">
                ₹{product.oldPrice}
              </span>
            )}

            {product.off > 0 && (
              <span className="rounded bg-green-100 px-2 py-1 text-sm font-semibold text-green-600">
                {product.off}% OFF
              </span>
            )}
          </div>

          <p className="mt-5 leading-7 text-gray-600">
            {product.description}
          </p>

          {/* SIZE */}
          {product.sizes?.length > 0 && (
            <div className="mt-7">
              <h3 className="mb-3 font-semibold">
                Select Size
              </h3>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((e) => (
                  <button
                    key={e}
                    onClick={() => setSize(e)}
                    className={`h-10 min-w-12 rounded-lg border px-3 ${
                      size === e
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COLOR */}
          {product.colors?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-semibold">
                Color
              </h3>

              <div className="flex flex-wrap gap-2">
                {product.colors.map((e) => (
                  <button
                    key={e}
                    onClick={() => setColor(e)}
                    className={`rounded-lg border px-4 py-2 text-sm ${
                      color === e
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div className="mt-6 flex items-center gap-4">
            <span className="font-semibold">
              Quantity
            </span>

            <div className="flex items-center rounded-lg border">
              <button
                disabled={qty <= 1}
                onClick={() =>
                  setQty((q) => Math.max(1, q - 1))
                }
                className="p-2 disabled:opacity-30"
              >
                <Minus size={16} />
              </button>

              <span className="px-4">
                {qty}
              </span>

              <button
                disabled={qty >= product.stock}
                onClick={() => setQty((q) => q + 1)}
                className="p-2 disabled:opacity-30"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* STOCK */}
          <p className="mt-3 text-sm text-gray-500">
            {product.stock > 0
              ? `${product.stock} items available`
              : "Out of stock"}
          </p>

          {/* ACTIONS */}
          <div className="mt-8 flex gap-2 sm:gap-3">
            <button
              disabled={loading || product.stock <= 0}
              onClick={addToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-3 font-semibold text-white hover:bg-green-600 disabled:opacity-50"
            >
              <ShoppingBag size={19} />
              {loading ? "Adding..." : "Add To Cart"}
            </button>

            <button
              disabled={loading}
              onClick={addWishlist}
              className="rounded-xl border px-4 hover:bg-gray-100 disabled:opacity-50"
            >
              <Heart size={21} />
            </button>
          </div>

          <button
            disabled={loading || product.stock <= 0}
            onClick={buyNow}
            className="mt-3 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Buy Now"}
          </button>
        </div>
      </div>

      {/* DESCRIPTION */}
      <section className="mt-12 border-t pt-8 sm:mt-16 sm:pt-10">
        <h2 className="text-xl font-bold sm:text-2xl">
          Product Description
        </h2>

        <p className="mt-4 max-w-3xl leading-7 text-gray-600">
          {product.description}
        </p>
      </section>

      {/* REVIEWS */}
      <section className="mt-12 border-t pt-8 sm:mt-16 sm:pt-10">
        <h2 className="text-xl font-bold sm:text-2xl">
          Customer Reviews
        </h2>

        {/* REVIEW FORM */}
        <div className="mt-6 rounded-xl border p-4 sm:p-6">
          <h3 className="font-semibold">
            {editingReview
              ? "Edit Your Review"
              : "Write a Review"}
          </h3>

          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((e) => (
              <button
                key={e}
                onClick={() => setRating(e)}
                className={
                  e <= rating
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              >
                <Star
                  size={23}
                  fill="currentColor"
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            rows={4}
            className="mt-4 w-full rounded-lg border p-3 outline-none focus:border-black"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              disabled={reviewLoading}
              onClick={submitReview}
              className="rounded-lg bg-black px-5 py-2.5 text-white disabled:opacity-50"
            >
              {reviewLoading
                ? "Saving..."
                : editingReview
                ? "Update Review"
                : "Submit Review"}
            </button>

            {editingReview && (
              <button
                onClick={() => {
                  setEditingReview(null);
                  setRating(5);
                  setComment("");
                }}
                className="rounded-lg border px-5 py-2.5"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* REVIEW LIST */}
        <div className="mt-7 space-y-5">
          {!reviews.length ? (
            <p className="text-gray-500">
              No reviews yet. Be the first to review this product.
            </p>
          ) : (
            reviews.map((e) => {
              const own =
                e.userId?._id?.toString() ===
                userId?.toString();

              return (
                <div
                  key={e._id}
                  className="border-b pb-5"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {e.userId?.fullName || "User"}
                      </p>

                      <div className="mt-1 flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={15}
                            fill={
                              star <= e.rating
                                ? "currentColor"
                                : "none"
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {own && (
                      <div className="flex gap-3 text-sm">
                        <button
                          onClick={() => editReview(e)}
                          className="underline"
                        >
                          Edit
                        </button>

                        <button
                          disabled={reviewLoading}
                          onClick={() =>
                            deleteReview(e._id)
                          }
                          className="text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="mt-3 break-words text-gray-600">
                    {e.comment}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(
                      e.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* RECOMMENDED */}
      <section className="mt-12 sm:mt-16">
        <h2 className="text-xl font-bold sm:text-2xl">
          You May Also Like
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {recommended.map((e) => (
            <Link
              key={e._id}
              to={`/product?id=${e._id}`}
              className="overflow-hidden rounded-xl bg-gray-50 sm:rounded-2xl"
            >
              <img
                src={e.images?.[0]}
                alt={e.title}
                className="h-44 w-full object-cover transition hover:scale-105 sm:h-60"
              />

              <div className="p-3 sm:p-4">
                <h3 className="truncate text-sm font-semibold sm:text-base">
                  {e.title}
                </h3>

                <div className="mt-2 flex gap-2 text-sm sm:text-base">
                  <span className="font-bold">
                    ₹{e.price}
                  </span>

                  {e.oldPrice > 0 && (
                    <span className="text-gray-400 line-through">
                      ₹{e.oldPrice}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ProductDetails;