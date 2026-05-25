import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function AbsenteesScreen() {

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

  const absentees = members.filter(m => m.flagged);

  return (
    <View style={{ padding: 20 }}>
      <Text>Absentees</Text>

      <FlatList
        data={absentees}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ marginTop: 10 }}>
            <Text>{item.name}</Text>
            <Text>{item.phone}</Text>
          </View>
        )}
      />
    </View>
  );
}