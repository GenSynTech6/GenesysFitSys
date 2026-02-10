import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { signOut } from "firebase/auth"; // Adicione o signOut
import { useRouter } from 'expo-router';


const { width } = Dimensions.get('window');

export default function HomePage() {
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Ta desistindo igual ela fez com vc?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            signOut(auth);
            router.replace('/(auth)/login'); // Redireciona para a tela de login após o logout
          }
        }
      ]
    );
  }


  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (doc) => {
        const data = doc.data();
        setUserData(data);
        if (data && (data.peso === 0 || data.altura === 0)) {
          setShowWelcome(true);
        }
      });
      return () => unsub();
    }
  }, []);

  const handleFirstUpdate = async () => {
    if (!peso || !altura) return Alert.alert("Ops!", "Preencha os dados para ganhar seu XP!");
    setSaving(true);
    try {
      const userRef = doc(db, "users", auth.currentUser!.uid);
      await updateDoc(userRef, {
        peso: parseFloat(peso.replace(',', '.')),
        altura: parseFloat(altura.replace(',', '.')),
        xp: increment(50),
        moedas: increment(10)
      });
      setShowWelcome(false);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  // Cálculo da barra de XP (Exemplo: 1000 XP por nível)
  const xpLimite = 1000;
  const porcentagemXP = Math.min((userData?.xp || 0) / xpLimite * 100, 100);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER COM PERFIL E MOEDAS */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.welcomeText}>Bem-vindo de volta,</ThemedText>
            <ThemedText type="title" style={styles.userName}>{userData?.username || 'Guerreiro'}</ThemedText>
          </View>
          <View style={styles.coinContainer}>
            <Ionicons name="flash" size={16} color="#FFD700" />
            <ThemedText style={styles.coinText}>{userData?.moedas || 0}</ThemedText>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#ff4444" />
            </TouchableOpacity>
        </View>

        {/* CARD DE NÍVEL E XP */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <ThemedText style={styles.levelLabel}>NÍVEL {userData?.level || 1}</ThemedText>
            <ThemedText style={styles.xpLabel}>{userData?.xp || 0} / {xpLimite} XP</ThemedText>
          </View>
          <View style={styles.xpBarBackground}>
            <View style={[styles.xpBarFill, { width: `${porcentagemXP}%` }]} />
          </View>
        </View>

        {/* GRID DE STATUS */}
        <View style={styles.statusGrid}>
          <View style={styles.statBox}>
            <Ionicons name="speedometer-outline" size={24} color="#FFD700" />
            <ThemedText style={styles.statValue}>{userData?.peso || '--'} kg</ThemedText>
            <ThemedText style={styles.statLabel}>Peso Atual</ThemedText>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="resize-outline" size={24} color="#FFD700" />
            <ThemedText style={styles.statValue}>{userData?.altura || '--'} m</ThemedText>
            <ThemedText style={styles.statLabel}>Altura</ThemedText>
          </View>
        </View>

        {/* ÁREA DE AÇÃO PRINCIPAL */}
        <TouchableOpacity style={styles.workoutAction}>
          <View style={styles.workoutTextContainer}>
            <ThemedText style={styles.workoutTitle}>Treino de Hoje</ThemedText>
            <ThemedText style={styles.workoutSub}>Ainda não iniciado</ThemedText>
          </View>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={28} color="#122620" />
          </View>
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL DE BOAS-VINDAS CUSTOMIZADO */}
      <Modal visible={showWelcome} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.trophyCircle}>
              <Ionicons name="ribbon" size={50} color="#FFD700" />
            </View>
            <ThemedText style={styles.modalTitle}>Inicie sua Jornada</ThemedText>
            <ThemedText style={styles.modalSub}>Precisamos de alguns dados para calibrar seus ganhos de XP.</ThemedText>

            <View style={styles.modalInputArea}>
              <TextInput 
                style={styles.modalInput} 
                placeholder="Peso (kg)" 
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                onChangeText={setPeso}
              />
              <TextInput 
                style={styles.modalInput} 
                placeholder="Altura (m)" 
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                onChangeText={setAltura}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleFirstUpdate} disabled={saving}>
              {saving ? <ActivityIndicator color="#122620" /> : (
                <ThemedText style={styles.saveButtonText}>RESGATAR RECOMPENSA 🎁</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, flex: 1, backgroundColor: '#122620' },
  scrollContent: { padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  welcomeText: { color: '#94a3b8', fontSize: 14 },
  userName: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  coinContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 5 },
  coinText: { color: '#FFD700', fontWeight: 'bold' },

  levelCard: { backgroundColor: '#0f172a', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1e293b', marginBottom: 20 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  levelLabel: { color: '#FFD700', fontWeight: '900', fontSize: 16 },
  xpLabel: { color: '#94a3b8', fontSize: 12 },
  xpBarBackground: { height: 8, backgroundColor: '#1e293b', borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: '#FFD700' },

  statusGrid: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  statBox: { flex: 1, backgroundColor: '#0f172a', padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  statLabel: { color: '#64748b', fontSize: 12 },

  workoutAction: { backgroundColor: '#FFD700', borderRadius: 25, padding: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  workoutTextContainer: { flex: 1 },
  workoutTitle: { color: '#020617', fontSize: 20, fontWeight: 'bold' },
  workoutSub: { color: '#020617', opacity: 0.7, fontSize: 14 },
  playCircle: { backgroundColor: '#fff', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },

  // Estilos do Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.95)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#0f172a', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#FFD70033' },
  trophyCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFD70015', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  modalSub: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  modalInputArea: { width: '100%', gap: 15, marginBottom: 25 },
  modalInput: { backgroundColor: '#020617', color: '#fff', padding: 18, borderRadius: 15, fontSize: 16, borderWidth: 1, borderColor: '#1e293b' },
  saveButton: { backgroundColor: '#FFD700', paddingVertical: 20, borderRadius: 18, width: '100%', alignItems: 'center', shadowColor: '#FFD700', shadowOpacity: 0.2, shadowRadius: 10 },
  saveButtonText: { color: '#020617', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.2)',
  },
});