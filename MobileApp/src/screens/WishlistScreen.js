import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { COLORS } from "../constants/colors";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import { useWishlist } from "../context/WishlistContext";

const WishlistScreen = ({ navigation }) => {
  const { wishlist, wishlistCount } = useWishlist();

  return (
    <View style={styles.container}>
      <Header title={`My Wishlist (${wishlistCount})`} navigation={navigation} />

      <FlatList
        data={wishlist}
        keyExtractor={(item) => item._id || String(Math.random())}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="heart"
            title="Your Wishlist is Empty"
            description="Explore our collections and tap the heart icon on items you'd love to save for later."
            btnText="Explore Trending Styles"
            onPress={() => navigation.navigate("HomeTab")}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
});

export default WishlistScreen;
