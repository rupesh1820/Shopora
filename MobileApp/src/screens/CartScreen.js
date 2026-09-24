import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import Header from "../components/Header";
import EmptyState from "../components/EmptyState";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const CartScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartItems, cartCount, cartSubtotal, updateQuantity, removeFromCart } =
    useCart();
  const { isAuthenticated } = useAuth();

  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const deliveryFee = cartSubtotal > 999 || cartSubtotal === 0 ? 0 : 99;
  const discountAmount = Math.round((cartSubtotal * discountPercent) / 100);
  const totalAmount = Math.max(0, cartSubtotal - discountAmount + deliveryFee);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "SHOPARA20" || code === "WELCOME20") {
      setDiscountPercent(20);
      Alert.alert("Coupon Applied! 🎉", "20% discount has been applied to your order.");
    } else if (code === "FLAT10") {
      setDiscountPercent(10);
      Alert.alert("Coupon Applied! 🎉", "10% discount has been applied to your order.");
    } else {
      Alert.alert("Invalid Coupon", "Please enter a valid coupon code (e.g. SHOPARA20).");
    }
  };

  const handleProceedCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Cart Empty", "Please add some items to your bag first.");
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        "Login Required",
        "Please login to proceed with checkout and place your order.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login Now", onPress: () => navigation.navigate("LoginScreen") },
        ]
      );
      return;
    }

    navigation.navigate("CheckoutScreen", {
      subtotal: cartSubtotal,
      discount: discountAmount,
      deliveryFee,
      total: totalAmount,
      coupon: discountPercent > 0 ? couponCode : null,
    });
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="My Shopping Bag" navigation={navigation} />
        <View style={{ flex: 1, paddingBottom: 80 + insets.bottom }}>
          <EmptyState
            icon="shopping-bag"
            title="Your Shopping Bag is Empty"
            description="Looks like you haven't added anything to your cart yet. Explore our latest styles!"
            btnText="Start Shopping"
            onPress={() => navigation.navigate("HomeTab")}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={`My Bag (${cartCount})`} navigation={navigation} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 130 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* CART ITEMS LIST */}
        <View style={styles.itemList}>
          {cartItems.map((item, idx) => {
            const product = item.product || {};
            const imgUri =
              product.images?.[0] ||
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80";

            return (
              <View
                key={`${item.productId}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                style={styles.cartCard}
              >
                <Image source={{ uri: imgUri }} style={styles.cartImage} />

                <View style={styles.cardDetails}>
                  <View style={styles.titleRow}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {product.title || "Product"}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        removeFromCart(
                          item.productId,
                          item.selectedSize,
                          item.selectedColor
                        )
                      }
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="trash-2" size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.metaRow}>
                    {item.selectedSize && (
                      <View style={styles.metaBadge}>
                        <Text style={styles.metaBadgeText}>
                          Size: {item.selectedSize}
                        </Text>
                      </View>
                    )}
                    {item.selectedColor && (
                      <View style={styles.metaBadge}>
                        <Text style={styles.metaBadgeText}>
                          {item.selectedColor}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.bottomRow}>
                    <Text style={styles.itemPrice}>
                      ₹{(product.price || 0) * item.quantity}
                    </Text>

                    <View style={styles.qtyControl}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() =>
                          updateQuantity(
                            item.productId,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity - 1
                          )
                        }
                      >
                        <Feather name="minus" size={14} color={COLORS.dark} />
                      </TouchableOpacity>

                      <Text style={styles.qtyText}>{item.quantity}</Text>

                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() =>
                          updateQuantity(
                            item.productId,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity + 1
                          )
                        }
                      >
                        <Feather name="plus" size={14} color={COLORS.dark} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* PROMO / COUPON CARD */}
        <View style={styles.couponCard}>
          <Text style={styles.cardTitle}>Apply Promo Code</Text>
          <View style={styles.couponInputRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="e.g. SHOPARA20"
              placeholderTextColor={COLORS.textLight}
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApplyCoupon}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {discountPercent > 0 && (
            <Text style={styles.couponSuccess}>
              ✓ {discountPercent}% discount applied!
            </Text>
          )}
        </View>

        {/* BILL SUMMARY */}
        <View style={styles.billCard}>
          <Text style={styles.cardTitle}>Order Summary</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Subtotal</Text>
            <Text style={styles.billValue}>₹{cartSubtotal}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Discount ({discountPercent}%)</Text>
              <Text style={[styles.billValue, { color: COLORS.primary }]}>
                -₹{discountAmount}
              </Text>
            </View>
          )}

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>
              {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
            </Text>
          </View>

          <View style={styles.billDivider} />

          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* STICKY CHECKOUT BAR */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.checkoutTotalLabel}>Total Payable</Text>
          <Text style={styles.checkoutTotalValue}>₹{totalAmount}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          activeOpacity={0.85}
          onPress={handleProceedCheckout}
        >
          <Text style={styles.checkoutBtnText}>Checkout</Text>
          <Feather name="arrow-right" size={16} color="#fff" />
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
    padding: 16,
    paddingTop: 12,
  },
  itemList: {
    gap: 12,
    marginBottom: 16,
  },
  cartCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 12,
  },
  cartImage: {
    width: 80,
    height: 90,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  cardDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.dark,
    flex: 1,
    marginRight: 8,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 4,
  },
  metaBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaBadgeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.dark,
    paddingHorizontal: 8,
  },
  couponCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 12,
  },
  couponInputRow: {
    flexDirection: "row",
    gap: 10,
  },
  couponInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    backgroundColor: "#f8fafc",
  },
  applyBtn: {
    backgroundColor: COLORS.dark,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  applyBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  couponSuccess: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
  billCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  billValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  billDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.dark,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },
  checkoutBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  checkoutTotalLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  checkoutTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.dark,
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  checkoutBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default CartScreen;
