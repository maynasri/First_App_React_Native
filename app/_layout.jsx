import React, { useState, useEffect, useRef } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import * as SplashScreen from "expo-splash-screen";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  useAnimatedStyle,
} from "react-native-reanimated";

// Importation des écrans
import BookList from "./book/index";
import BookDetails from "./book/details";
import CartScreen from "./book/cart";
import BookListAdmin from "./admin/BookListAdmin";
import AddBook from "./admin/AddBook";
import EditBook from "./admin/editBook";
import Login from "./components/login";

const { width, height } = Dimensions.get("window");

// Prévenez l'auto-masquage du splash screen
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

const Stack = createNativeStackNavigator();

// Composant Splash séparé pour éviter les problèmes d'état
const SplashComponent = ({ onFinish }) => {
  const isMounted = useRef(true);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const translateY = useSharedValue(height * 0.1);
  const textTranslateY = useSharedValue(height * 0.1);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Animation du logo
    scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    translateY.value = withSequence(
      withSpring(0, { damping: 15, stiffness: 100 }),
      withSpring(-20, { damping: 8, stiffness: 100 }),
      withSpring(0)
    );
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    // Animation du texte
    const timer1 = setTimeout(() => {
      if (isMounted.current) {
        textOpacity.value = withTiming(1, { duration: 800 });
        textTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });
      }
    }, 400);

    // Animation de sortie
    const timer2 = setTimeout(() => {
      if (isMounted.current) {
        opacity.value = withTiming(0, {
          duration: 500,
          easing: Easing.out(Easing.ease),
        });
        scale.value = withTiming(0.8, { duration: 500 });
        translateY.value = withTiming(-height * 0.2, { duration: 500 });
      }

      // Masquer le splash après un délai
      const timer3 = setTimeout(() => {
        if (isMounted.current) {
          SplashScreen.hideAsync().catch((err) => {
            console.log("Error hiding splash:", err);
          });
          onFinish();
        }
      }, 500);

      return () => clearTimeout(timer3);
    }, 3000);

    // Nettoyage lors du démontage
    return () => {
      isMounted.current = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/splash.png")}
        style={[styles.image, logoAnimatedStyle]}
        resizeMode="contain"
      />
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.title, textAnimatedStyle]}>
          Mon Univers de Livres
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, textAnimatedStyle]}>
          Vos livres, vos découvertes
        </Animated.Text>
      </View>
    </View>
  );
};

// Composant principal - UNIQUEMENT avec Provider Redux (sans NavigationContainer)
const RootLayout = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const handleSplashFinish = () => {
    setIsSplashVisible(false);
  };

  if (isSplashVisible) {
    return <SplashComponent onFinish={handleSplashFinish} />;
  }

  return (
    <Provider store={store}>
      <Stack.Navigator initialRouteName="Login">
        {/* Écran de login ajouté comme écran initial */}
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />

        {/* Écrans utilisateur */}
        <Stack.Screen
          name="BookList"
          component={BookList}
          options={{ title: "Accueil" }}
        />
        <Stack.Screen
          name="BookDetails"
          component={BookDetails}
          options={{ title: "Détails du Livre" }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: "Panier" }}
        />

        {/* Écrans administrateur */}
        <Stack.Screen
          name="BookListAdmin"
          component={BookListAdmin}
          options={{ title: "Admin Page" }}
        />
        <Stack.Screen
          name="AddBook"
          component={AddBook}
          options={{ title: "Ajouter un livre" }}
        />
        <Stack.Screen
          name="EditBook"
          component={EditBook}
          options={{ title: "Modifier un livre" }}
        />
      </Stack.Navigator>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  image: {
    width: width * 0.4,
    height: width * 0.4,
  },
  textContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginTop: 24,
    color: "#000000",
    letterSpacing: 1,
    textShadow: "0 1px 10px rgba(0, 0, 0, 0.1)",
  },
  subtitle: {
    fontSize: 18,
    color: "#555555",
    marginTop: 8,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});

export default RootLayout;
