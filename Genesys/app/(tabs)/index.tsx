import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { useRouter } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { gerarTreinoIA } from '../../services/gemini';
import { DrawerMenu } from '@/components/drawer-menu';

const { width } = Dimensions.get('window');

// Lógica de Rank Sincronizada
const RANK_SYSTEM = [
  { min: 1, max: 5, name: "APRENDIZ" },
  { min: 6, max: 10, name: "RANK E" },
  { min: 11, max: 20, name: "RANK D" },
  { min: 21, max: 35, name: "RANK C" },
  { min: 36, max: 45, name: "RANK B" },
  { min: 46, max: 55, name: "RANK A" },
  { min: 56, max: 70, name: "RANK S" },
  { min: 71, max: 85, name: "RANK S INTERNACIONAL" },
  { min: 86, max: 100, name: "MONARCA" },
];

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

  const [isTraining, setIsTraining] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const isVip = userData?.statusPagamento === 'ativo';
  const xpLimite = (userData?.level || 1) * 1000;
  
  const currentRank = useMemo(() => {
    if (isVip) return "RANK S (LEGACY)";
    const nivel = userData?.level || 1;
    return RANK_SYSTEM.find(r => nivel >= r.min && nivel <= r.max)?.name || 'MONARCA';
  }, [userData?.level, isVip]);

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        const data = snapshot.data();
        if (data) {
          setUserData(data);
          if (!data.peso || !data.altura) setShowWelcome(true);
          if (data.xp >= xpLimite) handleLevelUp(data.level || 1, data.xp);
        }
      });
      return () => unsub();
    }
  }, [userData?.xp]);

  const handleLevelUp = async (currentLevel: number, currentXp: number) => {
    const userRef = doc(db, "users", auth.currentUser!.uid);
    await updateDoc(userRef, {
      level: increment(1),
      xp: currentXp - xpLimite,
    });
    Alert.alert("[ SISTEMA ]", "EVOLUÇÃO DETECTADA. NÍVEL AUMENTADO.");
  };

  const handleAiConsult = async () => {
    if (!isVip) {
      Alert.alert(
        "[ ACESSO NEGADO ]",
        "ESTA FUNÇÃO REQUER AUTORIZAÇÃO DE RANK S.",
        [{ text: "FECHAR" }, { text: "EVOLUIR", onPress: () => router.push('/ContrataAssinatura') }]
      );
      return;
    }
    setLoadingAI(true);
    try {
      const response = await gerarTreinoIA(userData);
      setAIResponse(response);
      Alert.alert("[ IA ESTRATÉGICA ]", response);
    } catch (e) {
      Alert.alert("[ ERRO ]", "FALHA NA SINCRONIZAÇÃO.");
    } finally {
      setLoadingAI(false);
    }
  };

  const finishWorkout = async () => {
    if (seconds < 60) return Alert.alert("[ AVISO ]", "TEMPO DE MISSÃO INSUFICIENTE.");
    setIsTraining(false);
    setSaving(true);
    try {
      const hoje = new Date().toISOString().split('T')[0];
      await updateDoc(doc(db, "users", auth.currentUser!.uid), {
        xp: increment(150),
        moedas: increment(30),
        lastWorkoutDate: hoje,
        streak: increment(userData?.lastWorkoutDate === hoje ? 0 : 1)
      });
      setSeconds(0);
      Alert.alert("[ MISSÃO CUMPRIDA ]", "RECOMPENSAS CREDITADAS NO INVENTÁRIO.");
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER SISTEMA */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowDrawer(true)} style={styles.menuBox}>
            <Ionicons name="grid-outline" size={24} color="#22d3ee" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <ThemedText style={styles.systemStatus}>SISTEMA_ATIVO</ThemedText>
            <ThemedText style={styles.userName}>{userData?.username?.toUpperCase() || 'PLAYER_01'}</ThemedText>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.badge}>
              <Ionicons name="flash-sharp" size={14} color="#22d3ee" />
              <ThemedText style={styles.badgeText}>{userData?.moedas || 0}</ThemedText>
            </View>
            <View style={[styles.badge, { borderColor: '#ef4444' }]}>
              <Ionicons name="flame-sharp" size={14} color="#ef4444" />
              <ThemedText style={[styles.badgeText, { color: '#ef4444' }]}>{userData?.streak || 0}</ThemedText>
            </View>
          </View>
        </View>

        {/* NÚCLEO DE EVOLUÇÃO */}
        <View style={styles.levelCard}>
          <LinearGradient colors={['rgba(34, 211, 238, 0.1)', 'transparent']} style={styles.cardGlow} />
          <View style={styles.levelHeader}>
            <ThemedText style={styles.rankLabel}>{currentRank}</ThemedText>
            <ThemedText style={styles.xpInfo}>{userData?.xp || 0} / {xpLimite} XP</ThemedText>
          </View>
          <View style={styles.xpTrack}>
            <LinearGradient 
              colors={["#0891b2", "#22d3ee"]} 
              start={{x:0, y:0}} end={{x:1, y:0}}
              style={[styles.xpFill, { width: `${Math.min(((userData?.xp || 0) / xpLimite) * 100, 100)}%` }]} 
            />
          </View>
          <ThemedText style={styles.levelText}>NÍVEL ATUAL: {userData?.level || 1}</ThemedText>
        </View>

        {/* GRID DE BIOMETRIA */}
        <View style={styles.statusGrid}>
          {[
            { label: 'BIOTIPO', val: userData?.biotipo || 'N/A', icon: 'body-sharp' },
            { label: 'PESO_KG', val: `${userData?.peso || '0'}`, icon: 'fitness-sharp' },
            { label: 'ALTURA_M', val: `${userData?.altura || '0'}`, icon: 'barcode-sharp' }
          ].map((item, i) => (
            <View key={i} style={styles.statBox}>
              <Ionicons name={item.icon as any} size={18} color="#22d3ee" />
              <ThemedText style={styles.statValue}>{item.val}</ThemedText>
              <ThemedText style={styles.statLabel}>{item.label}</ThemedText>
            </View>
          ))}
        </View>

        {/* MISSÃO DIÁRIA */}
        <ThemedText style={styles.sectionHeader}>// MISSÃO_DE_HOJE</ThemedText>
        {!isTraining ? (
          <TouchableOpacity style={styles.missionCard} onPress={() => setIsTraining(true)}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.missionTitle}>INICIAR PROTOCOLO</ThemedText>
              <ThemedText style={styles.missionSub}>RECOMPENSA: +150 XP | +30 CRÉDITOS</ThemedText>
            </View>
            <View style={styles.missionIconBox}>
              <Ionicons name="play-sharp" size={24} color="#000" />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.missionCard, styles.missionActive]}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.timerText}>{formatTime(seconds)}</ThemedText>
              <ThemedText style={styles.missionSub}>MONITORANDO ATIVIDADE VITAL...</ThemedText>
            </View>
            <TouchableOpacity style={styles.stopBtn} onPress={finishWorkout} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name="stop-sharp" size={24} color="#fff" />}
            </TouchableOpacity>
          </View>
        )}

        {/* IA ESTRATÉGICA */}
        <TouchableOpacity 
          style={[styles.aiSection, !isVip && { opacity: 0.6 }]} 
          onPress={handleAiConsult}
          disabled={loadingIA}
        >
          <View style={styles.aiHeader}>
            <Ionicons name="aperture-sharp" size={20} color="#22d3ee" />
            <ThemedText style={styles.aiTitle}>IA_CONSULTOR_DE_RANK</ThemedText>
            {!isVip && <Ionicons name="lock-closed-sharp" size={14} color="#475569" />}
          </View>
          <ThemedText style={styles.aiBody}>
            {loadingIA ? "PROCESSANDO DADOS..." : (aiResponse || "SOLICITAR ANÁLISE DE TREINO PARA O SISTEMA.")}
          </ThemedText>
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL INICIAL */}
      <Modal visible={showWelcome} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalHeading}>REGISTRO_DE_CAÇADOR</ThemedText>
            <TextInput style={styles.modalInput} placeholder="PESO (KG)" placeholderTextColor="#475569" keyboardType="numeric" onChangeText={setPeso} />
            <TextInput style={styles.modalInput} placeholder="ALTURA (M)" placeholderTextColor="#475569" keyboardType="numeric" onChangeText={setAltura} />
            <TouchableOpacity style={styles.saveBtn} onPress={async () => {
              const p = parseFloat(peso.replace(',', '.'));
              const a = parseFloat(altura.replace(',', '.'));
              await updateDoc(doc(db, "users", auth.currentUser!.uid), { peso: p, altura: a });
              setShowWelcome(false);
            }}>
              <ThemedText style={styles.saveBtnText}>VINCULAR AO SISTEMA</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 25, paddingTop: 60 },
  
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  menuBox: { width: 45, height: 45, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)', justifyContent: 'center', alignItems: 'center' },
  systemStatus: { color: '#22d3ee', fontSize: 8, fontWeight: '900', letterSpacing: 2 },
  userName: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  headerStats: { flexDirection: 'row', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#22d3ee', borderRadius: 2 },
  badgeText: { color: '#22d3ee', fontWeight: '900', fontSize: 12 },

  levelCard: { backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 20, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.1)', marginBottom: 25 },
  cardGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 60 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  rankLabel: { color: '#22d3ee', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  xpInfo: { color: '#475569', fontSize: 10, fontWeight: '900' },
  xpTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 10 },
  xpFill: { height: '100%' },
  levelText: { color: '#fff', fontSize: 10, fontWeight: '900', textAlign: 'right', opacity: 0.6 },

  statusGrid: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  statBox: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.3)', padding: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.05)' },
  statValue: { color: '#fff', fontSize: 14, fontWeight: '900', marginTop: 8 },
  statLabel: { color: '#475569', fontSize: 8, fontWeight: '900', marginTop: 2 },

  sectionHeader: { color: '#22d3ee', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 15 },
  missionCard: { backgroundColor: '#22d3ee', padding: 20, flexDirection: 'row', alignItems: 'center', borderRadius: 2 },
  missionActive: { backgroundColor: '#000', borderWidth: 1, borderColor: '#22d3ee' },
  missionTitle: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  missionSub: { color: 'rgba(0,0,0,0.6)', fontSize: 9, fontWeight: '900', marginTop: 4 },
  missionIconBox: { backgroundColor: '#000', width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  timerText: { color: '#22d3ee', fontSize: 24, fontWeight: '900', fontStyle: 'italic' },
  stopBtn: { backgroundColor: '#ef4444', width: 45, height: 45, justifyContent: 'center', alignItems: 'center' },

  aiSection: { marginTop: 20, backgroundColor: 'rgba(34, 211, 238, 0.03)', padding: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(34, 211, 238, 0.3)' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  aiTitle: { color: '#22d3ee', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  aiBody: { color: '#64748b', fontSize: 12, lineHeight: 18, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 30 },
  modalContent: { backgroundColor: '#020617', padding: 30, borderWidth: 1, borderColor: '#22d3ee' },
  modalHeading: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 25, letterSpacing: 2 },
  modalInput: { backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#fff', padding: 15, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.1)', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#22d3ee', padding: 18, alignItems: 'center' },
  saveBtnText: { color: '#000', fontWeight: '900', fontSize: 14 }
});