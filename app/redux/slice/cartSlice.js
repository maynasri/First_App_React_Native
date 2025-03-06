// redux/slice/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    total: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const { book, quantity = 1 } = action.payload;
      const existingItem = state.items.find((item) => item.id === book.id);

      if (existingItem) {
        // Si le livre est déjà dans le panier, incrementer la quantité
        existingItem.quantity += quantity;
      } else {
        // Sinon ajouter le livre au panier
        state.items.push({ ...book, quantity });
      }

      // Recalculer le total
      state.total = state.items.reduce(
        (sum, item) => sum + item.prix * item.quantity,
        0
      );
    },
    removeFromCart: (state, action) => {
      const bookId = action.payload;
      state.items = state.items.filter((item) => item.id !== bookId);

      // Recalculer le total
      state.total = state.items.reduce(
        (sum, item) => sum + item.prix * item.quantity,
        0
      );
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);

      if (item) {
        item.quantity = Math.max(1, quantity); // Minimum 1 livre
      }

      // Recalculer le total
      state.total = state.items.reduce(
        (sum, item) => sum + item.prix * item.quantity,
        0
      );
    },
    incrementQuantity: (state, action) => {
      const id = action.payload;
      const item = state.items.find((item) => item.id === id);

      if (item) {
        item.quantity += 1;
      }

      // Recalculer le total
      state.total = state.items.reduce(
        (sum, item) => sum + item.prix * item.quantity,
        0
      );
    },
    decrementQuantity: (state, action) => {
      const id = action.payload;
      const item = state.items.find((item) => item.id === id);

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }

      // Recalculer le total
      state.total = state.items.reduce(
        (sum, item) => sum + item.prix * item.quantity,
        0
      );
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
