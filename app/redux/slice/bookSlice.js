// redux/slice/bookSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as ConnectivityService from "../../services/ConnectivityService";

// Thunks asynchrones pour les opérations CRUD
export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async (_, { rejectWithValue }) => {
    try {
      const books = await ConnectivityService.getBooks();
      return books;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBookById = createAsyncThunk(
  "books/fetchBookById",
  async (id, { rejectWithValue }) => {
    try {
      const book = await ConnectivityService.getBookById(id);
      return book;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice Redux pour les livres
const bookSlice = createSlice({
  name: "books",
  initialState: {
    items: [],
    selectedBook: null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    isOnline: true,
  },
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    resetSelectedBook: (state) => {
      state.selectedBook = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Gestion de fetchBooks
      .addCase(fetchBooks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Gestion de fetchBookById
      .addCase(fetchBookById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedBook = action.payload;
        state.error = null;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setOnlineStatus, resetSelectedBook } = bookSlice.actions;
export default bookSlice.reducer;
