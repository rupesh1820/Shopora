import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { useWishlist } from "../context/WishlistContext";

const ProductCard = ({ product, onPress }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const title = product.title || product.name || "Product";
  const image =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80";
  const price = product.price || 0;
  const oldPrice = product.oldPrice || 0;
  const off = product.off || (oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);
  const rating = product.rating || 4.5;
  const isWishlisted = isInWishlist(product._id);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />

        {off > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{off}% OFF</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={() => toggleWishlist(product)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isWishlisted ? "heart" : "heart-outline"}
            size={18}
            color={isWishlisted ? COLORS.danger : COLORS.dark}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {product.category && (
          <Text style={styles.category} numberOfLines={1}>
            {product.category}
          </Text>
        )}

        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price}</Text>
          {oldPrice > price && (
            <Text style={styles.oldPrice}>₹{oldPrice}</Text>
          )}
        </View>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={13} color={COLORS.star} />
          <Text style={styles.ratingText}>{rating}</Text>
          {product.gender && (
            <Text style={styles.genderTag}>• {product.gender}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 14,
    marginHorizontal: 5,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#f1f5f9",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  wishlistBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: 10,
  },
  category: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 18,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.dark,
  },
  oldPrice: {
    fontSize: 12,
    color: COLORS.textLight,
    textDecorationLine: "line-through",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  genderTag: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
});

export default ProductCard;
