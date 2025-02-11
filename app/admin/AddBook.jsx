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
import { addBook } from "../db/dbBooks";

export default function AddBook({ route }) {
  const navigation = useNavigation();
  const { refreshBooks } = route.params;  // Get the refreshBooks function from the navigation params
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");

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

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("Prix invalide", "Veuillez entrer un prix valide");
      return;
    }

    addBook(title, description, image, parsedPrice, (success) => {
      if (success) {
        Alert.alert("Succès", "Livre ajouté avec succès", [
          {
            text: "OK",
            onPress: () => {
              refreshBooks(); // Refresh the list of books
              navigation.goBack(); // Go back to the previous screen
            },
          },
        ]);
      } else {
        Alert.alert("Erreur", "L'ajout du livre a échoué");
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ajouter un Livre</Text>

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

      <Text style={styles.label}>Prix (€)</Text>
      <TextInput
        style={styles.input}
        placeholder="Entrez le prix du livre"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
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
    padding: 20,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 16,
    fontSize: 16,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: "top", // Pour Android, afin que le texte commence en haut
  },
  button: {
    backgroundColor: "#ff6600",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
