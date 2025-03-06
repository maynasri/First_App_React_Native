// services/ConnectivityService.js
import NetInfo from "@react-native-community/netinfo";
import * as DbService from "./DatabaseService";
import * as ApiService from "./apiService";

// Vérifier l'état de la connexion (toujours retourne true pour le débogage)
export const checkConnection = async () => {
  try {
    const netInfo = await NetInfo.fetch();
    console.log("État de la connexion:", netInfo.isConnected);

    // Pour déboguer sans SQLite, on considère toujours qu'on est en ligne
    // Commentez la ligne suivante et décommentez celle d'après pour revenir au comportement normal
    return true;
    // return netInfo.isConnected && netInfo.isInternetReachable;
  } catch (error) {
    console.error("Erreur de vérification de la connexion:", error);
    // En cas d'erreur, on suppose être en ligne pour utiliser uniquement le JSON Server
    return true;
  }
};

// Récupérer les livres en fonction de la connexion
export const getBooks = async () => {
  try {
    const isConnected = await checkConnection();
    console.log("Est connecté:", isConnected);

    if (isConnected) {
      // Mode en ligne: Utiliser JSON Server
      console.log("Utilisation du JSON Server");
      const booksFromApi = await ApiService.fetchBooks();
      // Dans le mode de débogage, on ne synchronise pas avec SQLite
      // await syncBooksToLocal(booksFromApi);
      return booksFromApi;
    } else {
      // Mode hors ligne: Utiliser SQLite
      console.log("Utilisation de SQLite (mode hors ligne)");
      return await DbService.getBooks();
    }
  } catch (error) {
    console.error("Erreur dans getBooks:", error);
    // En cas d'erreur, essayer de récupérer depuis SQLite
    try {
      return await DbService.getBooks();
    } catch (sqliteError) {
      console.error("Erreur SQLite dans getBooks:", sqliteError);
      // Si tout échoue, retourner un tableau vide
      return [];
    }
  }
};

// Obtenir un livre par ID
export const getBookById = async (id) => {
  try {
    const isConnected = await checkConnection();

    if (isConnected) {
      // Mode en ligne: Utiliser JSON Server
      console.log(`Récupération du livre ID ${id} depuis le JSON Server`);
      return await ApiService.fetchBookById(id);
    } else {
      // Mode hors ligne: Utiliser SQLite
      console.log(`Récupération du livre ID ${id} depuis SQLite`);
      return await DbService.getBookById(id);
    }
  } catch (error) {
    console.error(`Erreur dans getBookById pour id ${id}:`, error);
    // En cas d'erreur, essayer de récupérer depuis SQLite
    try {
      return await DbService.getBookById(id);
    } catch (sqliteError) {
      console.error(
        `Erreur SQLite dans getBookById pour id ${id}:`,
        sqliteError
      );
      // Si tout échoue, retourner null
      return null;
    }
  }
};

// Ajouter un livre
export const addBook = async (book) => {
  try {
    const isConnected = await checkConnection();

    if (isConnected) {
      // Mode en ligne: Ajouter sur le JSON Server
      console.log("Ajout du livre sur le JSON Server:", book);
      const addedBook = await ApiService.createBook(book);

      // Dans le mode de débogage, on ne sauvegarde pas dans SQLite
      // await DbService.addBook(addedBook);

      return addedBook;
    } else {
      // Mode hors ligne: Sauvegarder dans SQLite uniquement
      console.log("Ajout du livre dans SQLite (mode hors ligne):", book);
      return await DbService.addBook(book);
    }
  } catch (error) {
    console.error("Erreur dans addBook:", error);
    throw error;
  }
};

// Mettre à jour un livre
export const updateBook = async (book) => {
  try {
    const isConnected = await checkConnection();

    if (isConnected) {
      // Mode en ligne: Mettre à jour sur le JSON Server
      console.log("Mise à jour du livre sur le JSON Server:", book);
      const updatedBook = await ApiService.updateBookApi(book);

      // Dans le mode de débogage, on ne met pas à jour dans SQLite
      // await DbService.updateBook(updatedBook);

      return updatedBook;
    } else {
      // Mode hors ligne: Mettre à jour dans SQLite uniquement
      console.log("Mise à jour du livre dans SQLite (mode hors ligne):", book);
      return await DbService.updateBook(book);
    }
  } catch (error) {
    console.error(`Erreur dans updateBook pour id ${book.id}:`, error);
    throw error;
  }
};

// Supprimer un livre
export const deleteBook = async (id) => {
  try {
    const isConnected = await checkConnection();

    if (isConnected) {
      // Mode en ligne: Supprimer sur le JSON Server
      console.log(`Suppression du livre ID ${id} sur le JSON Server`);
      await ApiService.deleteBookApi(id);

      // Dans le mode de débogage, on ne supprime pas dans SQLite
      // await DbService.deleteBook(id);

      return id;
    } else {
      // Mode hors ligne: Supprimer dans SQLite uniquement
      console.log(
        `Suppression du livre ID ${id} dans SQLite (mode hors ligne)`
      );
      return await DbService.deleteBook(id);
    }
  } catch (error) {
    console.error(`Erreur dans deleteBook pour id ${id}:`, error);
    throw error;
  }
};

// Synchroniser les modifications locales vers le serveur
export const syncLocalChangesToServer = async () => {
  try {
    const isConnected = await checkConnection();

    if (!isConnected) {
      console.log("Impossible de synchroniser - mode hors ligne");
      return false;
    }

    console.log("Début de la synchronisation avec le serveur");

    // Dans le mode de débogage, on simule une synchronisation réussie
    // Cette fonction serait plus complexe en production
    return true;

    /* Le code complet de synchronisation serait :
    // Récupérer les livres locaux et distants
    const localBooks = await DbService.getBooks();
    const apiBooks = await ApiService.fetchBooks();
    
    // Créer un map des livres de l'API pour une recherche rapide
    const apiBooksMap = new Map(apiBooks.map(book => [book.id, book]));
    
    // Synchroniser chaque livre local
    for (const localBook of localBooks) {
      if (!apiBooksMap.has(localBook.id)) {
        // Le livre n'existe pas sur le serveur, le créer
        await ApiService.createBook(localBook);
      } else {
        // Le livre existe, vérifier s'il y a des différences et mettre à jour si nécessaire
        const apiBook = apiBooksMap.get(localBook.id);
        if (JSON.stringify(localBook) !== JSON.stringify(apiBook)) {
          await ApiService.updateBookApi(localBook);
        }
      }
    }
    
    // Vérifier les suppressions
    for (const apiBook of apiBooks) {
      if (!localBooks.some(localBook => localBook.id === apiBook.id)) {
        // Le livre existe sur le serveur mais pas localement, il a été supprimé
        await ApiService.deleteBookApi(apiBook.id);
      }
    }
    
    return true;
    */
  } catch (error) {
    console.error("Erreur dans syncLocalChangesToServer:", error);
    return false;
  }
};

// Fonction de synchronisation locale (désactivée en mode débogage)
const syncBooksToLocal = async (booksFromApi) => {
  try {
    console.log(
      "Synchronisation des livres vers la base locale (désactivée en débogage)"
    );
    /* 
    // Récupérer tous les livres locaux
    const localBooks = await DbService.getBooks();
    const localBooksMap = new Map(localBooks.map(book => [book.id, book]));
    
    // Mettre à jour ou ajouter les livres du serveur
    for (const apiBook of booksFromApi) {
      if (localBooksMap.has(apiBook.id)) {
        // Mettre à jour si déjà présent localement
        await DbService.updateBook(apiBook);
      } else {
        // Ajouter si nouveau
        await DbService.addBook(apiBook);
      }
    }
    */
  } catch (error) {
    console.error("Erreur dans syncBooksToLocal:", error);
  }
};
