import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "./slice/bookSlice";
import cartReducer from "./slice/cartSlice";

export const store = configureStore({
  reducer: {
    books: bookReducer,
    cart: cartReducer,
  },
});
