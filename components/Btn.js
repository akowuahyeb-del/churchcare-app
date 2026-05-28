import React from "react";
import { TouchableOpacity, Text } from "react-native";

export default function Btn({ text, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#2c7be5",
        padding: 12,
        marginBottom: 10,
        borderRadius: 6,
        alignItems: "center"
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "600" }}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}