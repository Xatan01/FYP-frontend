import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/Home";
import Learn from "../screens/Learn";
import Consult from "../screens/Consult";
import AiInsights from "../screens/AiInsights";
import Watchlist from "../screens/Watchlist";
import {
  Home as HomeIcon,
  BookOpen,
  MessageCircle,
  Sparkles,
  Eye
} from "lucide-react-native";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb"
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ tabBarIcon: ({ color }) => <HomeIcon color={color} size={20} /> }}
      />
      <Tab.Screen
        name="Learn"
        component={Learn}
        options={{ tabBarIcon: ({ color }) => <BookOpen color={color} size={20} /> }}
      />
      <Tab.Screen
        name="Consult"
        component={Consult}
        options={{ tabBarIcon: ({ color }) => <MessageCircle color={color} size={20} /> }}
      />
      <Tab.Screen
        name="AI Insights"
        component={AiInsights}
        options={{ tabBarIcon: ({ color }) => <Sparkles color={color} size={20} /> }}
      />
      <Tab.Screen
        name="Watchlist"
        component={Watchlist}
        options={{ tabBarIcon: ({ color }) => <Eye color={color} size={20} /> }}
      />
    </Tab.Navigator>
  );
}
