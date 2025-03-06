import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  // Credentials statiques pour l'exemple
  const adminCredentials = { email: "admin@books.com", password: "admin123" };
  const userCredentials = { email: "user@books.com", password: "user123" };

  const handleLogin = () => {
    // Validation simple
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    // Vérification des identifiants
    if (
      email === adminCredentials.email &&
      password === adminCredentials.password
    ) {
      // Redirection vers l'interface admin
      navigation.reset({
        index: 0,
        routes: [{ name: "BookListAdmin" }],
      });
    } else if (
      email === userCredentials.email &&
      password === userCredentials.password
    ) {
      // Redirection vers l'interface utilisateur
      navigation.reset({
        index: 0,
        routes: [{ name: "BookList" }],
      });
    } else {
      Alert.alert("Erreur", "Email ou mot de passe incorrect");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {/* Logo et titre */}
        <Animated.View
          style={styles.logoContainer}
          entering={FadeIn.duration(800).delay(200)}
        >
          <Image
            source={require("../../assets/splash.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Mon Univers de Livres</Text>
          <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
        </Animated.View>

        {/* Formulaire */}
        <Animated.View
          style={styles.formContainer}
          entering={FadeInDown.duration(800).delay(400)}
        >
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez votre email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez votre mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Bouton de connexion */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>

          {/* Information pour l'utilisateur test */}
          <View style={styles.testCredentials}>
            <Text style={styles.testCredentialsText}>
              Admin: admin@books.com / admin123
            </Text>
            <Text style={styles.testCredentialsText}>
              User: user@books.com / user123
            </Text>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  loginButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  testCredentials: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    alignItems: "center",
  },
  testCredentialsText: {
    fontSize: 14,
    color: "#777",
    marginBottom: 5,
  },
});

export default Login;
