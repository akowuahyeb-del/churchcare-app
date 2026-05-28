import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList,
  TouchableOpacity, StyleSheet, Alert,
  Modal, TextInput, ScrollView
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { db } from "../firebase";
import {
  collection, onSnapshot, addDoc,
  updateDoc, doc, getDocs,
  deleteDoc, query, where, getDoc
} from "firebase/firestore";

export default function AttendanceScreen() {

  const [members, setMembers] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState([]);

  const [service, setService] = useState("");
  const [event, setEvent] = useState("");
  const [eventOptions, setEventOptions] = useState([]);

  const [search, setSearch] = useState("");

  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

  const [locked, setLocked] = useState(false);

  const [pin, setPin] = useState("");
  const [modal, setModal] = useState(false);

  /* ✅ LOAD MEMBERS */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "members"), snap => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* ✅ SMART TEMPLATE */
  useEffect(() => {
    if (service === "Sunday") {
      setEventOptions(["First Service", "Second Service"]);
    } else if (service === "Midweek") {
      setEventOptions(["Bible Study", "Prayer"]);
    } else {
      setEventOptions([]);
    }
    setEvent("");
  }, [service]);

  /* ✅ LOAD TODAY */
  useEffect(() => {

    if (!service || !event) return;

    const dateKey = date.toISOString().slice(0, 10);

    const unsub = onSnapshot(collection(db, "attendance"), snap => {

      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })).filter(a =>
        a.dateKey === dateKey &&
        a.service === service &&
        a.event === event
      );

      setAttendanceToday(list);

    });

    return () => unsub();

  }, [service, event, date]);

  /* ✅ LOCK CHECK */
  useEffect(() => {

    if (!service || !event) return;

    const dateKey = date.toISOString().slice(0, 10);

    const q = query(
      collection(db, "attendanceLocks"),
      where("service", "==", service),
      where("event", "==", event),
      where("date", "==", dateKey)
    );

    const unsub = onSnapshot(q, snap => {
      setLocked(!snap.empty);
    });

    return () => unsub();

  }, [service, event, date]);

  /* ✅ SEARCH */
  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search)
  );

  /* ✅ TOGGLE */
  const toggle = async (member, status) => {

    if (locked) return Alert.alert("🔒 Locked");

    const dateKey = date.toISOString().slice(0, 10);

    const existing = attendanceToday.find(a => a.memberId === member.id);

    if (!existing) {
      await addDoc(collection(db, "attendance"), {
        memberId: member.id,
        memberName: member.name,
        status,
        service,
        event,
        date: date.toISOString(),
        dateKey
      });
    } else {
      await updateDoc(doc(db, "attendance", existing.id), { status });
    }
  };

  /* ✅ UNDO */
  const undo = async (item) => {
    if (locked) return Alert.alert("Locked");
    await deleteDoc(doc(db, "attendance", item.id));
  };

  /* ✅ LOCK */
  const lock = async () => {
    const dateKey = date.toISOString().slice(0, 10);
    await addDoc(collection(db, "attendanceLocks"), {
      service, event, date: dateKey
    });
  };

  /* ✅ UNLOCK */
  const unlock = async () => {

    const snap = await getDoc(doc(db, "settings", "churchConfig"));
    const firebasePin = snap.data().pin;

    if (pin !== firebasePin) {
      Alert.alert("Wrong PIN");
      return;
    }

    const dateKey = date.toISOString().slice(0, 10);

    const q = query(
      collection(db, "attendanceLocks"),
      where("service", "==", service),
      where("event", "==", event),
      where("date", "==", dateKey)
    );

    const res = await getDocs(q);
    res.forEach(async d => await deleteDoc(doc(db, "attendanceLocks", d.id)));

    setModal(false);
    setPin("");
  };

  return (
    <ScrollView style={styles.container}>

      {/* ✅ HEADER */}
      <Text style={styles.title}>Attendance</Text>

      <View style={styles.card}>

        <Picker selectedValue={service} onValueChange={setService}>
          <Picker.Item label="Select Service" value="" />
          <Picker.Item label="Sunday" value="Sunday" />
          <Picker.Item label="Midweek" value="Midweek" />
        </Picker>

        <Picker selectedValue={event} onValueChange={setEvent}>
          <Picker.Item label="Select Event" value="" />
          {eventOptions.map(e => (
            <Picker.Item key={e} label={e} value={e} />
          ))}
        </Picker>

        <TouchableOpacity style={styles.input} onPress={() => setShowDate(true)}>
          <Text>{date.toDateString()}</Text>
        </TouchableOpacity>

        {showDate && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(e, d) => {
              setShowDate(false);
              d && setDate(d);
            }}
          />
        )}

      </View>

      <TextInput
        placeholder="Search by name or phone"
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      {/* ✅ LOCK */}
      <View style={styles.row}>
        <Btn text="Lock" color="#ccc" onPress={lock} />
        <Btn text="Unlock" color="#aaa" onPress={() => setModal(true)} />
      </View>

      {/* ✅ MEMBERS */}
      <FlatList
        data={filteredMembers}
        keyExtractor={i => i.id}
        scrollEnabled={false}
        renderItem={({ item }) => {

          const record = attendanceToday.find(r => r.memberId === item.id);

          return (
            <View style={[
              styles.member,
              record?.status === "present" && styles.present,
              record?.status === "absent" && styles.absent
            ]}>

              <Text style={styles.name}>{item.name}</Text>

              <View style={styles.row}>
                <Btn text="Present" color="#27ae60"
                  onPress={() => toggle(item, "present")}
                />
                <Btn text="Absent" color="#e74c3c"
                  onPress={() => toggle(item, "absent")}
                />
              </View>

              {record && (
                <Text>{record.status}</Text>
              )}

            </View>
          );
        }}
      />

      {/* ✅ TODAY */}
      <Text style={styles.section}>Today's Attendance</Text>

      {attendanceToday.map(item => (
        <View key={item.id} style={styles.record}>
          <Text>{item.memberName}</Text>
          <Text>{item.status}</Text>

          <TouchableOpacity onPress={() => undo(item)}>
            <Text style={{ color: "#e74c3c" }}>Undo</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* ✅ PIN MODAL */}
      <Modal visible={modal} transparent>
        <View style={styles.modal}>
          <TextInput
            placeholder="Enter PIN"
            value={pin}
            onChangeText={setPin}
            style={styles.input}
          />
          <Btn text="Unlock" color="#27ae60" onPress={unlock} />
        </View>
      </Modal>

    </ScrollView>
  );
}

const Btn = ({ text, color, onPress }) => (
  <TouchableOpacity style={[styles.btn, { backgroundColor: color }]} onPress={onPress}>
    <Text>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({

  container: { flex: 1, padding: 15, backgroundColor: "#f4f6f8" },

  title: { fontSize: 20, fontWeight: "600", marginBottom: 10 },

  card: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6
  },

  input: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6
  },

  member: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 6,
    borderRadius: 6
  },

  present: { borderLeftWidth: 4, borderLeftColor: "#27ae60" },
  absent: { borderLeftWidth: 4, borderLeftColor: "#e74c3c" },

  name: { fontWeight: "600" },

  record: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 5,
    borderRadius: 6
  },

  section: { marginTop: 10, fontWeight: "600" },

  row: { flexDirection: "row", marginBottom: 10 },

  btn: {
    padding: 8,
    marginRight: 5,
    borderRadius: 5
  },

  modal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#0008",
    padding: 20
  }
});
``