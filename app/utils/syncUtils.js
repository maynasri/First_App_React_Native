import { Alert } from "react-native";
import { fetchBooks } from "../services/apiService";
import {
  getBooks,
  insertBook,
  updateBook,
  getUnsyncedBooks,
  markBookAsSynced,
} from "../database/dbService";
import { syncBooksToServer } from "../services/apiService";
import { checkNetworkConnection } from "../services/apiService";

// Synchroniser les données du serveur vers SQLite (téléchargement)
export const syncFromServer = async () => {
  try {
    const isConnected = await checkNetworkConnection();

    if (!isConnected) {
      console.log("Pas de connexion internet, utilisation des données locales");
      return { success: false, message: "Pas de connexion internet" };
    }

    // Récupérer les livres du serveur
    const serverBooks = await fetchBooks();

    // Récupérer les livres locaux pour comparaison
    const localBooks = await getBooks();

    // Convertir les tableaux en maps pour faciliter la recherche
    const localBooksMap = localBooks.reduce((map, book) => {
      map[book.id] = book;
      return map;
    }, {});

    let updatedCount = 0;
    let addedCount = 0;

    // Mettre à jour ou ajouter des livres localement
    for (const serverBook of serverBooks) {
      const localBook = localBooksMap[serverBook.id];

      if (localBook) {
        // Le livre existe localement, vérifier s'il faut le mettre à jour
        // Note: Ici, nous pouvons ajouter une logique plus complexe (timestamp, version, etc.)
        // Pour l'instant, nous faisons simplement une mise à jour
        await updateBook({ ...serverBook, sync: 1 });
        updatedCount++;
      } else {
        // Le livre n'existe pas localement, l'ajouter
        await insertBook({ ...serverBook, sync: 1 });
        addedCount++;
      }
    }

    return {
      success: true,
      message: `Synchronisation réussie: ${addedCount} ajoutés, ${updatedCount} mis à jour`,
      updated: updatedCount,
      added: addedCount,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la synchronisation depuis le serveur:",
      error
    );
    return {
      success: false,
      message: `Erreur lors de la synchronisation: ${error.message}`,
    };
  }
};

// Synchroniser les données de SQLite vers le serveur (upload)
export const syncToServer = async () => {
  try {
    const isConnected = await checkNetworkConnection();

    if (!isConnected) {
      console.log(
        "Pas de connexion internet, impossible de synchroniser vers le serveur"
      );
      return { success: false, message: "Pas de connexion internet" };
    }

    // Obtenir les livres non synchronisés
    const unsyncedBooks = await getUnsyncedBooks();

    if (unsyncedBooks.length === 0) {
      return {
        success: true,
        message: "Aucune donnée à synchroniser",
        synced: 0,
      };
    }

    // Envoyer les livres non synchronisés au serveur
    const syncedBooks = await syncBooksToServer(unsyncedBooks);

    // Marquer les livres comme synchronisés dans la base de données locale
    for (const book of syncedBooks) {
      await markBookAsSynced(book.id);
    }

    return {
      success: true,
      message: `${syncedBooks.length} livres synchronisés avec succès`,
      synced: syncedBooks.length,
    };
  } catch (error) {
    console.error("Erreur lors de la synchronisation vers le serveur:", error);
    return {
      success: false,
      message: `Erreur lors de la synchronisation: ${error.message}`,
    };
  }
};

// Fonction pour effectuer une synchronisation bidirectionnelle
export const performFullSync = async () => {
  try {
    const isConnected = await checkNetworkConnection();

    if (!isConnected) {
      Alert.alert(
        "Mode Hors Ligne",
        "Vous êtes en mode hors ligne. Les modifications seront synchronisées quand une connexion sera disponible."
      );
      return { success: false, offline: true };
    }

    // D'abord, synchroniser les modifications locales vers le serveur
    const uploadResult = await syncToServer();

    // Ensuite, récupérer les dernières données du serveur
    const downloadResult = await syncFromServer();

    if (uploadResult.success && downloadResult.success) {
      return {
        success: true,
        uploadResult,
        downloadResult,
      };
    } else {
      return {
        success: false,
        uploadResult,
        downloadResult,
      };
    }
  } catch (error) {
    console.error("Erreur lors de la synchronisation complète:", error);
    return { success: false, error: error.message };
  }
};
