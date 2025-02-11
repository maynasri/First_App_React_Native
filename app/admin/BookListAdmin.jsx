// app/BookListAdmin.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createTable, getBooks, deleteBook } from "../db/dbBooks"; // Ajustez le chemin selon votre organisation

export default function BookListAdmin() {
  const [books, setBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const navigation = useNavigation();

  // Initialisation : création de la table puis chargement des livres
  useEffect(() => {
    createTable(); // Crée la table Books si elle n'existe pas déjà
    loadBooks();
  }, []);

  // Fonction pour charger les livres
  const loadBooks = useCallback(() => {
    getBooks((booksData) => {
      setBooks(booksData);
    });
  }, []);

  // Fonction de suppression avec confirmation via le modal
  const handleDeleteBook = (id) => {
    setBookToDelete(id);
    setShowModal(true);
  };

  // Confirmer la suppression
  const confirmDelete = () => {
    if (bookToDelete) {
      deleteBook(bookToDelete, (success) => {
        if (success) {
          loadBooks();
        } else {
          alert("La suppression a échoué.");
        }
        setShowModal(false); // Ferme le modal après la suppression
      });
    }
  };

  // Annuler la suppression
  const cancelDelete = () => {
    setShowModal(false); // Ferme le modal sans supprimer
  };

  // Rendu d'un item (livre)
  const renderBookItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.image} />
          )}
          {item.price && <Text style={styles.price}>{item.price} €</Text>}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate("EditBook", { book: item })}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteBook(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddBook")}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBookItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No books available</Text>
          </View>
        }
      />

      {/* Modal pour confirmer la suppression */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmer la suppression</Text>
            <Text style={styles.modalText}>
              Êtes-vous sûr de vouloir supprimer ce livre ?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButton} onPress={cancelDelete}>
                <Text style={styles.modalButtonText}>Annuler</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={confirmDelete}>
                <Text style={styles.modalButtonText}>Supprimer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
    paddingTop: 80,
  },
  addButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#ff6600",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 1,
  },
  addButtonText: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff6600",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#f0f0f0",
  },
  deleteButton: {
    backgroundColor: "#fee",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  // Styles du Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#ff6600",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
