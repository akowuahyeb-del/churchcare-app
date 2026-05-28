import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";

import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

/* ✅ TEMP USER (later replace with login UID) */
const currentMemberId = "REPLACE_WITH_MEMBER_ID";

export default function MemberProfileScreen() {

  const [member, setMember] = useState(null);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  /* ✅ LOAD MEMBER DETAILS */
  useEffect(() => {

    const loadMember = async () => {

      const ref = doc(db, "members", currentMemberId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setMember(data);

        setPhone(data.phone || "");
        setAddress(data.address || "");
      }
    };

    loadMember();

  }, []);

  /* ✅ UPDATE ONLY PHONE + ADDRESS */
  const updateProfile = async () => {

    if (!phone) {
      Alert.alert("Phone number required");
      return;
    }

    try {
      await updateDoc(doc(db, "members", currentMemberId), {
        phone: phone,
        address: address
      });

      Alert.alert("✅ Profile updated");

    } catch (e) {
      Alert.alert("Error updating profile");
    }
  };

  if (!member) return null;

  return (
    <View style={styles.container}>

      <Text style={styles.title}>My Profile</Text>

      {/* ✅ NAME (READ ONLY) */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={member.name}
        editable={false}
        style={styles.disabledInput}
      />

      {/* ✅ PHONE */}
      <Text style={styles.label}>Phone</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />

      {/* ✅ ADDRESS */}
      <Text style={styles.label}>Address</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />

      <TouchableOpacity style={styles.btn} onPress={updateProfile}>
        <Text style={{ color: "#fff" }}>Update</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 15
  },

  title: {
    fontSize: 18,
    fontWeight: "600"
  },

  label: {
    marginTop: 10,
    fontSize: 12
  },

  input: {
    backgroundColor: "#fff",
    padding: 10,
    marginTop: 5
  },

  disabledInput: {
    backgroundColor: "#ddd",
    padding: 10,
    marginTop: 5
  },

  btn: {
    backgroundColor: "#27ae60",
    padding: 12,
    marginTop: 20,
    alignItems: "center",
    borderRadius: 6
  }

});
