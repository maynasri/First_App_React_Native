// app/AddBook.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { addBook } from "../db/dbBooks"; // Assurez-vous que le chemin est correct

export default function AddBook() {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(""); // Nouveau champ pour le prix

  // Fonction pour gérer l'ajout d'un livre
  const handleAddBook = () => {
    if (
      title.trim() === "" ||
      description.trim() === "" ||
      price.trim() === ""
    ) {
      Alert.alert(
        "Champs manquants",
        "Veuillez remplir tous les champs requis"
      );
      return;
    }

    // Convertir le prix en nombre
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("Prix invalide", "Veuillez entrer un prix valide");
      return;
    }

    // Appel à la fonction addBook du module de base de données
    addBook(title, description, image, parsedPrice, (success, insertId) => {
      if (success) {
        Alert.alert("Succès", "Livre ajouté avec succès", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("Erreur", "L'ajout du livre a échoué");
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Titre</Text>
      <TextInput
        style={styles.input}
        placeholder="Entrez le titre du livre"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Entrez la description du livre"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>URL de l'image</Text>
      <TextInput
        style={styles.input}
        placeholder="Entrez l'URL de l'image du livre"
        value={image}
        onChangeText={setImage}
      />

      <Text style={styles.label}>Prix</Text>
      <TextInput
        style={styles.input}
        placeholder="Entrez le prix du livre"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric" // Pour s'assurer que l'utilisateur entre un nombre
      />

      <TouchableOpacity style={styles.button} onPress={handleAddBook}>
        <Text style={styles.buttonText}>Ajouter le livre</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top", // Pour Android, afin que le texte commence en haut
  },
  button: {
    backgroundColor: "#ff6600",
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
