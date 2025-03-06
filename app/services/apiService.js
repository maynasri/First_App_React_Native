// services/ApiService.js
const API_URL = "http://192.168.15.189:3000"; // Modifiez selon votre configuration
// Si vous utilisez un appareil physique, remplacez par votre adresse IP:
// const API_URL = 'http://192.168.1.xxx:3000';

export const fetchBooks = async () => {
  try {
    console.log(`Requête GET vers ${API_URL}/books`);
    const response = await fetch(`${API_URL}/books`);

    if (!response.ok) {
      throw new Error(
        `Erreur réseau: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`${data.length} livres récupérés depuis l'API`);
    return data;
  } catch (error) {
    console.error("Error fetching books from API:", error);
    throw error;
  }
};

export const fetchBookById = async (id) => {
  try {
    console.log(`Requête GET vers ${API_URL}/books/${id}`);
    const response = await fetch(`${API_URL}/books/${id}`);

    if (!response.ok) {
      throw new Error(
        `Erreur réseau: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`Livre récupéré:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching book with id ${id} from API:`, error);
    throw error;
  }
};

export const createBook = async (book) => {
  try {
    console.log(`Requête POST vers ${API_URL}/books avec:`, book);
    const response = await fetch(`${API_URL}/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur réseau: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`Livre créé avec succès, ID:`, data.id);
    return data;
  } catch (error) {
    console.error("Error creating book on API:", error);
    throw error;
  }
};

export const updateBookApi = async (book) => {
  try {
    console.log(`Requête PUT vers ${API_URL}/books/${book.id} avec:`, book);
    const response = await fetch(`${API_URL}/books/${book.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur réseau: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`Livre mis à jour avec succès, ID:`, data.id);
    return data;
  } catch (error) {
    console.error(`Error updating book with id ${book.id} on API:`, error);
    throw error;
  }
};

export const deleteBookApi = async (id) => {
  try {
    console.log(`Requête DELETE vers ${API_URL}/books/${id}`);
    const response = await fetch(`${API_URL}/books/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(
        `Erreur réseau: ${response.status} ${response.statusText}`
      );
    }

    console.log(`Livre supprimé avec succès, ID: ${id}`);
    return id;
  } catch (error) {
    console.error(`Error deleting book with id ${id} from API:`, error);
    throw error;
  }
};
