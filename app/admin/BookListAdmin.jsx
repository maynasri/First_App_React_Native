import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { enablePromise, openDatabase } from "react-native-sqlite-storage";
import { connectToDatabase, createBooksTable } from "../db/dbBooks";
import { useCallback } from "react";

export default function BookListAdmin() {
  const loadData = useCallback(async () => {
    try {
      const db = await connectToDatabase(); // Connexion à la base de données
      await createBooksTable(db); // Création de la table 'books'
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadData(); // Appelle loadData lors du montage du composant
  }, [loadData]);

  const [books, setBooks] = useState([]);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddBook")}
      >
        <Text style={styles.cartText}>+</Text>
      </TouchableOpacity>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("BookDetails", { book: item })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>{item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  addButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#ff6600",
    padding: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  cartText: {
    fontSize: 18,
    color: "#fff",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    fontSize: 14,
    color: "#ff6600",
    marginTop: 4,
  },
});
