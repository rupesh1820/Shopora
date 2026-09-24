import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "../api/orders";

const OrderHistoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        if (user?.id || user?._id) {
          const data = await getUserOrders(user.id || user._id);
          setOrders(data);
        }
      } catch (e) {
        console.error("Fetch orders error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return { bg: "#f0fdf4", text: COLORS.primaryDark };
      case "shipped":
        return { bg: "#eff6ff", text: "#2563eb" };
      case "cancelled":
        return { bg: "#fef2f2", text: COLORS.danger };
      default:
        return { bg: "#fffbeb", text: "#d97706" }; // Pending / processing
    }
  };

  return (
    <View style={styles.container}>
      <Header title="My Orders" showBack={true} navigation={navigation} />

      {loading ? (
        <LoadingSpinner text="Fetching your orders..." />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 40 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="package"
              title="No Orders Yet"
              description="You haven't placed any orders with Shopara yet. Start browsing our collection!"
              btnText="Start Shopping"
              onPress={() => navigation.navigate("HomeTab")}
            />
          }
          renderItem={({ item }) => {
            const statusStyle = getStatusColor(item.orderStatus);
            const dateStr = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Recently";

            return (
              <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>
                      Order #{item._id.slice(-8).toUpperCase()}
                    </Text>
                    <Text style={styles.orderDate}>{dateStr}</Text>
                  </View>
                  <View
                    style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: statusStyle.text },
                      ]}
                    >
                      {item.orderStatus || "Pending"}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* PRODUCT THUMBNAILS */}
                <View style={styles.itemsPreview}>
                  {(item.products || []).slice(0, 3).map((p, idx) => {
                    const productObj = p.productId || {};
                    const img =
                      productObj.images?.[0] ||
                      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80";

                    return (
                      <View key={idx} style={styles.previewItem}>
                        <Image source={{ uri: img }} style={styles.previewImage} />
                        <Text style={styles.previewTitle} numberOfLines={1}>
                          {productObj.title || "Product"}
                        </Text>
                        <Text style={styles.previewQty}>Qty: {p.quantity || 1}</Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.divider} />

                <View style={styles.orderFooter}>
                  <Text style={styles.totalLabel}>
                    Total ({item.products?.length || 0} items)
                  </Text>
                  <Text style={styles.totalValue}>₹{item.totalAmount || 0}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.dark,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 12,
  },
  itemsPreview: {
    flexDirection: "row",
    gap: 12,
  },
  previewItem: {
    flex: 1,
  },
  previewImage: {
    width: "100%",
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    marginBottom: 4,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
  },
  previewQty: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
});

export default OrderHistoryScreen;
