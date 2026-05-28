import React, { useState } from "react";
import {
  View, Text, TextInput,
  TouchableOpacity, Image,
  StyleSheet, Alert
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddMemberScreen() {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [group, setGroup] = useState("");
  const [image, setImage] = useState(null);

  /* ✅ PICK IMAGE */
  const pickImage = async () => {

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  /* ✅ TAKE PHOTO */
  const takePhoto = async () => {

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  /* ✅ SAVE MEMBER */
  const saveMember = async () => {

    if (!name || !phone || !group) {
      Alert.alert("All fields are required");
      return;
    }

    await addDoc(collection(db, "members"), {
      name,
      phone,
      group,
      image, // ✅ SAVED
      status: "active",
      attendance: [],
      donations: []
    });

    Alert.alert("Member saved ✅");

    setName("");
    setPhone("");
    setGroup("");
    setImage(null);
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Add Member</Text>

      {/* ✅ IMAGE PREVIEW */}
      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}

      {/* ✅ BUTTONS */}
      <View style={styles.row}>
        <Btn text="Camera" color="#27ae60" onPress={takePhoto}/>
        <Btn text="Gallery" color="#2c7be5" onPress={pickImage}/>
      </View>

      {/* ✅ FIELDS */}
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input}/>
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={styles.input}/>
      <TextInput placeholder="Group" value={group} onChangeText={setGroup} style={styles.input}/>

      <TouchableOpacity style={styles.saveBtn} onPress={saveMember}>
        <Text style={styles.btnText}>Save Member</Text>
      </TouchableOpacity>

    </View>
  );
}

/* ✅ BUTTON */
const Btn = ({ text, color, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.btn, { backgroundColor: color }]}>
    <Text style={{ color: "#fff" }}>{text}</Text>
  </TouchableOpacity>
);

/* ✅ STYLES */
const styles = StyleSheet.create({

  container: { flex: 1, padding: 15 },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10
  },

  input: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 8
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },

  btn: {
    flex: 1,
    marginHorizontal: 4,
    padding: 10,
    alignItems: "center",
    borderRadius: 6
  },

  saveBtn: {
    backgroundColor: "#8e44ad",
    padding: 12,
    marginTop: 10,
    alignItems: "center"
  },

  btnText: {
    color: "#fff"
  },

  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
    alignSelf: "center",
    borderRadius: 50
  }

});