import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import Header from "../components/Header";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/orders";

const CheckoutScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 14);
  const { total = 0, subtotal = 0, discount = 0, deliveryFee = 0, coupon = null } =
    route.params || {};
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  const [shipping, setShipping] = useState({
    fullName: user?.fullName || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD"); // 'COD' | 'ONLINE'
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key, val) => {
    setShipping((prev) => ({ ...prev, [key]: val }));
  };

  const handlePlaceOrder = async () => {
    if (
      !shipping.fullName.trim() ||
      !shipping.phone.trim() ||
      !shipping.street.trim() ||
      !shipping.city.trim() ||
      !shipping.pincode.trim()
    ) {
      Alert.alert("Missing Details", "Please fill in all delivery address fields.");
      return;
    }

    try {
      setSubmitting(true);

      const orderPayload = {
        products: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          price: item.product?.price || 0,
        })),
        shippingAddress: {
          fullName: shipping.fullName,
          phone: shipping.phone,
          street: shipping.street,
          city: shipping.city,
          state: shipping.state,
          pincode: shipping.pincode,
        },
        paymentMethod,
        couponCode: coupon,
      };

      await createOrder(user?.id || user?._id, orderPayload);

      await clearCart();

      Alert.alert(
        "Order Placed Successfully! 🎉",
        "Thank you for shopping with Shopara. Your order has been placed and is being processed.",
        [
          {
            text: "View Orders",
            onPress: () => navigation.replace("OrderHistoryScreen"),
          },
          {
            text: "Back to Home",
            onPress: () => navigation.navigate("HomeTab"),
          },
        ]
      );
    } catch (e) {
      console.error("Place order error:", e);
      Alert.alert("Order Error", e.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Checkout" showBack={true} navigation={navigation} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 90 + bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* SHIPPING ADDRESS SECTION */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Feather name="map-pin" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={shipping.fullName}
                onChangeText={(v) => updateField("fullName", v)}
                placeholder="Rupesh Sharma"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={shipping.phone}
                onChangeText={(v) => updateField("phone", v)}
                placeholder="9876543210"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Street / Flat / House No *</Text>
              <TextInput
                style={styles.input}
                value={shipping.street}
                onChangeText={(v) => updateField("street", v)}
                placeholder="Flat 204, Green Heights"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={shipping.city}
                  onChangeText={(v) => updateField("city", v)}
                  placeholder="New Delhi"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>PIN Code *</Text>
                <TextInput
                  style={styles.input}
                  value={shipping.pincode}
                  onChangeText={(v) => updateField("pincode", v)}
                  placeholder="110001"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* PAYMENT METHOD */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Feather name="credit-card" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "COD" && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod("COD")}
          >
            <Ionicons
              name={paymentMethod === "COD" ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={paymentMethod === "COD" ? COLORS.primary : COLORS.textMuted}
            />
            <View style={styles.paymentTextCol}>
              <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
              <Text style={styles.paymentSub}>Pay with cash when package arrives</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "ONLINE" && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod("ONLINE")}
          >
            <Ionicons
              name={paymentMethod === "ONLINE" ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={paymentMethod === "ONLINE" ? COLORS.primary : COLORS.textMuted}
            />
            <View style={styles.paymentTextCol}>
              <Text style={styles.paymentTitle}>Razorpay / UPI / Cards</Text>
              <Text style={styles.paymentSub}>Instant & secure online payment</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ORDER SUMMARY RECAP */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>₹{subtotal}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryVal, { color: COLORS.primary }]}>-₹{discount}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryVal}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>₹{total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* PLACE ORDER BUTTON */}
      <View style={styles.footerBar}>
        <View>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalVal}>₹{total}</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderBtn, submitting && { opacity: 0.6 }]}
          disabled={submitting}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderText}>
            {submitting ? "Placing Order..." : "Place Order"}
          </Text>
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
    paddingBottom: 90,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.dark,
  },
  form: {
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: "#f8fafc",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#f8fafc",
  },
  paymentOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  paymentTextCol: {
    marginLeft: 12,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.dark,
  },
  paymentSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.dark,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },
  footerBar: {
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
  footerTotalLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  footerTotalVal: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.dark,
  },
  placeOrderBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default CheckoutScreen;
