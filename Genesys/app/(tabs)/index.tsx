import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, onSnapshot, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { gerarTreinoIA } from '../../services/gemini';
import { DrawerMenu } from '@/components/drawer-menu';
import { Colors } from "../../constants/colors";

const { width } = Dimensions.get('window');

// Sistema de Ranks baseado em Nível
const RANK_SYSTEM = [
  { min: 1, max: 5, name: "Aprendiz" },
  { min: 6, max: 10, name: "Rank E" },
  { min: 11, max: 20, name: "Rank D" },
  { min: 21, max: 35, name: "Rank C" },
  { min: 36, max: 45, name: "Rank B" },
  { min: 46, max: 55, name: "Rank A" },
  { min: 56, max: 70, name: "Rank S" },
  { min: 71, max: 85, name: "Rank S Internacional" },
  { min: 86, max: 100, name: "Monarca" },
  { min: 101, max: 9999, name: "ERROR" },
];

const getRank = (nivel: number): string => {
  const rank = RANK_SYSTEM.find(r => nivel >= r.min && nivel <= r.max);
  return rank?.name || 'Desconhecido';
};

export default function HomePage() {
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();
  
  const [userData, setUserData] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [loadingIA, setLoadingAI] = useState(false);
  const [aiResponse, setAIResponse] = useState("");

  // Estados do Treino
  const [isTraining, setIsTraining] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const xpLimite = 1000;

  // Monitor de Dados e Level Up
  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        const data = snapshot.data();
        if (data) {
          setUserData(data);
          
          // Verifica se precisa configurar perfil
          if (!data.peso || !data.altura) setShowWelcome(true);

          // Lógica de Ofensiva
          checkStreak(data);

          // Lógica de Level Up com XP acumulado
          if (data.xp >= xpLimite) {
            handleLevelUp(data.level || 1, data.xp);
          }
        }
      });
      return () => unsub();
    }
  }, []);

  // Lógica para validar ofensiva
  const checkStreak = async (data: any) => {
    if (!data.lastWorkoutDate) return;
    
    const hoje = new Date().toISOString().split('T')[0];
    const ultimaData = data.lastWorkoutDate;
    
    // Calcula diferença de dias
    const diffInDays = Math.floor((new Date(hoje).getTime() - new Date(ultimaData).getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays > 1 && data.streak > 0) {
      // Perdeu a ofensiva! Reset no Firebase
      await updateDoc(doc(db, "users", auth.currentUser!.uid), { streak: 0 });
    }
  };

  // Cronômetro do Treino
  useEffect(() => {
    let interval: any;
    if (isTraining) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTraining]);

  const handleLevelUp = async (currentLevel: number, currentXp: number) => {
    const userRef = doc(db, "users", auth.currentUser!.uid);
    const newLevel = currentLevel + 1;
    const sobraXP = currentXp - xpLimite; // Mantém o XP que passou do limite

    await updateDoc(userRef, {
      level: newLevel,
      xp: sobraXP,
      rank: getRank(newLevel)
    });
    Alert.alert("LEVEL UP! 🎊", `O Sistema reconheceu sua evolução. Você atingiu o nível ${newLevel}! Rank: ${getRank(newLevel)}`);
  };

  const handleAiConsult = async () => {
    if (loadingIA) return;
    setLoadingAI(true);
    try {
      const response = await gerarTreinoIA(userData);
      setAIResponse(response);
      Alert.alert("Personal IA 🤖", response);
    } catch (error) {
      Alert.alert("Erro", "O Sistema de IA está instável. Tente novamente.");
    } finally {
      setLoadingAI(false);
    }
  };

  const finishWorkout = async () => {
    if (seconds < 60) return Alert.alert("Treino muito curto", "O Sistema exige pelo menos 1 minuto de esforço para validar XP.");
    
    setIsTraining(false);
    setSaving(true);
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const userRef = doc(db, "users", auth.currentUser!.uid);
      
      await updateDoc(userRef, {
        xp: increment(150),
        moedas: increment(30),
        streak: increment(userData?.lastWorkoutDate === hoje ? 0 : 1), // Só aumenta streak 1x por dia
        lastWorkoutDate: hoje
      });
      
      setSeconds(0);
      Alert.alert("Missão Cumprida!", "Você ganhou 150 XP e 30 Moedas!");
    } catch (e) {
      Alert.alert("Erro", "Falha ao salvar progresso.");
    } finally { 
        setSaving(false); 
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  const porcentagemXP = Math.min((userData?.xp || 0) / xpLimite * 100, 100);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowDrawer(true)}>
            <Ionicons name="menu" size={28} color="#FFD700" />
          </TouchableOpacity>
          <View>
            <ThemedText style={styles.welcomeText}>Bem-vindo, guerreiro</ThemedText>
            <ThemedText type="title" style={styles.userName}>{userData?.username || 'Usuário'}</ThemedText>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.coinContainer}>
              <Ionicons name="flash" size={16} color="#FFD700" />
              <ThemedText style={styles.coinText}>{userData?.moedas || 0}</ThemedText>
            </View>
            <View style={[styles.coinContainer, { backgroundColor: '#2d1a01' }]}>
                <Ionicons name="flame" size={16} color="#FF4500" />
                <ThemedText style={{color: '#FF4500', fontWeight: 'bold'}}>{userData?.streak || 0}</ThemedText>
            </View>
          </View>
        </View>

        {/* PROGRESS CARD */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <ThemedText style={styles.levelLabel}>NÍVEL {userData?.level || 1}</ThemedText>
            <ThemedText style={styles.levelLabel}>{userData?.rank || "Iniciante"}</ThemedText>
            <ThemedText style={styles.xpLabel}>{userData?.xp || 0} / {xpLimite} XP</ThemedText>
          </View>
          <View style={styles.xpBarBackground}>
            <View style={[styles.xpBarFill, { width: `${porcentagemXP}%` }]} />
          </View>
        </View>

        {/* STATUS GRID */}
        <View style={styles.statusGrid}>
          <View style={styles.statBox}>
            <Ionicons name="speedometer-outline" size={22} color="#FFD700" />
            <ThemedText style={styles.statValue}>{userData?.peso || '--'} kg</ThemedText>
            <ThemedText style={styles.statLabel}>Peso</ThemedText>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="resize-outline" size={22} color="#FFD700" />
            <ThemedText style={styles.statValue}>{userData?.altura || '--'} m</ThemedText>
            <ThemedText style={styles.statLabel}>Altura</ThemedText>
          </View>
        </View>

        {/* WORKOUT SECTION */}
        <ThemedText style={styles.sectionTitle}>Missão Diária</ThemedText>
        {!isTraining ? (
          <TouchableOpacity style={styles.workoutAction} onPress={() => setIsTraining(true)}>
            <View style={styles.workoutTextContainer}>
              <ThemedText style={styles.workoutTitle}>Iniciar Treinamento</ThemedText>
              <ThemedText style={styles.workoutSub}>Ganhe XP e mantenha sua streak</ThemedText>
            </View>
            <View style={styles.playCircle}>
              <Ionicons name="play" size={24} color="#020617" />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.workoutAction, styles.activeWorkout]}>
            <View style={styles.workoutTextContainer}>
              <ThemedText style={[styles.workoutTitle, { color: '#FFD700' }]}>{formatTime(seconds)}</ThemedText>
              <ThemedText style={{ color: '#94a3b8' }}>Quebrando limites...</ThemedText>
            </View>
            <TouchableOpacity 
                style={styles.stopButton} 
                onPress={finishWorkout}
                disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name="stop" size={24} color="#fff" />}
            </TouchableOpacity>
          </View>
        )}

        {/* AI SPACE */}
        <TouchableOpacity
          style={[styles.aiCard, loadingIA && { opacity: 0.7 }]}
          onPress={handleAiConsult}
          disabled={loadingIA}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <Ionicons name="sparkles" size={20} color="#FFD700" />
              <ThemedText style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 12 }}>
                CONSELHO DO SISTEMA (IA)
              </ThemedText>
            </View>
            {loadingIA ? (
              <ActivityIndicator color="#FFD700" style={{ marginVertical: 10 }} />
            ) : (
              <ThemedText style={styles.aiText}>
                {aiResponse || "Toque para gerar um treino estratégico baseado no seu nível atual."}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL DE BOAS-VINDAS */}
      <Modal visible={showWelcome} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="shield-checkmark" size={60} color="#FFD700" />
            <ThemedText style={styles.modalTitle}>Identificação do Jogador</ThemedText>
            <View style={styles.modalInputArea}>
              <TextInput 
                style={styles.modalInput} 
                placeholder="Peso atual (kg)" 
                placeholderTextColor="#64748b" 
                keyboardType="numeric" 
                onChangeText={setPeso} 
              />
              <TextInput 
                style={styles.modalInput} 
                placeholder="Altura (ex: 1.75)" 
                placeholderTextColor="#64748b" 
                keyboardType="numeric" 
                onChangeText={setAltura} 
              />
            </View>
            <TouchableOpacity 
                style={styles.saveButton} 
                onPress={async () => {
                    if(!peso || !altura) return Alert.alert("Aviso", "Preencha todos os campos.");
                    setSaving(true);
                    await updateDoc(doc(db, "users", auth.currentUser!.uid), {
                        peso: parseFloat(peso),
                        altura: parseFloat(altura)
                    });
                    setSaving(false);
                    setShowWelcome(false);
                }}
            >
              <ThemedText style={styles.saveButtonText}>CONFIRMAR STATUS</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.charcoal }, 
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  welcomeText: { color: '#64748b', fontSize: 12 },
  userName: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  coinContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, gap: 4 },
  coinText: { color: '#FFD700', fontWeight: 'bold', fontSize: 14 },

  levelCard: { backgroundColor: '#0f172a', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1e293b', marginBottom: 20 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  levelLabel: { color: '#FFD700', fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase' },
  xpLabel: { color: '#64748b', fontSize: 11 },
  xpBarBackground: { height: 8, backgroundColor: '#1e293b', borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: '#FFD700' },

  statusGrid: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  statBox: { flex: 1, backgroundColor: '#0f172a', padding: 15, borderRadius: 18, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: '#FFD700' },
  statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  statLabel: { color: '#64748b', fontSize: 10, textTransform: 'uppercase' },

  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  workoutAction: { backgroundColor: '#FFD700', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center' },
  activeWorkout: { backgroundColor: '#0f172a', borderWidth: 2, borderColor: '#FFD700' },
  workoutTextContainer: { flex: 1 },
  workoutTitle: { color: '#020617', fontSize: 18, fontWeight: 'bold' },
  workoutSub: { color: '#020617', opacity: 0.7, fontSize: 11 },
  playCircle: { backgroundColor: '#020617', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  stopButton: { backgroundColor: '#ff4444', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  aiCard: { marginTop: 20, backgroundColor: '#1e293b', padding: 20, borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#FFD700' },
  aiText: { color: '#94a3b8', fontSize: 13, lineHeight: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 25 },
  modalContent: { backgroundColor: '#0f172a', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#FFD700' },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginVertical: 15, textAlign: 'center' },
  modalInputArea: { width: '100%', gap: 15, marginBottom: 25 },
  modalInput: { backgroundColor: '#020617', color: '#fff', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#1e293b', fontSize: 16 },
  saveButton: { backgroundColor: '#FFD700', padding: 20, borderRadius: 15, width: '100%', alignItems: 'center', elevation: 5 },
  saveButtonText: { fontWeight: '900', color: '#020617', fontSize: 16 }
});