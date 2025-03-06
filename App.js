import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store } from "./app/redux/store";
import RootLayout from "./app/RootLayout";

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootLayout />
      </NavigationContainer>
    </Provider>
  );
}
