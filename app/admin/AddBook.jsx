import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// Ouvrir la base de données

export default function AddBook() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const navigation = useNavigation();

  /* const insertBook = (title, description, price) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "INSERT INTO books (title, description, price) VALUES (?, ?, ?);",
          [title, description, price],
          (_, result) => {
            console.log("Livre ajouté avec succès ! ID :", result.insertId);
            Alert.alert("Succès", "Livre ajouté avec succès !");
          },
          (_, error) => {
            console.log("Erreur lors de l'insertion :", error);
            Alert.alert("Erreur", "Erreur lors de l'insertion du livre");
          }
        );
      },
      (error) => {
        console.log("Erreur de transaction:", error);
        Alert.alert("Erreur", "Erreur de transaction");
      },
      () => console.log("Transaction réussie")
    );
  };
 */
  const handleSubmit = () => {
    console.log({ title, description, price });
    if (title && description && price) {
      /*       insertBook(title, description, price);
       */ navigation.goBack(); // Retourner à la page précédente après l'ajout
    } else {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un Livre</Text>

      <TextInput
        style={styles.input}
        placeholder="Titre du livre"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Prix"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
        <Text style={styles.addButtonText}>Ajouter</Text>
      </TouchableOpacity>

      {/* Bouton Retour */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Retour</Text>
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
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#888",
    borderRadius: 8,
    alignItems: "center",
  },
  backText: {
    color: "#fff",
    fontSize: 16,
  },
});
