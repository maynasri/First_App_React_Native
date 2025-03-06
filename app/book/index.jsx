import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import BookCard from "../components/BookCard";
import { fetchBooks, setOnlineStatus } from "../redux/slice/bookSlice";
import NetInfo from "@react-native-community/netinfo";

const BookList = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    items: books,
    status,
    error,
    isOnline,
  } = useSelector((state) => state.books);
  const cartItems = useSelector((state) => state.cart.items);
  const isMounted = useRef(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);

  // Charger les livres au montage du composant
  useEffect(() => {
    isMounted.current = true;

    dispatch(fetchBooks());

    // Vérifier la connectivité internet
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (isMounted.current) {
        dispatch(
          setOnlineStatus(state.isConnected && state.isInternetReachable)
        );
      }
    });

    // Nettoyage
    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, [dispatch]);

  // Filtrer les livres en fonction de la recherche
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks(books);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = books.filter(
        (book) =>
          book.title.toLowerCase().includes(lowercaseQuery) ||
          (book.description &&
            book.description.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredBooks(filtered);
    }
  }, [books, searchQuery]);

  // Naviguer vers la page de détails d'un livre
  const handleBookPress = (book) => {
    navigation.navigate("BookDetails", { bookId: book.id });
  };

  // Naviguer vers le panier
  const navigateToCart = () => {
    navigation.navigate("Cart");
  };

  // Afficher le compteur de produits dans le panier
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Configurer l'icône de panier dans l'en-tête
  // Dans BookList - Modifiez la partie useLayoutEffect
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 15,
            padding: 5, // Ajouter un padding pour une meilleure zone de toucher
          }}
          onPress={navigateToCart}
        >
          <Ionicons name="cart-outline" size={24} color="#000" />
          {cartCount > 0 && (
            <View
              style={{
                position: "absolute",
                right: -6,
                top: -6,
                backgroundColor: "#e74c3c",
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, cartCount]);

  // Rendu d'un livre
  const renderBookItem = ({ item }) => (
    <BookCard
      book={item}
      onPress={() => handleBookPress(item)}
      isAdmin={false}
    />
  );

  return (
    <View style={styles.container}>
      {/* Indicateur de mode en ligne/hors ligne */}
      <View
        style={[
          styles.statusBar,
          isOnline ? styles.onlineStatus : styles.offlineStatus,
        ]}
      >
        <Text style={styles.statusText}>
          {isOnline
            ? "En ligne"
            : "Mode hors ligne - Certaines fonctionnalités peuvent être limitées"}
        </Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un livre..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Message d'erreur */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Indicateur de chargement */}
      {status === "loading" && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Chargement des livres...</Text>
        </View>
      )}

      {/* Liste des livres */}
      {status !== "loading" && (
        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "Aucun livre trouvé pour cette recherche"
                  : "Aucun livre disponible"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  statusBar: {
    padding: 5,
    alignItems: "center",
  },
  onlineStatus: {
    backgroundColor: "#4CAF50",
  },
  offlineStatus: {
    backgroundColor: "#F44336",
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  listContent: {
    padding: 10,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 10,
    margin: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  errorText: {
    color: "#d32f2f",
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

export default BookList;
