import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import Header from "../components/Header";

const GENDERS = ["Men", "Women", "Kids"];

const CATEGORY_ITEMS = {
  Men: [
    { name: "T-Shirts", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80", count: "5+ styles" },
    { name: "Shirts", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80", count: "3+ styles" },
    { name: "Jeans", image: "https://images.unsplash.com/photo-1542272604-780c96856592?w=500&q=80", count: "9+ styles" },
    { name: "Trousers", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80", count: "3+ styles" },
    { name: "Hoodies", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80", count: "3+ styles" },
    { name: "Jackets", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80", count: "2+ styles" },
  ],
  Women: [
    { name: "Dresses", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80", count: "13+ styles" },
    { name: "T-Shirts", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&q=80", count: "3+ styles" },
    { name: "Jeans", image: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=500&q=80", count: "2+ styles" },
    { name: "Shirts", image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=500&q=80", count: "2+ styles" },
    { name: "Hoodies", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80", count: "2+ styles" },
    { name: "Jackets", image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=500&q=80", count: "3+ styles" },
  ],
  Kids: [
    { name: "T-Shirts", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&q=80", count: "11+ styles" },
    { name: "Jeans", image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&q=80", count: "3+ styles" },
    { name: "Dresses", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500&q=80", count: "2+ styles" },
    { name: "Hoodies", image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500&q=80", count: "2+ styles" },
    { name: "Shirts", image: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=500&q=80", count: "2+ styles" },
    { name: "Jackets", image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&q=80", count: "2+ styles" },
  ],
};

const CategoriesScreen = ({ navigation }) => {
  const [selectedGender, setSelectedGender] = useState("Men");

  const categories = CATEGORY_ITEMS[selectedGender] || [];

  return (
    <View style={styles.container}>
      <Header title="Categories" navigation={navigation} />

      {/* GENDER TABS */}
      <View style={styles.tabContainer}>
        {GENDERS.map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[
              styles.tabBtn,
              selectedGender === gender && styles.activeTabBtn,
            ]}
            onPress={() => setSelectedGender(gender)}
          >
            <Text
              style={[
                styles.tabText,
                selectedGender === gender && styles.activeTabText,
              ]}
            >
              {gender}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.card}
              activeOpacity={0.88}
              onPress={() =>
                navigation.navigate("SearchScreen", {
                  gender: selectedGender,
                  category: item.name,
                })
              }
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.overlay} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardCount}>{item.count}</Text>
              </View>
              <View style={styles.arrowCircle}>
                <Feather name="arrow-right" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: "#f1f5f9",
  },
  activeTabBtn: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: "#fff",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
    backgroundColor: "#e2e8f0",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  cardInfo: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 36,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  cardCount: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  arrowCircle: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CategoriesScreen;
