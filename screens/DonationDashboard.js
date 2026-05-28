import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  Dimensions
} from "react-native";

import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function DonationDashboard() {

  const [donations, setDonations] = useState([]);

  const [isWide, setIsWide] = useState(
    Dimensions.get("window").width > 600
  );

  /* ✅ DETECT SCREEN SIZE */
  useEffect(() => {

    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setIsWide(window.width > 600);
    });

    return () => sub?.remove();

  }, []);

  /* ✅ LOAD DATA */
  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "donations"),
      snap => {
        setDonations(
          snap.docs.map(d => ({ id: d.id, ...d.data() }))
        );
      }
    );

    return () => unsub();

  }, []);

  /* ✅ DATE */
  const formatDate = (item) => {

    if (item.donationDate)
      return new Date(item.donationDate).toDateString();

    if (item.createdAt?.seconds)
      return new Date(item.createdAt.seconds * 1000).toDateString();

    return "-";
  };

  /* ✅ TABLE CONTENT */
  const Table = () => (
    <View>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <Header text="Donor" />
        <Header text="Type" />
        <Header text="Cash" />
        <Header text="Details" />
        <Header text="Date" />
      </View>

      <FlatList
        data={donations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <View style={styles.row}>

            <Cell>
              {item.donorType === "Group"
                ? (item.groupName || "Unnamed")
                : (item.memberName || "Unknown")}
            </Cell>

            <Cell>{item.donorType || "-"}</Cell>

            <Cell>
              {item.amount ? `₵${item.amount}` : "-"}
            </Cell>

            <Cell>
              {item.items || "-"}
            </Cell>

            <Cell>
              {formatDate(item)}
            </Cell>

          </View>

        )}
      />

    </View>
  );

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Donation Dashboard</Text>

      {/* ✅ ✅ RESPONSIVE SWITCH */}
      {isWide ? (
        /* ✅ WIDE SCREEN → NORMAL FLEX TABLE */
        <Table />
      ) : (
        /* ✅ SMALL SCREEN → SCROLLABLE TABLE */
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View style={{ width: 600 }}>
            <Table />
          </View>
        </ScrollView>
      )}

    </View>
  );
}

/* ✅ HEADER */
const Header = ({ text }) => (
  <Text style={styles.headerCell}>{text}</Text>
);

/* ✅ CELL */
const Cell = ({ children }) => (
  <Text style={styles.cell}>{children}</Text>
);

/* ✅ STYLES */
const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f4f6f8"
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8
  },

  headerRow: {
    flexDirection: "row",
    backgroundColor: "#2c3e50",
    paddingVertical: 6
  },

  headerCell: {
    flex: 1,              // ✅ FLEX (PORTRAIT FIX)
    color: "#fff",
    fontSize: 11,
    textAlign: "center",
    fontWeight: "600"
  },

  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 6,
    marginBottom: 2
  },

  cell: {
    flex: 1,              // ✅ FLEX (PORTRAIT FIX)
    fontSize: 11,
    textAlign: "center"
  }

});