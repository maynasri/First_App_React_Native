import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const cardWidth = width / 2 - 24; // 2 cartes par ligne avec marge

const BookCard = ({ book, onPress, isAdmin = false, onEdit, onDelete }) => {
  // Utilisation d'une URL de placeholder si l'image est indisponible
  const imageSource = book.image
    ? { uri: book.image }
    : require("../../assets/splash.png");

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(book)}
      activeOpacity={0.7}
    >
      <Image source={imageSource} style={styles.image} resizeMode="cover" />

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>

        <Text style={styles.price}>
          {book.prix
            ? `${parseFloat(book.prix).toFixed(2)} €`
            : "Prix non disponible"}
        </Text>
      </View>

      {isAdmin && (
        <View style={styles.adminControls}>
          <TouchableOpacity
            style={[styles.iconButton, styles.editButton]}
            onPress={() => onEdit && onEdit(book)}
          >
            <MaterialIcons name="edit" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.deleteButton]}
            onPress={() => onDelete && onDelete(book.id)}
          >
            <MaterialIcons name="delete" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 150,
    backgroundColor: "#f0f0f0",
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#e91e63",
  },
  adminControls: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  editButton: {
    backgroundColor: "rgba(33, 150, 243, 0.9)",
  },
  deleteButton: {
    backgroundColor: "rgba(244, 67, 54, 0.9)",
  },
});

export default BookCard;
