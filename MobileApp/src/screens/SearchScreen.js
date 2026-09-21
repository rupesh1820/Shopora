import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { getProducts } from "../api/products";

const FILTERS = ["All", "Men", "Women", "Kids", "Sale"];

const SearchScreen = ({ route, navigation }) => {
  const initialGender = route.params?.gender || "";
  const initialCategory = route.params?.category || "";
  const initialSale = route.params?.sale || false;

  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(
    initialSale ? "Sale" : initialGender || "All"
  );
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [products, setProducts] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
      } catch (e) {
        console.error("Search fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    let result = [...products];

    // Filter by text query
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.gender?.toLowerCase().includes(q)
      );
    }

    // Filter by active pill
    if (activeFilter === "Sale") {
      result = result.filter((p) => (p.oldPrice || 0) > (p.price || 0));
    } else if (activeFilter !== "All") {
      result = result.filter(
        (p) => p.gender?.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    // Filter by category if passed
    if (selectedCategory) {
      result = result.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredList(result);
  }, [query, activeFilter, selectedCategory, products]);

  return (
    <View style={styles.container}>
      <Header
        title={selectedCategory ? `${selectedCategory}` : "Search Products"}
        showBack={true}
        navigation={navigation}
      />

      {/* SEARCH BAR */}
      <View style={styles.searchBarContainer}>
        <View style={styles.inputWrapper}>
          <Feather name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Search by name, category, or style..."
            placeholderTextColor={COLORS.textLight}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Feather name="x" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* QUICK FILTER PILLS */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterPill,
              activeFilter === f && styles.activeFilterPill,
            ]}
            onPress={() => setActiveFilter(f)}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === f && styles.activeFilterPillText,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
        {selectedCategory && (
          <TouchableOpacity
            style={styles.clearCategoryPill}
            onPress={() => setSelectedCategory("")}
          >
            <Text style={styles.clearCategoryText}>✕ {selectedCategory}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* RESULT COUNT */}
      <View style={styles.metaRow}>
        <Text style={styles.resultCount}>
          Showing {filteredList.length} items
        </Text>
      </View>

      {/* PRODUCT GRID */}
      {loading ? (
        <LoadingSpinner text="Searching catalog..." />
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="No products matched"
              description="Try adjusting your search query or filters to find what you're looking for."
              btnText="Reset Filters"
              onPress={() => {
                setQuery("");
                setActiveFilter("All");
                setSelectedCategory("");
              }}
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
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexWrap: "wrap",
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
  },
  activeFilterPill: {
    backgroundColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  activeFilterPillText: {
    color: "#fff",
  },
  clearCategoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#fee2e2",
  },
  clearCategoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.danger,
  },
  metaRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultCount: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
});

export default SearchScreen;
