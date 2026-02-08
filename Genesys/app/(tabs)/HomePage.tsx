import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCfTamd-cCerKdXxsl1SrOqKKKz5gf7qek",
  authDomain: "biosyntech-fe492.firebaseapp.com",
  projectId: "biosyntech-fe492",
  storageBucket: "biosyntech-fe492.firebasestorage.app",
  messagingSenderId: "731720654700",
  appId: "1:731720654700:web:40ecd6b5304b0cd1171d49"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = initializeAuth(app, {});

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || user.email || 'Usuário');
      } else {
        router.replace('/');
      }
    });
    return unsubscribe;
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao deslogar. Tente novamente.');
      console.error('Erro ao deslogar:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="fitness" size={60} color="#FFD700" />
          <ThemedText type="title" style={styles.title}>Bem-vindo!</ThemedText>
          <ThemedText style={styles.userName}>{userName}</ThemedText>
          <ThemedText style={styles.subtitle}>GenesysFitSys</ThemedText>
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.welcomeText}>Sua jornada fitness começa agora 💪</ThemedText>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <ThemedText style={styles.logoutText}>Sair</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#13966ecb', padding: 20 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', color: '#FFD700', marginBottom: 10 },
  userName: { fontSize: 18, color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#fff', opacity: 0.8 },
  content: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 14 },
  welcomeText: { fontSize: 18, color: '#fff', textAlign: 'center' },
  logoutButton: { flexDirection: 'row', backgroundColor: '#d00000', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});