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
import { COLORS } from "../constants/colors";
import Header from "../components/Header";
import EmptyState from "../components/EmptyState";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const CartScreen = ({ navigation }) => {
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
        <EmptyState
          icon="shopping-bag"
          title="Your Shopping Bag is Empty"
          description="Looks like you haven't added anything to your cart yet. Explore our latest styles!"
          btnText="Start Shopping"
          onPress={() => navigation.navigate("HomeTab")}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={`My Bag (${cartCount})`} navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CART ITEMS LIST */}
        <View style={styles.itemList}>
          {cartItems.map((item, idx) => {
            const product = item.product || {};
            const imgUri =
              product.images?.[0] ||
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80";

            return (
              <View key={`${item.productId}-${idx}`} style={styles.cartCard}>
                <Image source={{ uri: imgUri }} style={styles.cardImage} />

                <View style={styles.cardInfo}>
                  <View style={styles.topRow}>
                    <Text style={styles.productTitle} numberOfLines={1}>
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

                  <View style={styles.variantRow}>
                    {item.selectedSize && (
                      <View style={styles.variantTag}>
                        <Text style={styles.variantText}>
                          Size: {item.selectedSize}
                        </Text>
                      </View>
                    )}
                    {item.selectedColor && (
                      <View style={styles.variantTag}>
                        <Text style={styles.variantText}>
                          {item.selectedColor}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.priceStepperRow}>
                    <Text style={styles.itemPrice}>
                      ₹{(product.price || 0) * item.quantity}
                    </Text>

                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() =>
                          updateQuantity(
                            item.productId,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity - 1
                          )
                        }
                      >
                        <Feather name="minus" size={14} color={COLORS.text} />
                      </TouchableOpacity>

                      <Text style={styles.stepQty}>{item.quantity}</Text>

                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() =>
                          updateQuantity(
                            item.productId,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity + 1
                          )
                        }
                      >
                        <Feather name="plus" size={14} color={COLORS.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* COUPON SECTION */}
        <View style={styles.couponCard}>
          <Text style={styles.cardTitle}>Have a Coupon Code?</Text>
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
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
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
    paddingBottom: 100,
  },
  itemList: {
    marginBottom: 16,
  },
  cartCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  cardImage: {
    width: 80,
    height: 96,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  variantRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  variantTag: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  variantText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  priceStepperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.dark,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepQty: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    minWidth: 20,
    textAlign: "center",
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
    gap: 8,
  },
  couponInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: "#f8fafc",
  },
  applyBtn: {
    backgroundColor: COLORS.dark,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
    paddingVertical: 12,
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
    paddingHorizontal: 20,
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
