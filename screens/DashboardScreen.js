import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function DashboardScreen({ navigation }) {

  const [members, setMembers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "members"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(list);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ChurchCare Dashboard</Text>

      <Text>Total Members: {members.length}</Text>
      <Text>Absentees: {members.filter(m => m.flagged).length}</Text>
      <Text>Suspended: {members.filter(m => m.suspended).length}</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Members")}>
        <Text style={styles.btn}>Manage Members</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.alertBtn} onPress={() => navigation.navigate("Absentees")}>
        <Text style={styles.btn}>View Absentees</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: { backgroundColor: "green", padding: 12, marginTop: 10 },
  alertBtn: { backgroundColor: "red", padding: 12, marginTop: 10 },
  btn: { color: "#fff", textAlign: "center" }
});