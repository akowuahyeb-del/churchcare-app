import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function MemberCard({ item, onHistory }) {

  return (
    <View style={styles.card}>

      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.sub}>{item.phone}</Text>

      <TouchableOpacity style={styles.btn} onPress={onHistory}>
        <Feather name="clock" size={12} color="#fff" />
        <Text style={styles.btnText}>History</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", padding: 10, marginBottom: 6 },
  name: { fontWeight: "600" },
  sub: { fontSize: 11, color: "#666" },
  btn: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c3e50",
    padding: 8,
    borderRadius: 5
  },
  btnText: { color: "#fff", marginLeft: 5, fontSize: 11 }
});