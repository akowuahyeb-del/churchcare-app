import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function RegisterScreen({ navigation }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.replace("Dashboard");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 100 }}>

      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} />

      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity onPress={register} style={{ marginTop: 20 }}>
        <Text>Create Church Account</Text>
      </TouchableOpacity>

    </View>
  );
}