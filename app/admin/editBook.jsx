// EditBook.jsx
import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { updateBook } from "../db/dbBooks";

export default function EditBook() {
  const navigation = useNavigation();
  const route = useRoute();
  const { book } = route.params; // Les données du livre à éditer

  const [title, setTitle] = useState(book.title);
  const [description, setDescription] = useState(book.description);
  const [image, setImage] = useState(book.image);
  const [price, setPrice] = useState(String(book.price)); // Assurez-vous que c'est une chaîne

  const handleUpdate = () => {
    if (title && description) {
      // Mise à jour du livre dans la base de données
      updateBook(book.id, title, description, image, price, (success) => {
        if (success) {
          alert("Livre mis à jour avec succès");
        } else {
          alert("Échec de la mise à jour du livre");
        }
      });
    } else {
      alert("Veuillez remplir tous les champs.");
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier le Livre</Text>

      <TextInput
        style={styles.input}
        placeholder="Titre"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="URL de l'image"
        value={image}
        onChangeText={setImage}
      />
      <TextInput
        style={styles.input}
        placeholder="Prix"
        value={price}
        keyboardType="numeric"
        onChangeText={setPrice}
      />

      <Button title="Mettre à jour" onPress={handleUpdate} />
      <Button title="Annuler" onPress={() => navigation.goBack()} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});
