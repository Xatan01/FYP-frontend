import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import Login from "../screens/Login";
import Register from "../screens/Register";
import PasswordReset from "../screens/PasswordReset";
import AiInsights from "../screens/AiInsights";
import News from "../screens/News";
import Charting from "../screens/Charting";
import TradingJournal from "../screens/TradingJournal";
import MarketTrends from "../screens/MarketTrends";
import ChatConsult from "../screens/ChatConsult";
import ConsultationBooking from "../screens/ConsultationBooking";
import Community from "../screens/Community";
import AlertsSettings from "../screens/AlertsSettings";
import Portfolio from "../screens/Portfolio";

const Stack = createNativeStackNavigator();

export default function RootNavigator({
  userData,
  learningPath,
  onCompleteLesson,
  isAuthed,
  onAuthChange,
}) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthed ? (
        <>
          <Stack.Screen name="MainTabs">
            {(props) => (
              <TabNavigator
                {...props}
                userData={userData}
                learningPath={learningPath}
                onCompleteLesson={onCompleteLesson}
                onAuthChange={onAuthChange}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="AiInsights" component={AiInsights} />
          <Stack.Screen name="News" component={News} />
          <Stack.Screen name="Charting" component={Charting} />
          <Stack.Screen name="TradingJournal" component={TradingJournal} />
          <Stack.Screen name="MarketTrends" component={MarketTrends} />
          <Stack.Screen name="ChatConsult" component={ChatConsult} />
          <Stack.Screen name="ConsultationBooking" component={ConsultationBooking} />
          <Stack.Screen name="Community" component={Community} />
          <Stack.Screen name="AlertsSettings" component={AlertsSettings} />
          <Stack.Screen name="Portfolio" component={Portfolio} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login">
            {(props) => <Login {...props} onAuthChange={onAuthChange} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {(props) => <Register {...props} onAuthChange={onAuthChange} />}
          </Stack.Screen>
          <Stack.Screen name="PasswordReset" component={PasswordReset} />
        </>
      )}
    </Stack.Navigator>
  );
}
