import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import { getProductById } from "../api/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const { width } = Dimensions.get("window");

const ProductDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16) + 6;
  const { productId } = route.params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(productId);
        setProduct(data);
        if (data?.sizes?.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data?.colors?.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      } catch (e) {
        console.error("Fetch product error:", e);
        Alert.alert("Error", "Could not load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) {
    return <LoadingSpinner text="Loading product details..." />;
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Header showBack={true} navigation={navigation} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Product not found.</Text>
        </View>
      </View>
    );
  }

  const images = product.images || [];
  const price = product.price || 0;
  const oldPrice = product.oldPrice || 0;
  const off = product.off || (oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);
  const isWishlisted = isInWishlist(product._id);
  const stock = product.stock || 0;

  const handleAddToCart = (buyNow = false) => {
    if (!selectedSize && product.sizes?.length > 0) {
      Alert.alert("Please select a size", "Choose your size before adding to cart.");
      return;
    }
    if (!selectedColor && product.colors?.length > 0) {
      Alert.alert("Please select a color", "Choose your preferred color.");
      return;
    }

    addToCart(product, selectedSize, selectedColor, 1);

    if (buyNow) {
      navigation.navigate("CartTab");
    } else {
      Alert.alert(
        "Added to Cart! 🛍️",
        `${product.title} (${selectedSize}, ${selectedColor}) has been added to your shopping bag.`,
        [
          { text: "Continue Shopping", style: "cancel" },
          { text: "View Cart", onPress: () => navigation.navigate("CartTab") },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Product Details" showBack={true} navigation={navigation} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* IMAGE CAROUSEL */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {images.map((img, i) => (
              <Image
                key={i}
                source={{ uri: img }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, activeImageIndex === i && styles.activeDot]}
                />
              ))}
            </View>
          )}

          {/* FLOATING WISHLIST BUTTON */}
          <TouchableOpacity
            style={styles.floatingWishlist}
            onPress={() => toggleWishlist(product)}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={22}
              color={isWishlisted ? COLORS.danger : COLORS.dark}
            />
          </TouchableOpacity>
        </View>

        {/* DETAILS BODY */}
        <View style={styles.detailsBody}>
          {/* TAGS ROW */}
          <View style={styles.tagsRow}>
            {product.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{product.category}</Text>
              </View>
            )}
            {product.gender && (
              <View style={styles.genderBadge}>
                <Text style={styles.genderBadgeText}>{product.gender}</Text>
              </View>
            )}
            {stock > 0 ? (
              <View style={styles.stockBadge}>
                <Text style={styles.stockBadgeText}>In Stock ({stock})</Text>
              </View>
            ) : (
              <View style={[styles.stockBadge, { backgroundColor: COLORS.dangerLight }]}>
                <Text style={[styles.stockBadgeText, { color: COLORS.danger }]}>Out of Stock</Text>
              </View>
            )}
          </View>

          {/* TITLE */}
          <Text style={styles.title}>{product.title}</Text>

          {/* PRICE ROW */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{price}</Text>
            {oldPrice > price && (
              <Text style={styles.oldPrice}>₹{oldPrice}</Text>
            )}
            {off > 0 && (
              <View style={styles.offPill}>
                <Text style={styles.offPillText}>{off}% OFF</Text>
              </View>
            )}
          </View>

          {/* SIZES */}
          {product.sizes?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Select Size</Text>
                {selectedSize && (
                  <Text style={styles.selectedMeta}>Selected: {selectedSize}</Text>
                )}
              </View>
              <View style={styles.chipRow}>
                {product.sizes.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.sizeChip,
                      selectedSize === s && styles.activeSizeChip,
                    ]}
                    onPress={() => setSelectedSize(s)}
                  >
                    <Text
                      style={[
                        styles.sizeChipText,
                        selectedSize === s && styles.activeSizeChipText,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* COLORS */}
          {product.colors?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Select Color</Text>
                {selectedColor && (
                  <Text style={styles.selectedMeta}>Selected: {selectedColor}</Text>
                )}
              </View>
              <View style={styles.chipRow}>
                {product.colors.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorChip,
                      selectedColor === c && styles.activeColorChip,
                    ]}
                    onPress={() => setSelectedColor(c)}
                  >
                    <Text
                      style={[
                        styles.colorChipText,
                        selectedColor === c && styles.activeColorChipText,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* DESCRIPTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          {/* PERKS / TRUST BADGES */}
          <View style={styles.perksCard}>
            <View style={styles.perkLine}>
              <Feather name="truck" size={18} color={COLORS.primary} />
              <Text style={styles.perkLineText}>
                Free Shipping on all orders above ₹999
              </Text>
            </View>
            <View style={styles.perkLine}>
              <Feather name="rotate-ccw" size={18} color={COLORS.primary} />
              <Text style={styles.perkLineText}>
                Hassle-Free 7-Day Return & Exchange Policy
              </Text>
            </View>
            <View style={styles.perkLine}>
              <Feather name="shield" size={18} color={COLORS.primary} />
              <Text style={styles.perkLineText}>
                100% Guaranteed Genuine Shopara Products
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* STICKY BOTTOM ACTIONS */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPadding }]}>
        <TouchableOpacity
          style={styles.cartBtn}
          activeOpacity={0.8}
          onPress={() => handleAddToCart(false)}
        >
          <Feather name="shopping-bag" size={18} color={COLORS.primary} />
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyNowBtn}
          activeOpacity={0.8}
          onPress={() => handleAddToCart(true)}
        >
          <Text style={styles.buyNowBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  imageContainer: {
    width: width,
    height: width * 1.1,
    backgroundColor: "#f1f5f9",
    position: "relative",
  },
  productImage: {
    width: width,
    height: width * 1.1,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  activeDot: {
    width: 18,
    backgroundColor: COLORS.primary,
  },
  floatingWishlist: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsBody: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 20,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  categoryBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "700",
  },
  genderBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genderBadgeText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  stockBadge: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.dark,
    lineHeight: 26,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  price: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.dark,
  },
  oldPrice: {
    fontSize: 16,
    color: COLORS.textLight,
    textDecorationLine: "line-through",
  },
  offPill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  offPillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.dark,
  },
  selectedMeta: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeChip: {
    minWidth: 48,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  activeSizeChip: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  sizeChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  activeSizeChipText: {
    color: "#fff",
  },
  colorChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: "#f8fafc",
  },
  activeColorChip: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  colorChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  activeColorChipText: {
    color: "#fff",
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginTop: 6,
  },
  perksCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  perkLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  perkLineText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  cartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.card,
    gap: 8,
  },
  cartBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  buyNowBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },
  buyNowBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  notFoundText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
});

export default ProductDetailScreen;
