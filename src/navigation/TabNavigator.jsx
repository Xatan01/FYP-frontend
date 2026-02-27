import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Home as HomeIcon,
  BookOpen,
  Eye,
  MessageCircle,
  User,
} from "lucide-react-native";
import { verticalScale, moderateScale } from "../styles/responsive";

import Home from "../screens/Home";
import Learn from "../screens/Learn";
import Watchlist from "../screens/Watchlist";
import Consult from "../screens/Consult";
import Profile from "../screens/Profile";

const Tab = createBottomTabNavigator();

export default function TabNavigator({
  userData = {},
  learningPath = [],
  onCompleteLesson,
  onAuthChange,
}) {
  const safeUserData = userData ?? {};
  const safeLearningPath = Array.isArray(learningPath) ? learningPath : [];

  const hasNewLesson = safeLearningPath.some((unit) =>
    Array.isArray(unit?.lessons) &&
    unit.lessons.some((l) => l?.status === "unlocked")
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          height: verticalScale(60),
          paddingBottom: verticalScale(5),
          paddingTop: verticalScale(5),
        },
        tabBarLabelStyle: {
          fontSize: moderateScale(10),
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color }) => <HomeIcon color={color} size={24} />,
        }}
      >
        {(props) => (
          <Home {...props} userData={safeUserData} learningPath={safeLearningPath} />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Learn"
        options={{
          tabBarIcon: ({ color }) => <BookOpen color={color} size={24} />,
          tabBarBadge: hasNewLesson ? "!" : null,
          tabBarBadgeStyle: {
            backgroundColor: "#ef4444",
            color: "#fff",
            fontSize: 12,
          },
        }}
      >
        {(props) => (
          <Learn
            {...props}
            userData={safeUserData}
            learningPath={safeLearningPath}
            onCompleteLesson={onCompleteLesson}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Watchlist"
        component={Watchlist}
        options={{
          tabBarIcon: ({ color }) => <Eye color={color} size={24} />,
        }}
      />

      <Tab.Screen
        name="Consult"
        component={Consult}
        options={{
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={24} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      >
        {(props) => (
          <Profile {...props} userData={safeUserData} onAuthChange={onAuthChange} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
