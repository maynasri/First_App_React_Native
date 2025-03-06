import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { BookService } from "../db/api";

const AddBook = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation du formulaire
  const isFormValid = () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Le titre est obligatoire");
      return false;
    }

    if (!description.trim()) {
      Alert.alert("Erreur", "La description est obligatoire");
      return false;
    }

    if (!price.trim()) {
      Alert.alert("Erreur", "Le prix est obligatoire");
      return false;
    }

    const priceValue = parseFloat(price.replace(",", "."));
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert("Erreur", "Le prix doit être un nombre positif");
      return false;
    }

    return true;
  };

  // Sélectionner une image
  const pickImage = async () => {
    try {
      // Demander la permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission refusée",
          "Vous devez accorder la permission pour sélectionner une image"
        );
        return;
      }

      // Lancer le sélecteur d'image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'image");
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!isFormValid()) return;

    try {
      setLoading(true);

      // Création de l'objet livre
      const bookData = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price.replace(",", ".")),
        image: image || "https://via.placeholder.com/150x200?text=Livre",
      };

      // Ajout du livre via le service
      const result = await BookService.addBook(bookData);

      if (result.success) {
        Alert.alert("Succès", "Livre ajouté avec succès", [
          {
            text: "OK",
            onPress: () => {
              // Forcer la navigation vers l'écran précédent avec remplacement
              navigation.reset({
                index: 0,
                routes: [{ name: "BookListAdmin" }],
              });
            },
          },
        ]);
      } else {
        Alert.alert("Erreur", "Échec de l'ajout du livre");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du livre:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'ajout du livre");
    } finally {
      setLoading(false);
    }
  };

  // Annuler et revenir en arrière
  const handleCancel = () => {
    navigation.goBack();
  };

  // Rendu du formulaire
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ajouter un livre</Text>
        </View>

        {/* Image du livre */}
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.bookImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons
                name="add-photo-alternate"
                size={40}
                color="#999"
              />
              <Text style={styles.imagePlaceholderText}>Ajouter une image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Formulaire */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Titre du livre"
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description du livre"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix (€) *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="Ex: 12.99"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Ajouter</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  bookImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 10,
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: "#999",
    fontSize: 16,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textarea: {
    minHeight: 120,
    paddingTop: 12,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#3498db",
    marginLeft: 10,
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

export default AddBook;
