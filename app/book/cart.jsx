import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} from "../redux/slice/cartSlice";

const CartScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items: cartItems, total } = useSelector((state) => state.cart);
  const [isProcessing, setIsProcessing] = useState(false);

  // Supprimer un livre du panier
  const handleRemoveItem = (id) => {
    Alert.alert("Confirmation", "Voulez-vous retirer ce livre du panier ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Retirer",
        style: "destructive",
        onPress: () => dispatch(removeFromCart(id)),
      },
    ]);
  };

  // Incrémenter la quantité d'un livre
  const handleIncrement = (id) => {
    dispatch(incrementQuantity(id));
  };

  // Décrémenter la quantité d'un livre
  const handleDecrement = (id) => {
    dispatch(decrementQuantity(id));
  };

  // Vider le panier
  const handleClearCart = () => {
    if (cartItems.length === 0) return;

    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir vider votre panier ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Vider",
          style: "destructive",
          onPress: () => dispatch(clearCart()),
        },
      ]
    );
  };

  // Processus de commande
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Erreur", "Votre panier est vide");
      return;
    }

    setIsProcessing(true);

    // Simuler un traitement de commande
    setTimeout(() => {
      setIsProcessing(false);

      Alert.alert(
        "Commande effectuée",
        "Votre commande a été traitée avec succès !",
        [
          {
            text: "OK",
            onPress: () => {
              dispatch(clearCart());
              navigation.navigate("BookList");
            },
          },
        ]
      );
    }, 1500);
  };

  // Rendu d'un élément du panier
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/100" }}
        style={styles.itemImage}
      />

      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>{item.prix?.toFixed(2)} €</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              item.quantity <= 1 && styles.disabledButton,
            ]}
            onPress={() => handleDecrement(item.id)}
            disabled={item.quantity <= 1}
          >
            <Ionicons
              name="remove"
              size={16}
              color={item.quantity <= 1 ? "#ccc" : "#fff"}
            />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleIncrement(item.id)}
          >
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.itemTotalContainer}>
        <Text style={styles.itemTotalLabel}>Total</Text>
        <Text style={styles.itemTotal}>
          {(item.prix * item.quantity).toFixed(2)} €
        </Text>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* En-tête du panier */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Mon Panier</Text>
        <TouchableOpacity
          onPress={handleClearCart}
          disabled={cartItems.length === 0}
        >
          <Text
            style={[
              styles.clearCartText,
              cartItems.length === 0 && styles.disabledText,
            ]}
          >
            Vider le panier
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des articles */}
      {cartItems.length > 0 ? (
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.cartList}
        />
      ) : (
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyCartText}>Votre panier est vide</Text>
          <TouchableOpacity
            style={styles.continueShopping}
            onPress={() => navigation.navigate("BookList")}
          >
            <Text style={styles.continueShoppingText}>
              Continuer les achats
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Résumé et bouton de commande */}
      {cartItems.length > 0 && (
        <View style={styles.checkoutContainer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>{total.toFixed(2)} €</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.checkoutButton,
              isProcessing && styles.processingButton,
            ]}
            onPress={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Text style={styles.checkoutButtonText}>Traitement...</Text>
            ) : (
              <>
                <Ionicons
                  name="cart-outline"
                  size={20}
                  color="#fff"
                  style={styles.checkoutIcon}
                />
                <Text style={styles.checkoutButtonText}>Commander</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  clearCartText: {
    color: "#e74c3c",
    fontWeight: "500",
  },
  disabledText: {
    color: "#ccc",
  },
  cartList: {
    padding: 12,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 100,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    overflow: "hidden",
  },
  quantityButton: {
    backgroundColor: "#3498db",
    padding: 6,
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
  },
  quantityText: {
    paddingHorizontal: 12,
    fontWeight: "bold",
  },
  itemTotalContainer: {
    alignItems: "center",
    marginLeft: 8,
    marginRight: 8,
    justifyContent: "center",
  },
  itemTotalLabel: {
    fontSize: 12,
    color: "#666",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  removeButton: {
    padding: 8,
    alignSelf: "center",
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: "#666",
    marginVertical: 16,
  },
  continueShopping: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: "#fff",
    fontWeight: "bold",
  },
  checkoutContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2ecc71",
  },
  checkoutButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  processingButton: {
    backgroundColor: "#95a5a6",
  },
  checkoutIcon: {
    marginRight: 8,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CartScreen;
