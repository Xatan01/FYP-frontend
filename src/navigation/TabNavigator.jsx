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
import Learn from "../screens/Learn_Feature/Learn";
import Watchlist from "../screens/Watchlist";
import Consult from "../screens/Consult";
import Profile from "../screens/Profile";

const Tab = createBottomTabNavigator();

export default function TabNavigator({
  userData = {},
  learningPath = [],
  onCompleteLesson,
}) {
  const safeLearningPath = Array.isArray(learningPath) ? learningPath : [];
  const safeUserData = userData ?? {
    name: "User",
    xp: 0,
    streak: 0,
    league: "Bronze",
  };

  // Check if there's a new lesson to show a badge
  const hasNewLesson = safeLearningPath.some((unit) =>
    Array.isArray(unit?.lessons) && unit.lessons.some((l) => l.status === "unlocked")
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#93c5fd",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopColor: "#1e293b",
          borderTopWidth: 1,
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
        {/* The hub for badges, progress, and leagues */}
        {(props) => <Profile {...props} userData={safeUserData} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
