import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useCart } from "../context/CartContext";

const Header = ({ title, showBack = false, onBack, navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartCount } = useCart();

  // Top inset with generous safe padding across Android status bar & iOS notch
  const topInset =
    Platform.OS === "android"
      ? Math.max(insets.top, StatusBar.currentHeight ? StatusBar.currentHeight + 6 : 30)
      : Math.max(insets.top, 24);

  return (
    <View style={[styles.wrapper, { paddingTop: topInset }]}>
      <View style={styles.headerBar}>
        <View style={styles.leftRow}>
          {showBack && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onBack || (() => navigation?.goBack())}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="search" size={21} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation?.navigate("CartTab")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  headerBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
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
