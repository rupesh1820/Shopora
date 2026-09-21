import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout from Shopara?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="My Account" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* USER PROFILE CARD */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.fullName || (isAuthenticated ? "Shopara User" : "Welcome Guest")}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || "Login to access your orders & wishlist"}
            </Text>
          </View>
        </View>

        {/* NOT LOGGED IN CTA */}
        {!isAuthenticated && (
          <View style={styles.authCtaCard}>
            <Text style={styles.authCtaTitle}>Experience Full Shopara</Text>
            <Text style={styles.authCtaSub}>
              Track orders, save favorites, and enjoy personalized recommendations.
            </Text>
            <View style={styles.authBtnRow}>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => navigation.navigate("LoginScreen")}
              >
                <Text style={styles.loginBtnText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.registerBtn}
                onPress={() => navigation.navigate("RegisterScreen")}
              >
                <Text style={styles.registerBtnText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MENU LIST */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (isAuthenticated) {
                navigation.navigate("OrderHistoryScreen");
              } else {
                navigation.navigate("LoginScreen");
              }
            }}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: "#f0fdf4" }]}>
                <Feather name="package" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.menuLabel}>My Orders</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("WishlistTab")}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: "#fef2f2" }]}>
                <Ionicons name="heart-outline" size={18} color={COLORS.danger} />
              </View>
              <Text style={styles.menuLabel}>My Wishlist</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("CartTab")}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: "#f0f9ff" }]}>
                <Feather name="shopping-bag" size={18} color="#0284c7" />
              </View>
              <Text style={styles.menuLabel}>My Shopping Bag</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* SUPPORT SECTION */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: "#f8fafc" }]}>
                <Feather name="help-circle" size={18} color={COLORS.textMuted} />
              </View>
              <Text style={styles.menuLabel}>Help & Support</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: "#f8fafc" }]}>
                <Feather name="shield" size={18} color={COLORS.textMuted} />
              </View>
              <Text style={styles.menuLabel}>Privacy Policy & Terms</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* LOGOUT BUTTON */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Feather name="log-out" size={18} color={COLORS.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.appVersion}>Shopara Mobile App • Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.dark,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  authCtaCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 16,
  },
  authCtaTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.dark,
  },
  authCtaSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18,
  },
  authBtnRow: {
    flexDirection: "row",
    gap: 12,
  },
  loginBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  registerBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  registerBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  menuSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  appVersion: {
    textAlign: "center",
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 24,
  },
});

export default ProfileScreen;
