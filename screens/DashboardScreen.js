import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Dimensions
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { BarChart, PieChart } from "react-native-chart-kit";

import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen({ navigation }) {

  const churchId = auth.currentUser.uid;

  const [members, setMembers] = useState([]);

  const [filterDate, setFilterDate] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterEvent, setFilterEvent] = useState("");
  const [filterGroup, setFilterGroup] = useState("");

  const [showPicker, setShowPicker] = useState(false);

  const [groups, setGroups] = useState([]);
  const [services, setServices] = useState([]);
  const [events, setEvents] = useState([]);

  // ✅ FORMAT DATE
  const formatDate = (d) => {
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`;
  };

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "churches", churchId, "members"),
      (snap) => {

        const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        setMembers(list);

        // ✅ EXTRACT UNIQUE VALUES
        const groupSet = new Set();
        const serviceSet = new Set();
        const eventSet = new Set();

        list.forEach(m => {
          if (m.group) groupSet.add(m.group);

          (m.attendance || []).forEach(a => {
            if (a.serviceType) serviceSet.add(a.serviceType);
            if (a.event) eventSet.add(a.event);
          });
        });

        setGroups([...groupSet]);
        setServices([...serviceSet]);
        setEvents([...eventSet]);
      }
    );

    return () => unsub();
  }, []);

  // ✅ ATTENDANCE COUNTS
  let present = 0;
  let absent = 0;

  members.forEach(m => {
    (m.attendance || []).forEach(a => {

      if (
        (!filterDate || a.date === filterDate) &&
        (!filterService || a.serviceType === filterService) &&
        (!filterEvent || a.event === filterEvent)
      ) {
        if (a.status === "present") present++;
        if (a.status === "absent") absent++;
      }

    });
  });

  // ✅ GROUP DATA FOR PIE CHART
  const groupStats = {};

  members.forEach(m => {
    if (!filterGroup || m.group === filterGroup) {
      const g = m.group || "Others";
      groupStats[g] = (groupStats[g] || 0) + 1;
    }
  });

  const pieData = Object.keys(groupStats).map((key, index) => ({
    name: key,
    population: groupStats[key],
    color: ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336"][index % 5],
    legendFontColor: "#333",
    legendFontSize: 11
  }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <Text style={styles.title}>ChurchCare Dashboard</Text>

      {/* ✅ QUICK ACTIONS */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("Members")}
        >
          <Text style={styles.btnText}>Members</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate("Absentees")}
        >
          <Text style={styles.btnText}>Absentees</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ FILTERS */}
      <View style={styles.card}>

        <Text style={styles.section}>Filters</Text>

        {/* ✅ DATE */}
        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <View style={styles.input}>
            <Text>{filterDate || "Select Date (dd/mm/yyyy)"}</Text>
          </View>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            onChange={(e, d) => {
              setShowPicker(false);
              if (d) setFilterDate(formatDate(d));
            }}
          />
        )}

        {/* ✅ SERVICE */}
        <FilterRow title="Service" data={services} selected={filterService} setSelected={setFilterService} />

        {/* ✅ EVENT */}
        <FilterRow title="Event" data={events} selected={filterEvent} setSelected={setFilterEvent} />

        {/* ✅ GROUP */}
        <FilterRow title="Group" data={groups} selected={filterGroup} setSelected={setFilterGroup} />

        {/* ✅ ✅ CLEAR FILTER BUTTON */}
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => {
            setFilterDate("");
            setFilterService("");
            setFilterEvent("");
            setFilterGroup("");
          }}
        >
          <Text style={styles.btnText}>Clear Filters</Text>
        </TouchableOpacity>

      </View>

      {/* ✅ SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.section}>Summary</Text>
        <Text>Present: {present}</Text>
        <Text>Absent: {absent}</Text>
      </View>

      {/* ✅ BAR CHART */}
      <View style={styles.card}>
        <Text style={styles.section}>Attendance</Text>
        <BarChart
          data={{
            labels: ["Present", "Absent"],
            datasets: [{ data: [present, absent] }]
          }}
          width={screenWidth - 40}
          height={160}
          chartConfig={chartConfig}
        />
      </View>

      {/* ✅ PIE CHART */}
      <View style={styles.card}>
        <Text style={styles.section}>Group Distribution</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={160}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
        />
      </View>

    </ScrollView>
  );
}

/* ✅ FILTER COMPONENT */
const FilterRow = ({ title, data, selected, setSelected }) => (
  <View>
    <Text style={styles.subTitle}>{title}</Text>
    <View style={styles.row}>
      {data.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.chip,
            selected === item && styles.activeChip
          ]}
          onPress={() =>
            setSelected(selected === item ? "" : item)
          }
        >
          <Text style={selected === item ? styles.activeText : styles.chipText}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: () => "#4CAF50"
};

/* ✅ STYLES */
const styles = StyleSheet.create({

  container: { flex: 1, padding: 15, backgroundColor: "#f3f4f6" },

  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 6,
    marginRight: 5
  },

  secondaryBtn: {
    flex: 1,
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 6,
    marginLeft: 5
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold"
  },

  card: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },

  section: { fontWeight: "bold", marginBottom: 5 },

  subTitle: { fontSize: 12, marginTop: 5 },

  input: {
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 5
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap"
  },

  chip: {
    backgroundColor: "#ddd",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 15,
    margin: 3
  },

  activeChip: {
    backgroundColor: "#4CAF50"
  },

  chipText: {
    fontSize: 12
  },

  activeText: {
    color: "#fff",
    fontSize: 12
  },

  clearBtn: {
    backgroundColor: "#999",
    padding: 10,
    marginTop: 8,
    borderRadius: 5
  }

});