import { Platform } from "react-native";

// Importation directe de SQLite
const SQLite = require("expo-sqlite");

// Fonction pour ouvrir la base de données
const openDatabase = () => {
  if (Platform.OS === "web") {
    return webFallback();
  } else {
    try {
      // Utilisation directe de SQLite.openDatabase sans vérification
      return SQLite.openDatabase("BooksDB.db");
    } catch (error) {
      console.error(
        "Erreur critique lors de l'ouverture de la base de données:",
        error
      );
      alert(
        "Erreur lors de l'accès à la base de données. Veuillez redémarrer l'application."
      );
      // Retourner un objet factice pour éviter les crashs
      return {
        transaction: () => {
          console.error("Transaction appelée sur une base de données factice");
        },
      };
    }
  }
};

// Simulation pour le web
const webFallback = () => {
  console.log("Utilisation de la simulation web");
  const storage = {};

  return {
    transaction: (callback) => {
      callback({
        executeSql: (sql, params, successCallback, errorCallback) => {
          try {
            if (sql.startsWith("CREATE TABLE")) {
              storage.books = storage.books || [];
              console.log("Table created (simulated)");
              successCallback();
            } else if (sql.startsWith("INSERT INTO")) {
              storage.books = storage.books || [];
              const newId =
                storage.books.length > 0
                  ? Math.max(...storage.books.map((b) => b.id)) + 1
                  : 1;

              const newData = {
                id: newId,
                title: params[0],
                description: params[1],
                image: params[2],
                price: params[3],
              };

              storage.books.push(newData);
              console.log("Data inserted (simulated):", newData);
              successCallback(null, { rowsAffected: 1, insertId: newId });
            } else if (sql.startsWith("SELECT")) {
              storage.books = storage.books || [];
              console.log("Data fetched (simulated):", storage.books);
              successCallback(null, {
                rows: {
                  length: storage.books.length,
                  item: (i) => storage.books[i],
                },
              });
            } else if (sql.startsWith("DELETE")) {
              storage.books = storage.books || [];
              const id = Number(params[0]);
              storage.books = storage.books.filter((item) => item.id !== id);
              console.log("Data deleted (simulated)");
              successCallback(null, { rowsAffected: 1 });
            } else if (sql.startsWith("UPDATE")) {
              storage.books = storage.books || [];
              const id = Number(params[4]);
              storage.books = storage.books.map((item) =>
                item.id === id
                  ? {
                      id,
                      title: params[0],
                      description: params[1],
                      image: params[2],
                      price: params[3],
                    }
                  : item
              );
              console.log("Data updated (simulated)");
              successCallback(null, { rowsAffected: 1 });
            } else {
              throw new Error("Unknown SQL command");
            }
          } catch (error) {
            console.error("SQL Error (simulated):", error);
            errorCallback(null, error);
          }
        },
      });
    },
  };
};

// Initialiser la base de données
const db = openDatabase();

// ------------------------------
// Fonctions CRUD exportées
// ------------------------------

// Créer la table Books avec la colonne price
export const createTable = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        image TEXT,
        price REAL
      )`,
      [],
      () => console.log("Table created successfully with price column"),
      (tx, error) => console.log("Error creating table:", error.message)
    );
  });
};

// Récupérer tous les livres
export const getBooks = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM Books",
      [],
      (tx, results) => {
        let books = [];
        for (let i = 0; i < results.rows.length; i++) {
          books.push(results.rows.item(i));
        }
        console.log("Books fetched:", books);
        callback(books);
      },
      (tx, error) => {
        console.log("Error getting books:", error.message);
        callback([]);
      }
    );
  });
};

// Ajouter un livre avec un prix
export const addBook = (title, description, image, price, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO Books (title, description, image, price) VALUES (?, ?, ?, ?)",
      [title, description, image, price],
      (_, result) => {
        console.log("Insertion réussie, ID:", result.insertId);
        callback(true, result.insertId);
      },
      (_, error) => {
        console.error("Erreur lors de l'insertion:", error);
        callback(false, null);
      }
    );
  });
};

// Supprimer un livre
export const deleteBook = (id, callback) => {
  const idToDelete = Number(id);
  console.log("Attempting to delete book with ID:", idToDelete);
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM Books WHERE id = ?",
      [idToDelete],
      (tx, results) => {
        console.log("Delete results:", results);
        callback(results.rowsAffected > 0);
      },
      (tx, error) => {
        console.log("Error deleting book:", error.message);
        callback(false);
      }
    );
  });
};

// Mettre à jour un livre
export const updateBook = (id, title, description, image, price, callback) => {
  console.log(
    "Appel de updateBook avec les paramètres:",
    id,
    title,
    description,
    image,
    price
  );

  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE Books SET title = ?, description = ?, image = ?, price = ? WHERE id = ?",
      [title, description, image, price, id],
      (tx, results) => {
        console.log("Résultats de la mise à jour:", results);
        if (results.rowsAffected > 0) {
          console.log("Livre mis à jour avec succès");
          callback(true);
        } else {
          console.log("Aucune ligne mise à jour. Vérifiez l'ID.");
          callback(false);
        }
      },
      (tx, error) => {
        console.error("Erreur lors de l'update:", error.message);
        callback(false);
      }
    );
  });
};
