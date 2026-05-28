import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import AttendanceScreen from "./screens/AttendanceScreen";
import MembersListScreen from "./screens/MembersListScreen";
import MemberHistoryScreen from "./screens/MemberHistoryScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
        <Stack.Screen name="MembersList" component={MembersListScreen} />
        <Stack.Screen name="MemberHistory" component={MemberHistoryScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
