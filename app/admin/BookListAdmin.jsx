// admin/BookListAdmin.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native"; // Ajout de useFocusEffect
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import BookCard from "../components/BookCard";
import * as ConnectivityService from "../services/ConnectivityService";

const BookListAdmin = () => {
  const navigation = useNavigation();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  // Vérifier la connexion
  const checkConnection = async () => {
    try {
      const isConnected = await ConnectivityService.checkConnection();
      if (isMounted.current) {
        setIsOnline(isConnected);
      }
    } catch (err) {
      console.error("Error checking connection:", err);
    }
  };

  // Charger les livres
  const loadBooks = async () => {
    try {
      if (isMounted.current) setIsLoading(true);
      await checkConnection();
      const booksData = await ConnectivityService.getBooks();

      if (isMounted.current) {
        setBooks(booksData);
        setError(null);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error loading books:", err);
      if (isMounted.current) {
        setError("Impossible de charger les livres. Veuillez réessayer.");
        setIsLoading(false);
      }
    }
  };

  // Synchroniser avec le serveur
  const syncWithServer = async () => {
    if (!isOnline) {
      Alert.alert(
        "Mode hors ligne",
        "Vous êtes actuellement hors ligne. Veuillez vous connecter pour synchroniser."
      );
      return;
    }

    try {
      if (isMounted.current) setIsSyncing(true);
      const success = await ConnectivityService.syncLocalChangesToServer();

      if (isMounted.current) {
        if (success) {
          Alert.alert(
            "Succès",
            "Les données ont été synchronisées avec succès."
          );
          await loadBooks();
        } else {
          Alert.alert(
            "Erreur",
            "Une erreur est survenue lors de la synchronisation."
          );
        }
        setIsSyncing(false);
      }
    } catch (err) {
      console.error("Error syncing with server:", err);
      if (isMounted.current) {
        Alert.alert(
          "Erreur",
          "Une erreur est survenue lors de la synchronisation."
        );
        setIsSyncing(false);
      }
    }
  };

  // Supprimer un livre
  const handleDeleteBook = (id) => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer ce livre ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await ConnectivityService.deleteBook(id);
              if (isMounted.current) {
                setBooks((prevBooks) =>
                  prevBooks.filter((book) => book.id !== id)
                );
                Alert.alert("Succès", "Livre supprimé avec succès");
              }
            } catch (err) {
              console.error("Error deleting book:", err);
              if (isMounted.current) {
                Alert.alert(
                  "Erreur",
                  "Une erreur est survenue lors de la suppression."
                );
              }
            }
          },
        },
      ]
    );
  };

  // Actualiser la liste
  const handleRefresh = async () => {
    if (isMounted.current) setIsRefreshing(true);
    await loadBooks();
    if (isMounted.current) setIsRefreshing(false);
  };

  // Gérer les actions sur les cartes
  const handleBookPress = (book) => {
    navigation.navigate("EditBook", { bookId: book.id });
  };

  const handleEditBook = (book) => {
    navigation.navigate("EditBook", { bookId: book.id });
  };

  // Ajouter un livre
  const handleAddBook = () => {
    navigation.navigate("AddBook");
  };

  // Se déconnecter
  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  };

  // Configurer le bouton de déconnexion dans la barre de navigation
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Utilisation de useFocusEffect pour recharger les livres lorsque l'écran devient actif
  useFocusEffect(
    useCallback(() => {
      // Cette fonction sera exécutée chaque fois que l'écran devient actif
      loadBooks();

      return () => {
        // Nettoyage optionnel si nécessaire
      };
    }, [])
  );

  // Effet de montage et nettoyage
  useEffect(() => {
    isMounted.current = true;

    // Ajouter un listener pour les changements de connexion
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (isMounted.current) {
        setIsOnline(state.isConnected && state.isInternetReachable);
      }
    });

    // Nettoyer au démontage
    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, []);

  // Rendu de la liste de livres
  const renderBookItem = ({ item }) => (
    <BookCard
      book={item}
      onPress={handleBookPress}
      isAdmin={true}
      onEdit={handleEditBook}
      onDelete={handleDeleteBook}
    />
  );

  return (
    <View style={styles.container}>
      {/* Indicateur de statut en ligne/hors ligne */}
      <View
        style={[
          styles.statusBar,
          isOnline ? styles.onlineStatus : styles.offlineStatus,
        ]}
      >
        <Text style={styles.statusText}>
          {isOnline ? "En ligne (JSON Server)" : "Hors ligne (SQLite)"}
        </Text>
      </View>

      {/* En-tête avec boutons d'actions */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gérer les Livres</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.disabledButton]}
            onPress={syncWithServer}
            disabled={isSyncing || !isOnline}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="sync" size={20} color="#fff" />
                <Text style={styles.buttonText}>Sync</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={handleAddBook}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.buttonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Message d'erreur */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Liste des livres */}
      {isLoading && !isRefreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Chargement des livres...</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Aucun livre disponible</Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={handleAddBook}
              >
                <Text style={styles.emptyAddButtonText}>Ajouter un livre</Text>
              </TouchableOpacity>
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
    padding: 8,
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerButtons: {
    flexDirection: "row",
  },
  syncButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  addButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    marginBottom: 20,
  },
  emptyAddButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  errorText: {
    color: "#d32f2f",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
});

export default BookListAdmin;
