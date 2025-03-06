import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { BookService } from "../db/api";
import BookCard from "../components/BookCard";
import NetInfo from "@react-native-community/netinfo";

const BookListAdmin = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Charger les livres
  const loadBooks = async () => {
    try {
      const bookData = await BookService.getBooks();
      setBooks(bookData);
    } catch (error) {
      console.error("Erreur lors du chargement des livres:", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger les livres. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Vérifier la connexion
  const checkConnection = async () => {
    const netInfo = await NetInfo.fetch();
    setIsOnline(netInfo.isConnected && netInfo.isInternetReachable);
  };

  // Rafraîchir la liste
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    checkConnection();
    loadBooks();
  }, []);

  // Charger les livres à chaque fois que l'écran est affiché
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      checkConnection();
      loadBooks();
    }, [])
  );

  // Naviguer vers l'écran d'ajout de livre
  const handleAddBook = () => {
    navigation.navigate("AddBook");
  };

  // Naviguer vers l'écran de modification de livre
  const handleEditBook = (book) => {
    navigation.navigate("EditBook", { book });
  };

  // Supprimer un livre
  const handleDeleteBook = (bookId) => {
    Alert.alert("Confirmation", "Voulez-vous vraiment supprimer ce livre ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await BookService.deleteBook(bookId);
            if (result.success) {
              // Mettre à jour la liste locale
              setBooks(books.filter((book) => book.id !== bookId));
              Alert.alert("Succès", "Livre supprimé avec succès");
            } else {
              Alert.alert("Erreur", "Échec de la suppression du livre");
            }
          } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            Alert.alert(
              "Erreur",
              "Une erreur est survenue lors de la suppression"
            );
          }
        },
      },
    ]);
  };

  // Afficher les détails d'un livre
  const handleBookPress = (book) => {
    navigation.navigate("BookDetails", { bookId: book.id });
  };

  // Rendu de l'interface
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement des livres...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Indicateur de mode (Online/Offline) */}
      <View style={styles.connectionStatus}>
        <View
          style={[
            styles.statusIndicator,
            isOnline ? styles.online : styles.offline,
          ]}
        />
        <Text style={styles.statusText}>
          {isOnline ? "En ligne (JSON Server)" : "Hors ligne (SQLite)"}
        </Text>
      </View>

      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bibliothèque</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddBook}>
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Nouveau</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des livres */}
      {books.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Aucun livre dans la bibliothèque</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAddBook}>
            <Text style={styles.emptyButtonText}>Ajouter un livre</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              onPress={handleBookPress}
              isAdmin={true}
              onEdit={handleEditBook}
              onDelete={handleDeleteBook}
            />
          )}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3498db"]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f0f0f0",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  online: {
    backgroundColor: "#4CAF50",
  },
  offline: {
    backgroundColor: "#FF9800",
  },
  statusText: {
    fontSize: 12,
    color: "#555",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default BookListAdmin;
