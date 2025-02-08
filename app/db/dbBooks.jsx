import { enablePromise, openDatabase } from "react-native-sqlite-storage";

// Enable promise for SQLite
export const connectToDatabase = async () => {
  try {
    const db = await openDatabase(
      { name: "books.db", location: "default" },
      () => {
        console.log("Database opened successfully");
      },
      (error) => {
        console.error("Error opening database:", error);
        throw new Error("Could not connect to database");
      }
    );
    return db;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    Alert.alert("Database Error", "Could not connect to the database.");
  }
};

export const createBooksTable = async (db) => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      price REAL
    );
  `;

  try {
    await db.executeSql(createTableQuery);
    console.log("Table créée avec succès");
  } catch (error) {
    console.log("Erreur lors de la création de la table:", error);
    Alert.alert("Erreur", "Erreur lors de la création de la table");
  }
};
