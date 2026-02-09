import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomePage() {
  const auth = getAuth();
  const db = getFirestore();
  const [userData, setUserData] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (doc) => {
        const data = doc.data();
        setUserData(data);
        // Se peso ou altura forem 0, mostra o modal de boas-vindas
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
        xp: increment(50), // Recompensa!
        moedas: increment(10)
      });
      setShowWelcome(false);
      Alert.alert("Evolução!", "Você ganhou 50 XP e 10 Moedas por iniciar sua jornada!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar seus dados.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ... (Todo o seu Header e Barra de XP que fizemos antes) ... */}
        <ThemedText type="title" style={styles.levelTitle}>Nível {userData?.level || 1}</ThemedText>
        <ThemedText style={{color: '#fff'}}>XP: {userData?.xp || 0}</ThemedText>
      </ScrollView>

      {/* MODAL DE BOAS-VINDAS GAMIFICADO */}
      <Modal visible={showWelcome} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="trophy" size={60} color="#FFD700" />
            <ThemedText style={styles.modalTitle}>Bem-vindo ao GenesysFit!</ThemedText>
            <ThemedText style={styles.modalSub}>Complete seu perfil para ganhar recompensas.</ThemedText>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Peso (kg)</ThemedText>
                <TextInput 
                  style={styles.input} 
                  placeholder="80.5" 
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={peso}
                  onChangeText={setPeso}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Altura (m)</ThemedText>
                <TextInput 
                  style={styles.input} 
                  placeholder="1.75" 
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={altura}
                  onChangeText={setAltura}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleFirstUpdate} disabled={saving}>
              {saving ? <ActivityIndicator color="#122620" /> : (
                <ThemedText style={styles.saveButtonText}>RESGATAR 50 XP 🚀</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { padding: 25, paddingTop: 60 },
  levelTitle: { color: '#FFD700', fontSize: 32, fontWeight: '900' },
  
  // Estilos do Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#FFD700' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 15, textAlign: 'center' },
  modalSub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 25 },
  inputRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  inputGroup: { flex: 1 },
  label: { color: '#FFD700', fontSize: 12, marginBottom: 5, fontWeight: 'bold' },
  input: { backgroundColor: '#0F172A', color: '#fff', padding: 15, borderRadius: 12, fontSize: 18, textAlign: 'center' },
  saveButton: { backgroundColor: '#FFD700', paddingVertical: 18, paddingHorizontal: 30, borderRadius: 15, width: '100%', alignItems: 'center' },
  saveButtonText: { color: '#122620', fontWeight: 'bold', fontSize: 16 }
});