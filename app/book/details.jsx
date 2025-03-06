import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { fetchBookById, resetSelectedBook } from "../redux/slice/bookSlice";
import { addToCart } from "../redux/slice/cartSlice";

const BookDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { bookId } = route.params;
  const { selectedBook, status, error } = useSelector((state) => state.books);
  const cartItems = useSelector((state) => state.cart.items);
  const [quantity, setQuantity] = useState(1);
  const isMounted = useRef(true);

  // Charger les détails du livre
  useEffect(() => {
    isMounted.current = true;
    dispatch(fetchBookById(bookId));

    return () => {
      isMounted.current = false;
      dispatch(resetSelectedBook());
    };
  }, [dispatch, bookId]);

  // Ajouter au panier
  const handleAddToCart = () => {
    dispatch(addToCart({ book: selectedBook, quantity }));
    Alert.alert(
      "Ajouté au panier",
      `${selectedBook.title} a été ajouté à votre panier`,
      [
        { text: "Continuer les achats" },
        {
          text: "Voir le panier",
          onPress: () => navigation.navigate("Cart"),
        },
      ]
    );
  };

  // Configurer le bouton de panier dans la barre de navigation
  // Configurer le bouton de panier dans la barre de navigation
  React.useLayoutEffect(() => {
    const cartCount = cartItems.reduce(
      (count, item) => count + item.quantity,
      0
    );

    const CartButton = () => (
      <TouchableOpacity
        onPress={() => navigation.navigate("Cart")}
        style={{ paddingRight: 15 }}
      >
        <View>
          <Ionicons name="cart-outline" size={24} color="#000" />
          {cartCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                backgroundColor: "red",
                borderRadius: 9,
                width: 18,
                height: 18,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {cartCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );

    navigation.setOptions({
      headerRight: () => <CartButton />,
    });
  }, [navigation, cartItems]);

  // Incrémenter la quantité
  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  // Décrémenter la quantité
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Afficher un indicateur de chargement
  if (status === "loading") {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#f44336" />
        <Text style={styles.errorText}>Une erreur est survenue</Text>
        <Text style={styles.errorDetails}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(fetchBookById(bookId))}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Si aucun livre n'est sélectionné
  if (!selectedBook) {
    return (
      <View style={styles.centered}>
        <Text>Livre non trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Image du livre */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: selectedBook.image || "https://via.placeholder.com/300x450",
          }}
          style={styles.bookImage}
          resizeMode="cover"
        />
      </View>

      {/* Informations principales */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{selectedBook.title}</Text>
        <Text style={styles.price}>{selectedBook.prix?.toFixed(2)} €</Text>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {selectedBook.description || "Aucune description disponible."}
          </Text>
        </View>

        {/* Sélecteur de quantité */}
        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>Quantité</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity <= 1 && styles.disabledButton,
              ]}
              onPress={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={20}
                color={quantity <= 1 ? "#ccc" : "#fff"}
              />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={incrementQuantity}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bouton d'ajout au panier */}
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart" size={20} color="#fff" />
          <Text style={styles.addToCartButtonText}>Ajouter au panier</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f44336",
    marginTop: 10,
  },
  errorDetails: {
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  imageContainer: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  bookImage: {
    width: 180,
    height: 270,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 20,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  quantityButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  disabledButton: {
    backgroundColor: "#f2f2f2",
  },
  quantityText: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
  addToCartButton: {
    backgroundColor: "#2ecc71",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  addToCartButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  cartButton: {
    marginRight: 15,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: "#e74c3c",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default BookDetails;
