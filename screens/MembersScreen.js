import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Alert, Linking
} from "react-native";

import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

export default function MembersScreen({ navigation }) {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [members, setMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "members"), (snapshot) => {
      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setMembers(list);
    });

    return () => unsubscribe();
  }, []);

  const saveMember = async () => {
    if (!name || !phone) return;

    if (editingMember) {
      await updateDoc(doc(db, "members", editingMember.id), { name, phone });
      setEditingMember(null);
    } else {
      await addDoc(collection(db, "members"), {
        name,
        phone,
        attendance: [],
        flagged: false,
        suspended: false,
        reprimanded: false
      });
    }

    setName("");
    setPhone("");
  };

  const deleteMember = async (id) => {
    await deleteDoc(doc(db, "members", id));
  };

  const toggleSuspend = async (member) => {
    await updateDoc(doc(db, "members", member.id), {
      suspended: !member.suspended
    });
  };

  // ✅ NEW: toggle reprimand
  const toggleReprimand = async (member) => {
    await updateDoc(doc(db, "members", member.id), {
      reprimanded: !member.reprimanded
    });
  };

  // ✅ SMS
  const sendSMS = (phone, name) => {
    const msg = "Hello " + name + ", we missed you at church.";
    Linking.openURL("sms:" + phone + "?body=" + encodeURIComponent(msg));
  };

  // ✅ WhatsApp
  const sendWhatsApp = (phone, name) => {
    const msg = "Hi " + name + ", you are missed at church.";
    Linking.openURL(
      "https://wa.me/" + phone + "?text=" + encodeURIComponent(msg)
    );
  };

  // ✅ attendance logic
  const markAttendance = async (member, status) => {

    const history = member.attendance || [];
    const newHistory = [...history, status];

    let flagged = false;

    if (
      newHistory.length >= 2 &&
      newHistory[newHistory.length - 1] === "absent" &&
      newHistory[newHistory.length - 2] === "absent"
    ) {
      flagged = true;

      setTimeout(() => {
        Alert.alert("Absentee Alert", member.name + " missed 2 meetings", [
          { text: "SMS", onPress: () => sendSMS(member.phone, member.name) },
          { text: "WhatsApp", onPress: () => sendWhatsApp(member.phone, member.name) },
          { text: "Cancel", style: "cancel" }
        ]);
      }, 300);
    }

    await updateDoc(doc(db, "members", member.id), {
      attendance: newHistory,
      flagged
    });
  };

  const filteredMembers = members.filter(m => {
    if (filter === "all") return true;
    if (filter === "active") return !m.suspended;
    if (filter === "suspended") return m.suspended;
    if (filter === "absentees") return m.flagged;
    if (filter === "reprimanded") return m.reprimanded;
    return true;
  });

  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
        <Text>← Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Members</Text>

      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={saveMember}>
        <Text style={styles.buttonText}>
          {editingMember ? "Update Member" : "Add Member"}
        </Text>
      </TouchableOpacity>

      {/* FILTERS */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilter("all")}><Text>All</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilter("active")}><Text>Active</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilter("suspended")}><Text>Suspended</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilter("absentees")}><Text>Absentees</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilter("reprimanded")}><Text>Reprimanded</Text></TouchableOpacity>
      </View>

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <View style={styles.card}>

            <Text>{item.name}</Text>
            <Text>{item.phone}</Text>

            {item.flagged && <Text style={{ color: "red" }}>⚠ Absentee</Text>}
            {item.suspended && <Text style={{ color: "#6A1B9A" }}>Suspended</Text>}
            {item.reprimanded && <Text style={{ color: "orange" }}>Reprimanded</Text>}

            <View style={styles.row}>
              <TouchableOpacity style={styles.present} onPress={() => markAttendance(item, "present")}>
                <Text style={styles.btn}>Present</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.absent} onPress={() => markAttendance(item, "absent")}>
                <Text style={styles.btn}>Absent</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <TouchableOpacity style={styles.edit} onPress={() => {
                setName(item.name);
                setPhone(item.phone);
                setEditingMember(item);
              }}>
                <Text style={styles.btn}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.suspend} onPress={() => toggleSuspend(item)}>
                <Text style={styles.btn}>{item.suspended ? "Activate" : "Suspend"}</Text>
              </TouchableOpacity>

              {/* ✅ Toggle Reprimand */}
              <TouchableOpacity
                style={styles.reprimand}
                onPress={() => {
                  toggleReprimand(item);

                  if (!item.reprimanded) {
                    Alert.alert("Send Warning", item.name, [
                      { text: "SMS", onPress: () => sendSMS(item.phone, item.name) },
                      { text: "WhatsApp", onPress: () => sendWhatsApp(item.phone, item.name) },
                      { text: "Cancel", style: "cancel" }
                    ]);
                  }
                }}
              >
                <Text style={styles.btn}>
                  {item.reprimanded ? "Clear Warning" : "Reprimand"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.delete} onPress={() => deleteMember(item.id)}>
                <Text style={styles.btn}>Delete</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: "bold" },

  input: { backgroundColor: "#fff", padding: 10, marginTop: 10 },

  button: { backgroundColor: "green", padding: 10 },
  buttonText: { color: "#fff", textAlign: "center" },

  filterRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  filterBtn: { backgroundColor: "#ddd", padding: 6 },

  card: { backgroundColor: "#fff", padding: 10, marginTop: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },

  present: { backgroundColor: "green", padding: 6 },
  absent: { backgroundColor: "orange", padding: 6 },
  edit: { backgroundColor: "blue", padding: 6 },
  suspend: { backgroundColor: "#6A1B9A", padding: 6 },
  reprimand: { backgroundColor: "#FF5722", padding: 6 },
  delete: { backgroundColor: "red", padding: 6 },

  btn: { color: "#fff" }
});