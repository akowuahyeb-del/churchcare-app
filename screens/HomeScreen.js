import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

export default function HomeScreen({ navigation }) {

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Dashboard</Text>

      {/* ✅ ROW 1 */}
      <View style={styles.row}>

        <Btn
          text="Attendance"
          color="#27ae60"
          onPress={() => navigation.navigate("Attendance")}
        />

        <Btn
          text="Members"
          color="#2c7be5"
          onPress={() => navigation.navigate("MembersList")}
        />

      </View>

      {/* ✅ ROW 2 */}
      <View style={styles.row}>

        <Btn
          text="Records"
          color="#8e44ad"
          onPress={() => navigation.navigate("Attendance")}
        />

        <Btn
          text="PIN"
          color="#34495e"
          onPress={() => navigation.navigate("ChangePIN")}
        />

      </View>

    </View>
  );
}

/* ✅ BUTTON COMPONENT */
const Btn = ({ text, color, onPress }) => (
  <TouchableOpacity
    style={[styles.btn, { backgroundColor: color }]}
    onPress={onPress}
  >
    <Text style={styles.btnText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f4f6f8"
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  btn: {
    flex: 1,
    margin: 5,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center"
  },

  btnText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 12
  }

});