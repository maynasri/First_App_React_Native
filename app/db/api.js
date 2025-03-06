// api.js (version modifiée)
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { getBooks, addBook, updateBook, deleteBook } from "./dbBooks";

// Adresse du serveur JSON
// Utilisez votre adresse IP locale pour les tests sur appareil physique
// Pour les émulateurs: Android - 10.0.2.2, iOS - localhost
const API_URL = Platform.select({
  ios: "http://localhost:3000",
  android: "http://10.0.2.2:3000",
});

// URL de vérification de JSON Server
const JSON_SERVER_URL = `${API_URL}/books`;

// Vérification personnalisée de la connexion à JSON Server
export const isConnected = async () => {
  try {
    // D'abord, vérifions si le réseau est disponible
    const netInfo = await NetInfo.fetch();

    if (!netInfo.isConnected) {
      console.log("Réseau non disponible");
      return false;
    }

    // Ensuite, vérifions si notre JSON Server est accessible
    // en utilisant un timeout court pour éviter de bloquer trop longtemps
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(JSON_SERVER_URL, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log("JSON Server accessible");
      return true;
    } else {
      console.log("JSON Server non accessible, statut:", response.status);
      return false;
    }
  } catch (error) {
    console.log(
      "Erreur lors de la vérification de connectivité:",
      error.message
    );
    return false;
  }
};

// Service de livres avec mode online/offline
export const BookService = {
  // Récupérer tous les livres
  getBooks: async () => {
    try {
      const online = await isConnected();

      if (online) {
        console.log("Mode online: Récupération des livres depuis JSON Server");
        const response = await fetch(`${API_URL}/books`);

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const books = await response.json();
        return books;
      } else {
        console.log("Mode offline: Récupération des livres depuis SQLite");
        return new Promise((resolve) => {
          getBooks((books) => {
            resolve(books);
          });
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des livres:", error);
      // Fallback sur SQLite en cas d'erreur
      console.log("Fallback sur SQLite");
      return new Promise((resolve) => {
        getBooks((books) => {
          resolve(books);
        });
      });
    }
  },

  // Ajouter un livre
  addBook: async (bookData) => {
    try {
      const online = await isConnected();

      if (online) {
        console.log("Mode online: Ajout d'un livre via JSON Server");
        const response = await fetch(`${API_URL}/books`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookData),
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        return { success: true, id: result.id };
      } else {
        console.log("Mode offline: Ajout d'un livre via SQLite");
        return new Promise((resolve) => {
          addBook(
            bookData.title,
            bookData.description,
            bookData.image,
            bookData.price,
            (success, id) => {
              resolve({ success, id });
            }
          );
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du livre:", error);
      // Fallback sur SQLite
      return new Promise((resolve) => {
        addBook(
          bookData.title,
          bookData.description,
          bookData.image,
          bookData.price,
          (success, id) => {
            resolve({ success, id });
          }
        );
      });
    }
  },

  // Mettre à jour un livre
  updateBook: async (id, bookData) => {
    try {
      const online = await isConnected();

      if (online) {
        console.log(`Mode online: Mise à jour du livre ${id} via JSON Server`);
        const response = await fetch(`${API_URL}/books/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookData),
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        return { success: true };
      } else {
        console.log(`Mode offline: Mise à jour du livre ${id} via SQLite`);
        return new Promise((resolve) => {
          updateBook(
            id,
            bookData.title,
            bookData.description,
            bookData.image,
            bookData.price,
            (success) => {
              resolve({ success });
            }
          );
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du livre:", error);
      // Fallback sur SQLite
      return new Promise((resolve) => {
        updateBook(
          id,
          bookData.title,
          bookData.description,
          bookData.image,
          bookData.price,
          (success) => {
            resolve({ success });
          }
        );
      });
    }
  },

  // Supprimer un livre
  deleteBook: async (id) => {
    try {
      const online = await isConnected();

      if (online) {
        console.log(`Mode online: Suppression du livre ${id} via JSON Server`);
        const response = await fetch(`${API_URL}/books/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        return { success: true };
      } else {
        console.log(`Mode offline: Suppression du livre ${id} via SQLite`);
        return new Promise((resolve) => {
          deleteBook(id, (success) => {
            resolve({ success });
          });
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du livre:", error);
      // Fallback sur SQLite
      return new Promise((resolve) => {
        deleteBook(id, (success) => {
          resolve({ success });
        });
      });
    }
  },

  // Récupérer un livre spécifique
  getBookById: async (id) => {
    try {
      const online = await isConnected();

      if (online) {
        console.log(
          `Mode online: Récupération du livre ${id} depuis JSON Server`
        );
        const response = await fetch(`${API_URL}/books/${id}`);

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const book = await response.json();
        return book;
      } else {
        console.log(`Mode offline: Récupération du livre ${id} depuis SQLite`);
        // Nous allons récupérer tous les livres et filtrer par ID
        // car dbBooks.js n'a pas de fonction getBookById
        return new Promise((resolve) => {
          getBooks((books) => {
            const book = books.find((b) => b.id === Number(id));
            resolve(book || null);
          });
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du livre:", error);
      // Fallback sur SQLite
      return new Promise((resolve) => {
        getBooks((books) => {
          const book = books.find((b) => b.id === Number(id));
          resolve(book || null);
        });
      });
    }
  },
};
