import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const books = [
  {
    id: "1",
    title: "React Native Basics",
    price: "$10",
    image: require("../../assets/splash.png"),
  },
  {
    id: "2",
    title: "Mastering JavaScript",
    price: "$15",
    image: require("../../assets/splash.png"),
  },
  {
    id: "3",
    title: "UI/UX Design Guide",
    price: "$12",
    image: require("../../assets/splash.png"),
  },
];

export default function BookList() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Icône du panier */}
      <TouchableOpacity
        style={styles.cartIcon}
        onPress={() => navigation.navigate("Cart")}
      >
        <Text style={styles.cartText}>🛒</Text>
      </TouchableOpacity>

      {/* Liste des livres */}
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("BookDetails", { book: item })}
          >
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>{item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  cartIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#ff6600",
    padding: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  cartText: {
    fontSize: 18,
    color: "#fff",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: 100,
    height: 150,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    fontSize: 14,
    color: "#ff6600",
    marginTop: 4,
  },
});
