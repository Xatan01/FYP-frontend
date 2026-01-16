import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import Login from "../screens/Login";
import Register from "../screens/Register";
import AiInsights from "../screens/AiInsights";
import News from "../screens/News";
import Charting from "../screens/Charting";
import TradingJournal from "../screens/TradingJournal";
import MarketTrends from "../screens/MarketTrends";
import ChatConsult from "../screens/ChatConsult";

const Stack = createNativeStackNavigator();

export default function RootNavigator({ userData, learningPath, onCompleteLesson }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {(props) => (
          <TabNavigator
            {...props}
            userData={userData}
            learningPath={learningPath}
            onCompleteLesson={onCompleteLesson}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="AiInsights" component={AiInsights} />
      <Stack.Screen name="News" component={News} />
      <Stack.Screen name="Charting" component={Charting} />
      <Stack.Screen name="TradingJournal" component={TradingJournal} />
      <Stack.Screen name="MarketTrends" component={MarketTrends} />
      <Stack.Screen name="ChatConsult" component={ChatConsult} />
    </Stack.Navigator>
  );
}
