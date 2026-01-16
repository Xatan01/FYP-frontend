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

// Import all the required screens
import Home from "../screens/Home";
import Learn from "../screens/Learn";
import Watchlist from "../screens/Watchlist"; // Your original screen
import Consult from "../screens/Consult";   // Your original screen
import Profile from "../screens/Profile";   // A new screen

const Tab = createBottomTabNavigator();

export default function TabNavigator({
  userData,
  learningPath,
  onCompleteLesson,
  onAuthChange,
}) {
  // Check if there's a new lesson to show a badge
  const hasNewLesson = learningPath.some((unit) =>
    unit.lessons.some((l) => l.status === "unlocked")
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
          <Home {...props} userData={userData} learningPath={learningPath} />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Learn"
        options={{
          tabBarIcon: ({ color }) => <BookOpen color={color} size={24} />,
          tabBarBadge: hasNewLesson ? "!" : null, // Gamification!
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
            learningPath={learningPath}
            onCompleteLesson={onCompleteLesson}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Watchlist"
        component={Watchlist} // Your core FYP feature
        options={{
          tabBarIcon: ({ color }) => <Eye color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Consult"
        component={Consult} // Your core FYP feature
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
        {(props) => <Profile {...props} userData={userData} onAuthChange={onAuthChange} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
