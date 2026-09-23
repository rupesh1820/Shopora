import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useCart } from "../context/CartContext";

const Header = ({ title, showBack = false, onBack, navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartCount } = useCart();
  const topPadding = Math.max(insets.top, Platform.OS === "android" ? 16 : 12);

  return (
    <View style={[styles.container, { paddingTop: topPadding, height: 56 + topPadding }]}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onBack || (() => navigation?.goBack())}
          >
            <Feather name="arrow-left" size={22} color={COLORS.text} />
          </TouchableOpacity>
        )}
        {title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <TouchableOpacity onPress={() => navigation?.navigate("HomeTab")}>
            <Text style={styles.logo}>
              Shop<Text style={{ color: COLORS.primary }}>ora</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.rightRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation?.navigate("SearchScreen")}
        >
          <Feather name="search" size={21} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation?.navigate("CartTab")}
        >
          <Feather name="shopping-bag" size={21} color={COLORS.text} />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {cartCount > 99 ? "99+" : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.dark,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 8,
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    padding: 6,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});

export default Header;
