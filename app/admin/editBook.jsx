// admin/EditBook.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ConnectivityService from "../services/ConnectivityService";
import NetInfo from "@react-native-community/netinfo";

const EditBook = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookId } = route.params;
  const isMounted = useRef(true);

  // États pour le formulaire
  const [book, setBook] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [errors, setErrors] = useState({});

  // Effet de montage et nettoyage
  useEffect(() => {
    isMounted.current = true;

    // Charger les détails du livre et vérifier la connexion au montage
    loadBookDetails();
    checkConnection();

    // Ajouter un listener pour les changements de connexion
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (isMounted.current) {
        setIsOnline(state.isConnected && state.isInternetReachable);
      }
    });

    // Nettoyer au démontage
    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, [bookId]);

  // Charger les détails du livre
  const loadBookDetails = async () => {
    try {
      if (isMounted.current) setIsLoading(true);
      const bookData = await ConnectivityService.getBookById(bookId);

      if (bookData && isMounted.current) {
        setBook(bookData);
        setTitle(bookData.title || "");
        setDescription(bookData.description || "");
        setPrix(bookData.prix ? bookData.prix.toString() : "");
        setImage(bookData.image || null);
        setIsLoading(false);
      } else if (isMounted.current) {
        setIsLoading(false);
        Alert.alert("Erreur", "Livre non trouvé", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      console.error("Error loading book details:", err);
      if (isMounted.current) {
        setIsLoading(false);
        Alert.alert(
          "Erreur",
          "Une erreur est survenue lors du chargement du livre",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    }
  };

  // Vérifier la connexion
  const checkConnection = async () => {
    try {
      const isConnected = await ConnectivityService.checkConnection();
      if (isMounted.current) {
        setIsOnline(isConnected);
      }
    } catch (err) {
      console.error("Error checking connection:", err);
    }
  };

  // Sélectionner une image
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Nous avons besoin de votre permission pour accéder à votre galerie"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.8,
      });

      if (
        !result.canceled &&
        result.assets &&
        result.assets.length > 0 &&
        isMounted.current
      ) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking image:", err);
      if (isMounted.current) {
        Alert.alert(
          "Erreur",
          "Une erreur est survenue lors de la sélection de l'image"
        );
      }
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Le titre est requis";
    }

    if (!prix.trim()) {
      newErrors.prix = "Le prix est requis";
    } else if (isNaN(parseFloat(prix)) || parseFloat(prix) <= 0) {
      newErrors.prix = "Le prix doit être un nombre positif";
    }

    if (isMounted.current) {
      setErrors(newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!validateForm() || !book) return;

    const updatedBookData = {
      id: bookId,
      title,
      description,
      prix: parseFloat(prix),
      image: image || "https://via.placeholder.com/150",
    };

    try {
      if (isMounted.current) setIsSaving(true);
      await ConnectivityService.updateBook(updatedBookData);

      if (isMounted.current) {
        setIsSaving(false);
        Alert.alert("Succès", "Livre modifié avec succès", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      console.error("Error updating book:", err);
      if (isMounted.current) {
        setIsSaving(false);
        Alert.alert(
          "Erreur",
          "Une erreur est survenue lors de la modification du livre"
        );
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement du livre...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Indicateur de statut en ligne/hors ligne */}
        <View
          style={[
            styles.statusBar,
            isOnline ? styles.onlineStatus : styles.offlineStatus,
          ]}
        >
          <Text style={styles.statusText}>
            {isOnline
              ? "En ligne (JSON Server)"
              : "Hors ligne (SQLite) - Les modifications seront synchronisées plus tard"}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Modifier le livre</Text>

          {/* Sélection d'image */}
          <View style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={50} color="#ccc" />
              </View>
            )}
            <TouchableOpacity
              style={styles.pickImageButton}
              onPress={pickImage}
            >
              <Ionicons name="camera-outline" size={20} color="#fff" />
              <Text style={styles.pickImageButtonText}>
                {image ? "Changer l'image" : "Ajouter une image"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Champs du formulaire */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Titre <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={title}
              onChangeText={setTitle}
              placeholder="Titre du livre"
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description du livre"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Prix (€) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.prix && styles.inputError]}
              value={prix}
              onChangeText={setPrix}
              placeholder="Prix du livre"
              keyboardType="numeric"
            />
            {errors.prix && <Text style={styles.errorText}>{errors.prix}</Text>}
          </View>

          {/* Boutons d'action */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, isSaving && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Enregistrer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  scrollContent: {
    flexGrow: 1,
  },
  statusBar: {
    padding: 8,
    alignItems: "center",
  },
  onlineStatus: {
    backgroundColor: "#4CAF50",
  },
  offlineStatus: {
    backgroundColor: "#F44336",
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  formContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
    textAlign: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  previewImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholder: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  pickImageButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  pickImageButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    color: "#333",
  },
  required: {
    color: "#e74c3c",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    minHeight: 100,
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#95a5a6",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
    backgroundColor: "#3498db",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default EditBook;
