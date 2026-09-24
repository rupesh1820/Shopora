import apiClient from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Fallback seed products if offline or server is waking up
const FALLBACK_PRODUCTS = [
  {
    _id: "6ab124cc4dc610d521c3856a",
    title: "Oversized t-shirt for girl stylish",
    category: "T-Shirts",
    gender: "Women",
    price: 399,
    oldPrice: 599,
    off: 33,
    rating: 5,
    reviews: 1,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Blue", "Green"],
    images: [
      "https://res.cloudinary.com/dpxukdkan/image/upload/v1789994187/shopara/products/yzuq4i0ecns4cvnozfkt.webp",
    ],
    description: "Add a relaxed and stylish touch to your wardrobe with this oversized T-shirt.",
    stock: 20,
    isActive: true,
  },
  {
    _id: "6ab1221cde1f7d0ab5ae717a",
    title: "Oversize T-shirt stylish",
    category: "T-Shirts",
    gender: "Men",
    price: 299,
    oldPrice: 399,
    off: 25,
    rating: 4.5,
    reviews: 0,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Brown"],
    images: [
      "https://res.cloudinary.com/dpxukdkan/image/upload/v1789993499/shopara/products/rbb0qvfddm9vl1mkujmw.webp",
    ],
    description: "Upgrade your everyday wardrobe with this rust brown oversized T-shirt.",
    stock: 50,
    isActive: true,
  },
  {
    _id: "6ab12d32ba9851535e945900",
    title: "Men Urban Fit Shirt",
    category: "Shirts",
    gender: "Men",
    price: 899,
    oldPrice: 1299,
    off: 31,
    rating: 4.8,
    reviews: 6,
    sizes: ["M", "L", "XL"],
    colors: ["Olive", "White"],
    images: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    ],
    description: "Modern cotton shirt for everyday casual styling.",
    stock: 35,
    isActive: true,
  },
  {
    _id: "6ab13079d5412713f11c193b",
    title: "Women Black Classic Dress",
    category: "Dresses",
    gender: "Women",
    price: 1599,
    oldPrice: 2199,
    off: 30,
    rating: 4.9,
    reviews: 8,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Navy", "Black"],
    images: [
      "https://www.wearview.co/_next/image?q=75&url=https%3A%2F%2Fcdn.wearview.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fblog-images%2Fghost-mannequin-photography%2Fghost-mannequin-gallery-black-dress.webp&w=3840",
    ],
    description: "Women Black Classic Dress with a comfortable fit and quality fabric.",
    stock: 44,
    isActive: true,
  },
];

export const getProducts = async (params = {}) => {
  try {
    const queryParts = [];
    if (params.category) queryParts.push(`category=${encodeURIComponent(params.category)}`);
    if (params.gender) queryParts.push(`gender=${encodeURIComponent(params.gender)}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.sale) queryParts.push("sale=true");

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const res = await apiClient.get(`/api/products${queryString}`);

    // Universal array extractor
    let list = [];
    const raw = res.data;
    if (Array.isArray(raw)) {
      list = raw;
    } else if (Array.isArray(raw?.products)) {
      list = raw.products;
    } else if (Array.isArray(raw?.Products)) {
      list = raw.Products;
    } else if (Array.isArray(raw?.data)) {
      list = raw.data;
    } else if (Array.isArray(raw?.data?.products)) {
      list = raw.data.products;
    }

    if (list.length > 0) {
      // Save successful product list into AsyncStorage cache
      AsyncStorage.setItem("shopara_cached_products", JSON.stringify(list)).catch(() => {});
      return list;
    }

    // Try reading cache if response was empty
    const cached = await AsyncStorage.getItem("shopara_cached_products");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    return FALLBACK_PRODUCTS;
  } catch (err) {
    console.warn("getProducts API failed, checking local cache:", err.message);
    try {
      const cached = await AsyncStorage.getItem("shopara_cached_products");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}

    return FALLBACK_PRODUCTS;
  }
};

export const getProductById = async (id) => {
  try {
    const res = await apiClient.get(`/api/products/${id}`);
    const data = res.data?.product || res.data?.data || res.data;
    if (data && (data._id || data.title)) {
      return data;
    }
    // Check fallback
    return FALLBACK_PRODUCTS.find((p) => p._id === id) || null;
  } catch (err) {
    console.warn("getProductById failed, checking fallback:", err.message);
    return FALLBACK_PRODUCTS.find((p) => p._id === id) || null;
  }
};
