import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TextInput,
  Text,
  TouchableOpacity
} from "react-native";

import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function MembersListScreen({ navigation }) {

  const [members, setMembers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "members"), snap => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <FlatList
      data={members}
      keyExtractor={i => i.id}
      renderItem={({ item }) => (

        <View style={{ backgroundColor: "#fff", padding: 10, marginBottom: 5 }}>

          <Text>{item.name}</Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("MemberHistory", { member: item })
            }
          >
            <Text style={{ color: "blue" }}>View History</Text>
          </TouchableOpacity>

        </View>
      )}
    />
  );
}
