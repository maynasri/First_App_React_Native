// services/DatabaseService.js
import { Platform } from "react-native";

console.log("Utilisation d'une base de données simulée pour le développement");

// Base de données simulée en mémoire
const mockDb = {
  books: [],
};

// Simuler une base de données pour le développement
const db = {
  transaction: (callback) => {
    const tx = {
      executeSql: (query, params, successCallback, errorCallback) => {
        console.log("Simulation de query:", query, params);

        try {
          if (query.includes("CREATE TABLE")) {
            // Simulation de création de table
            console.log("Table 'books' simulée créée");
            successCallback(tx, {});
          } else if (
            query.includes("SELECT * FROM books") &&
            !query.includes("WHERE")
          ) {
            // Requête pour obtenir tous les livres
            successCallback(tx, { rows: { _array: mockDb.books } });
          } else if (query.includes("INSERT INTO books")) {
            // Requête d'insertion de livre
            const newId =
              mockDb.books.length > 0
                ? Math.max(...mockDb.books.map((b) => b.id)) + 1
                : 1;
            const newBook = {
              id: newId,
              title: params[0],
              description: params[1],
              prix: params[2],
              image: params[3],
            };
            mockDb.books.push(newBook);
            successCallback(tx, { insertId: newId });
          } else if (query.includes("UPDATE books")) {
            // Requête de mise à jour de livre
            const id = params[4];
            const index = mockDb.books.findIndex((b) => b.id === id);
            if (index !== -1) {
              mockDb.books[index] = {
                ...mockDb.books[index],
                title: params[0],
                description: params[1],
                prix: params[2],
                image: params[3],
              };
            }
            successCallback(tx, {});
          } else if (query.includes("DELETE FROM books")) {
            // Requête de suppression de livre
            const id = params[0];
            mockDb.books = mockDb.books.filter((b) => b.id !== id);
            successCallback(tx, {});
          } else if (query.includes("SELECT * FROM books WHERE id")) {
            // Requête pour obtenir un livre par ID
            const id = params[0];
            const book = mockDb.books.find((b) => b.id === parseInt(id));
            successCallback(tx, { rows: { _array: book ? [book] : [] } });
          } else {
            // Autres requêtes non gérées
            successCallback(tx, { rows: { _array: [] } });
          }
        } catch (error) {
          console.error("Erreur dans la simulation de base de données:", error);
          if (errorCallback) {
            errorCallback(tx, error);
          }
        }
      },
    };
    callback(tx);
  },
};

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS books (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          prix REAL NOT NULL,
          image TEXT
        )`,
        [],
        () => {
          console.log("Table 'books' créée ou déjà existante");
          resolve();
        },
        (_, error) => {
          console.error("Error creating table:", error);
          reject(error);
        }
      );
    });
  });
};

// Opérations CRUD pour les livres
export const getBooks = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM books",
        [],
        (_, { rows }) => {
          console.log("Livres récupérés:", rows._array);
          resolve(rows._array);
        },
        (_, error) => {
          console.error("Error fetching books:", error);
          reject(error);
        }
      );
    });
  });
};

export const addBook = (book) => {
  return new Promise((resolve, reject) => {
    const { title, description, prix, image } = book;

    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO books (title, description, prix, image) VALUES (?, ?, ?, ?)",
        [title, description, prix, image],
        (_, { insertId }) => {
          console.log("Livre ajouté avec l'ID:", insertId);
          resolve({ ...book, id: insertId });
        },
        (_, error) => {
          console.error("Error adding book:", error);
          reject(error);
        }
      );
    });
  });
};

export const updateBook = (book) => {
  return new Promise((resolve, reject) => {
    const { id, title, description, prix, image } = book;

    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE books SET title = ?, description = ?, prix = ?, image = ? WHERE id = ?",
        [title, description, prix, image, id],
        () => {
          console.log("Livre mis à jour, ID:", id);
          resolve(book);
        },
        (_, error) => {
          console.error("Error updating book:", error);
          reject(error);
        }
      );
    });
  });
};

export const deleteBook = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM books WHERE id = ?",
        [id],
        () => {
          console.log("Livre supprimé, ID:", id);
          resolve(id);
        },
        (_, error) => {
          console.error("Error deleting book:", error);
          reject(error);
        }
      );
    });
  });
};

export const getBookById = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM books WHERE id = ?",
        [id],
        (_, { rows }) => {
          if (rows._array.length > 0) {
            console.log("Livre trouvé:", rows._array[0]);
            resolve(rows._array[0]);
          } else {
            console.log("Aucun livre trouvé avec l'ID:", id);
            resolve(null);
          }
        },
        (_, error) => {
          console.error("Error fetching book by id:", error);
          reject(error);
        }
      );
    });
  });
};
