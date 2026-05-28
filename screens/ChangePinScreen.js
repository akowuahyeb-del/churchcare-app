import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ChangePinScreen() {

  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [storedPin, setStoredPin] = useState("");

  useEffect(() => {
    loadPin();
  }, []);

  const loadPin = async () => {
    const snap = await getDoc(doc(db, "settings", "churchConfig"));

    if (snap.exists()) {
      setStoredPin(snap.data().pin);
    } else {
      await setDoc(doc(db, "settings", "churchConfig"), { pin: "1234" });
      setStoredPin("1234");
    }
  };

  const changePin = async () => {

    if (oldPin !== storedPin) {
      Alert.alert("Wrong PIN");
      return;
    }

    if (newPin.length !== 4 || newPin !== confirmPin) {
      Alert.alert("Invalid PIN");
      return;
    }

    await setDoc(doc(db, "settings", "churchConfig"), {
      pin: newPin
    });

    Alert.alert("PIN updated ✅");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Change PIN</Text>

      <TextInput placeholder="Old PIN" value={oldPin} onChangeText={setOldPin}/>
      <TextInput placeholder="New PIN" value={newPin} onChangeText={setNewPin}/>
      <TextInput placeholder="Confirm PIN" value={confirmPin} onChangeText={setConfirmPin}/>

      <TouchableOpacity onPress={changePin}>
        <Text>Update PIN</Text>
      </TouchableOpacity>
    </View>
  );
}