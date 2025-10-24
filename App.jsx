import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { StatusBar } from "expo-status-bar";
import { enableScreens } from "react-native-screens";

enableScreens();

export default function App() {
  return (
    <NavigationContainer>
      {/* Use a supported value: "auto" | "light" | "dark" */}
      <StatusBar style="auto" />
      <RootNavigator />
    </NavigationContainer>
  );
}
