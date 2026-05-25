import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DashboardScreen from "./screens/DashboardScreen";
import MembersScreen from "./screens/MembersScreen";
import AbsenteesScreen from "./screens/AbsenteesScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Members" component={MembersScreen} />
        <Stack.Screen name="Absentees" component={AbsenteesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
