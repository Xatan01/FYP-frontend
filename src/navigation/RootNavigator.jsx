import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import Login from "../screens/Login";
import Register from "../screens/Register";
import PasswordReset from "../screens/PasswordReset";
import AiInsights from "../screens/AiInsights";
import FinBot from "../screens/FinBot";
import News from "../screens/News";
import Charting from "../screens/Charting";
import TradingJournal from "../screens/TradingJournal";
import Watchlist from "../screens/Watchlist";
import Friends from "../screens/Friends";
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
import LoadingState from "../components/LoadingState";

const Stack = createNativeStackNavigator();

export default function RootNavigator({
  userData,
  learningPath,
  onCompleteLesson,
  themePreference = "dark",
  onThemePreferenceChange = () => {},
}) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <LoadingState
        variant="screen"
        title="Starting Finwise"
        message="Restoring your session and syncing your workspace."
      />
    );
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
                themePreference={themePreference}
                onThemePreferenceChange={onThemePreferenceChange}
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
          <Stack.Screen name="FinBot" component={FinBot} />
          <Stack.Screen name="News" component={News} />
          <Stack.Screen name="Charting" component={Charting} />
          <Stack.Screen name="TradingJournal" component={TradingJournal} />
          <Stack.Screen name="Watchlist" component={Watchlist} />
          <Stack.Screen name="Friends" component={Friends} />
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
