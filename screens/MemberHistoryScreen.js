import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Dimensions } from "react-native";

import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

import { PieChart, LineChart } from "react-native-chart-kit";

export default function MemberHistoryScreen({ route }) {

  const { member } = route.params;
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "attendance"), snap => {
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })).filter(a => a.memberId === member.id);

      setHistory(list);
    });
    return () => unsub();
  }, []);

  const present = history.filter(h => h.status === "present").length;
  const absent = history.filter(h => h.status === "absent").length;

  return (
    <View style={{ flex: 1, padding: 15 }}>

      <Text>{member.name}</Text>

      <PieChart
        data={[
          { name: "Present", population: present, color: "green" },
          { name: "Absent", population: absent, color: "red" }
        ]}
        width={Dimensions.get("window").width - 20}
        height={180}
        accessor="population"
        chartConfig={{ color: () => "#000" }}
      />

      <LineChart
        data={{
          labels: history.map((_, i) => i + 1),
          datasets: [{
            data: history.map(h => h.status === "present" ? 1 : 0)
          }]
        }}
        width={Dimensions.get("window").width - 20}
        height={200}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          color: () => "#2c7be5"
        }}
      />

    </View>
  );
}