import React, { useEffect, useState } from "react";
import {
  View, Text, SectionList,
  TextInput, TouchableOpacity,
  StyleSheet
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc
} from "firebase/firestore";

export default function AttendanceListScreen() {

  const [records, setRecords] = useState([]);
  const [sections, setSections] = useState([]);

  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");

  const [date, setDate] = useState(null);
  const [showDate, setShowDate] = useState(false);

  /* ✅ LOAD DATA */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "attendance"), snap => {

      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setRecords(data);
    });

    return () => unsub();
  }, []);

  /* ✅ ✅ ✅ FILTER + GROUP */
  useEffect(() => {

    let list = [...records];

    if (search) {
      list = list.filter(r =>
        r.memberName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (serviceFilter) {
      list = list.filter(r =>
        r.service?.toLowerCase().includes(serviceFilter.toLowerCase())
      );
    }

    if (date) {
      const selectedISO = date.toISOString().slice(0, 10);

      list = list.filter(r => {
        const recISO = new Date(r.date).toISOString().slice(0, 10);
        return recISO === selectedISO;
      });
    }

    /* ✅ ✅ GROUP BY DATE + SERVICE */
    const grouped = {};

    list.forEach(item => {

      const day = new Date(item.date).toDateString();
      const key = `${day} | ${item.service}`;

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(item);
    });

    const groupedArray = Object.keys(grouped).map(key => ({
      title: key,
      data: grouped[key]
    }));

    setSections(groupedArray);

  }, [records, search, serviceFilter, date]);

  /* ✅ UNDO */
  const undo = async (item) => {
    await deleteDoc(doc(db, "attendance", item.id));
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Attendance Records</Text>

      {/* ✅ SEARCH */}
      <TextInput
        placeholder="Search member"
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      {/* ✅ SERVICE FILTER */}
      <TextInput
        placeholder="Filter by service"
        placeholderTextColor="#888"
        value={serviceFilter}
        onChangeText={setServiceFilter}
        style={styles.input}
      />

      {/* ✅ DATE FILTER */}
      <TouchableOpacity onPress={() => setShowDate(true)}>
        <View style={styles.input}>
          <Text style={{ color: date ? "#000" : "#888" }}>
            {date ? date.toDateString() : "Filter by date"}
          </Text>
        </View>
      </TouchableOpacity>

      {showDate && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          onChange={(e, d) => {
            setShowDate(false);
            if (d) setDate(d);
          }}
        />
      )}

      {/* ✅ ✅ ✅ GROUPED LIST */}
      {sections.length === 0 ? (
        <Text style={styles.empty}>No records found</Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text>
                {item.memberName} ({item.status})
              </Text>

              <TouchableOpacity
                style={styles.undoBtn}
                onPress={() => undo(item)}
              >
                <Text style={{ color: "#fff" }}>Undo</Text>
              </TouchableOpacity>

            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.header}>{title}</Text>
          )}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f4f6f8"
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd"
  },

  header: {
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 5,
    borderRadius: 6
  },

  undoBtn: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#888"
  }

});