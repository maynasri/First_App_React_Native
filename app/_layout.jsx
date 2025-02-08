import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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

const { width, height } = Dimensions.get("window");

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const translateY = useSharedValue(height * 0.1);
  const textTranslateY = useSharedValue(height * 0.1);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
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

    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 800 });
      textTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });
    }, 400);

    setTimeout(() => {
      opacity.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });
      scale.value = withTiming(0.8, { duration: 500 });
      translateY.value = withTiming(-height * 0.2, { duration: 500 });

      setTimeout(() => {
        SplashScreen.hideAsync();
        setIsSplashVisible(false);
      }, 500);
    }, 3000);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  if (isSplashVisible) {
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
  }

  return (
    <Stack.Navigator initialRouteName="BookListAdmin">
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
    </Stack.Navigator>
  );
}

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
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#555555",
    marginTop: 8,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});
