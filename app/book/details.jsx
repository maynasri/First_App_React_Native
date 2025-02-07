import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function BookDetails({ route }) {
  const { book } = route.params;
  const navigation = useNavigation();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    checkIfBookIsInCart();
  }, []);

  // Vérifier si le livre est déjà dans le panier
  const checkIfBookIsInCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("cart");
      if (storedCart) {
        const cartItems = JSON.parse(storedCart);
        const exists = cartItems.some((item) => item.id === book.id);
        setIsAdded(exists);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du panier :", error);
    }
  };

  // Ajouter le livre au panier
  const addToCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("cart");
      let cartItems = storedCart ? JSON.parse(storedCart) : [];

      // Vérifier si le livre est déjà dans le panier
      if (!cartItems.some((item) => item.id === book.id)) {
        cartItems.push(book);
        await AsyncStorage.setItem("cart", JSON.stringify(cartItems));
        setIsAdded(true);
      }

      // Rediriger vers le panier après l'ajout
      navigation.navigate("Cart");
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier :", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={book.image} style={styles.image} />
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>{book.author}</Text>
      <Text style={styles.description}>{book.description}</Text>
      <Text style={styles.price}>{book.price}</Text>

      {/* Bouton Ajouter au panier */}
      <TouchableOpacity
        style={[styles.button, isAdded && styles.disabledButton]}
        onPress={addToCart}
        disabled={isAdded}
      >
        <Text style={styles.buttonText}>
          {isAdded ? "Déjà ajouté" : "Ajouter au panier"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 200,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  author: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  price: {
    fontSize: 18,
    color: "#ff6600",
    fontWeight: "bold",
    marginBottom: 16,
  },
  button: {
    padding: 12,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
