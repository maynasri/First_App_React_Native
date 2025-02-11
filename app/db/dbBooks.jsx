// dbBooks.js
import { Platform } from "react-native";
import localforage from "localforage";

let SQLite;
if (Platform.OS !== "web") {
  SQLite = require("expo-sqlite");
}

// Fonction pour ouvrir la base de données
const openDatabase = Platform.select({
  web: () => ({
    transaction: (callback) => {
      // Pour le web, on simule une transaction SQL
      callback({
        executeSql: async (sql, params, successCallback, errorCallback) => {
          try {
            if (sql.startsWith("CREATE TABLE")) {
              console.log("Table created (simulated)");
              successCallback();
            } else if (sql.startsWith("INSERT INTO")) {
              const tableName = sql.match(/INSERT INTO (\w+)/)[1];
              let existingData = (await localforage.getItem(tableName)) || [];
              if (!Array.isArray(existingData)) existingData = [];

              const newData = {
                id: existingData.length + 1,
                title: params[0],
                description: params[1],
                image: params[2],
                price: params[3],
              };

              existingData.push(newData);
              await localforage.setItem(tableName, existingData);
              console.log("Data inserted (simulated):", newData);
              successCallback(null, { rowsAffected: 1, insertId: newData.id });
            } else if (sql.startsWith("SELECT")) {
              const tableName = sql.match(/FROM (\w+)/)[1];
              let data = (await localforage.getItem(tableName)) || [];
              // Si la requête contient un filtre sur l'ID, on le prend en compte
              if (sql.includes("WHERE id = ?")) {
                const idToFilter = params[0];
                data = data.filter((item) => item.id === idToFilter);
              }
              console.log("Data fetched (simulated):", data);
              successCallback(null, {
                rows: {
                  length: data.length,
                  item: (i) => data[i],
                },
              });
            } else if (sql.startsWith("DELETE")) {
              const tableName = sql.match(/FROM (\w+)/)[1];
              const id = params[0];
              let existingData = (await localforage.getItem(tableName)) || [];
              existingData = existingData.filter((item) => item.id !== id);
              await localforage.setItem(tableName, existingData);
              console.log("Data deleted (simulated)");
              successCallback(null, { rowsAffected: 1 });
            } else if (sql.startsWith("UPDATE")) {
              // CORRECTION : l'ID se trouve à l'index 4
              const tableName = sql.match(/UPDATE (\w+)/)[1];
              const id = params[4];
              let existingData = (await localforage.getItem(tableName)) || [];
              existingData = existingData.map((item) =>
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
              await localforage.setItem(tableName, existingData);
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
  }),
  default: () => SQLite.openDatabase("BooksDB.db"),
})();

// ------------------------------
// Fonctions CRUD exportées
// ------------------------------

// Créer la table Books avec la colonne price
export const createTable = () => {
  openDatabase.transaction((tx) => {
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
  openDatabase.transaction((tx) => {
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
  openDatabase.transaction((tx) => {
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
  openDatabase.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM Books WHERE id = ?",
      [idToDelete],
      (tx, results) => {
        console.log("Delete results:", results);
        callback(results.rowsAffected > 0);
      },
      (tx, error) => {
        console.log("Error deleting book:", error.message);
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

  openDatabase.transaction((tx) => {
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
