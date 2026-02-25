import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // Asegúrate de que la ruta sea correcta
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { authState } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!authState.user) return;

    // 1. Consultar todos los usuarios menos el actual
    const q = query(
      collection(db, "users"),
      where("uid", "!=", authState.user.uid)
    );

    // 2. Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let userList: any[] = [];
      snapshot.forEach((doc) => {
        userList.push(doc.data());
      });
      setUsers(userList);
    });

    return () => unsubscribe();
  }, [authState.user]);

  const renderUser = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => router.push({ pathname: '/../chat/[id]' as any, params: { id: item.uid, name: item.displayName } })}
    >
      <Image 
        source={{ uri: item.photoURL || 'https://i.pravatar.cc/150' }} 
        style={styles.userImage} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mensajes</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        renderItem={renderUser}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  userImage: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee' },
  userInfo: { marginLeft: 15 },
  userName: { fontSize: 18, fontWeight: '600' },
  userEmail: { fontSize: 14, color: '#666' }
});