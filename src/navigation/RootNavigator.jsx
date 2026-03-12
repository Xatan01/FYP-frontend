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
import VirtualMarket from "../screens/VirtualMarket_Feature/VirtualMarket";
import LessonDetail from "../screens/Learn_Feature/LessonDetail";
import QuizDetail from "../screens/Learn_Feature/QuizDetail";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

export default function RootNavigator({
  userData,
  learningPath,
  onCompleteLesson,
}) {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
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

          <Stack.Screen name="LessonDetail">
            {(props) => (
              <LessonDetail {...props} onCompleteLesson={onCompleteLesson} />
            )}
          </Stack.Screen>
          <Stack.Screen name="QuizDetail" component={QuizDetail} />

          <Stack.Screen name="AiInsights" component={AiInsights} />
          <Stack.Screen name="News" component={News} />
          <Stack.Screen name="Charting" component={Charting} />
          <Stack.Screen name="TradingJournal" component={TradingJournal} />
          <Stack.Screen name="MarketTrends" component={MarketTrends} />
          <Stack.Screen name="ChatConsult" component={ChatConsult} />
          <Stack.Screen
            name="ConsultationBooking"
            component={ConsultationBooking}
          />
          <Stack.Screen name="Community" component={Community} />
          <Stack.Screen name="AlertsSettings" component={AlertsSettings} />
          <Stack.Screen name="Portfolio" component={Portfolio} />
          <Stack.Screen name="VirtualMarket" component={VirtualMarket} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
    </Stack.Navigator>
  );
}
