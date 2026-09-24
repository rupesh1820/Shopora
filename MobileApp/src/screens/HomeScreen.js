import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import CategoryChip from "../components/CategoryChip";
import { getProducts } from "../api/products";

const CATEGORIES = [
  { name: "All", icon: "✨" },
  { name: "Men", icon: "👔", gender: "Men" },
  { name: "Women", icon: "👗", gender: "Women" },
  { name: "Kids", icon: "🧒", gender: "Kids" },
  { name: "T-Shirts", icon: "👕" },
  { name: "Jeans", icon: "👖" },
  { name: "Shirts", icon: "👔" },
  { name: "Hoodies", icon: "🧥" },
  { name: "Jackets", icon: "🧥" },
  { name: "Dresses", icon: "👗" },
];

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCat, setSelectedCat] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProductList = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (e) {
      console.warn("Fetch products error in HomeScreen:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProductList();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProductList();
  }, []);

  const handleCategorySelect = (cat) => {
    setSelectedCat(cat.name);
    if (cat.name === "All") {
      setFilteredProducts(products);
    } else if (cat.gender) {
      setFilteredProducts(
        products.filter(
          (p) => p.gender?.toLowerCase() === cat.gender.toLowerCase()
        )
      );
    } else {
      setFilteredProducts(
        products.filter(
          (p) => p.category?.toLowerCase() === cat.name.toLowerCase()
        )
      );
    }
  };

  const renderHeader = () => (
    <View>
      {/* HERO BANNER */}
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>SHOPARA FASHION</Text>
        </View>
        <Text style={styles.heroTitle}>Discover Your Everyday Style</Text>
        <Text style={styles.heroSubtitle}>
          Trending outfits across Men, Women & Kids with up to 40% OFF.
        </Text>
        <TouchableOpacity
          style={styles.heroBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("SearchScreen", { sale: true })}
        >
          <Text style={styles.heroBtnText}>Shop Sale Collection</Text>
          <Feather name="arrow-right" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* QUICK CATEGORY CHIPS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat.name}
            label={cat.name}
            icon={cat.icon}
            active={selectedCat === cat.name}
            onPress={() => handleCategorySelect(cat)}
          />
        ))}
      </ScrollView>

      {/* PROMO HIGHLIGHTS BAR */}
      <View style={styles.perksRow}>
        <View style={styles.perkItem}>
          <Feather name="truck" size={16} color={COLORS.primary} />
          <Text style={styles.perkText}>Free Delivery</Text>
        </View>
        <View style={styles.perkDivider} />
        <View style={styles.perkItem}>
          <Feather name="shield" size={16} color={COLORS.primary} />
          <Text style={styles.perkText}>100% Genuine</Text>
        </View>
        <View style={styles.perkDivider} />
        <View style={styles.perkItem}>
          <Feather name="rotate-ccw" size={16} color={COLORS.primary} />
          <Text style={styles.perkText}>Easy Returns</Text>
        </View>
      </View>

      {/* SECTION TITLE */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Trending Products</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredProducts.length} styles ready to order
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("SearchScreen")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      {loading && !refreshing && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Shopara Fashion...</Text>
          <Text style={styles.loadingSub}>Connecting to cloud server, please wait</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 110 + insets.bottom },
          ]}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="shopping-bag" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                Swipe down to refresh or check your internet connection
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={fetchProductList}
              >
                <Text style={styles.retryBtnText}>Reload Products</Text>
              </TouchableOpacity>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate("ProductDetail", { productId: item._id })
              }
            />
          )}
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
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  heroCard: {
    backgroundColor: COLORS.dark,
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 28,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
    marginBottom: 16,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  heroBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.dark,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
  categoriesScroll: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  perksRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  perkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  perkText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
  },
  perkDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.dark,
  },
  loadingSub: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.dark,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default HomeScreen;
