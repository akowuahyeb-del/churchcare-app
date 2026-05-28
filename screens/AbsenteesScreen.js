import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function AbsenteesScreen() {

  const churchId = auth.currentUser.uid;
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "churches", churchId, "members"),
      snap => setMembers(snap.docs.map(d=>({id:d.id,...d.data()})))
    );
    return () => unsub();
  }, []);

  const absentees = members.filter(m => m.flagged);

  return (
    <View style={{flex:1,padding:20}}>
      <Text>Absentees</Text>

      <FlatList
        data={absentees}
        keyExtractor={i=>i.id}
        renderItem={({item})=>(
          <Text>{item.name}</Text>
        )}
      />
    </View>
  );
}