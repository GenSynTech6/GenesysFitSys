import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getFirestore, doc, onSnapshot, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { DrawerMenu } from "../../components/drawer-menu";

const { width } = Dimensions.get('window');

export default function PontoScreen() {
  const auth = getAuth();
  const db = getFirestore();
  
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        setUserData(snapshot.data());
        setLoading(false);
      });
      return () => unsub();
    }
  }, []);

  const baterPonto = async () => {
    if (!auth.currentUser || !userData) return;

    const hoje = new Date().toISOString().split('T')[0];
    const ultimaData = userData.lastWorkoutDate;

    if (ultimaData === hoje) {
      Alert.alert("[ STATUS: CONCLUÍDO ]", "A OFENSIVA DE HOJE JÁ FOI REGISTRADA. SISTEMA EM STANDBY ATÉ O PRÓXIMO CICLO.");
      return;
    }

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      await updateDoc(userRef, {
        streak: increment(1),
        xp: increment(100),
        moedas: increment(50),
        lastWorkoutDate: hoje,
        lastUpdated: serverTimestamp()
      });

      Alert.alert("[ OFENSIVA SINCRONIZADA ]", "RECURSOS ADQUIRIDOS: +100 XP | +50 CRÉDITOS.");
    } catch (error) {
      Alert.alert("[ ERRO ]", "FALHA NA CONEXÃO COM O NÚCLEO GENESYS.");
    }
  };

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator color="#22d3ee" />
    </View>
  );

  return (
    <LinearGradient colors={["#000", "#020617"]} style={styles.container}>
      
      {/* HEADER TÉCNICO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowDrawer(true)} style={styles.menuBox}>
          <Ionicons name="grid-outline" size={24} color="#22d3ee" />
        </TouchableOpacity>
        <Text style={styles.headerTag}>SISTEMA // PROTOCOLO_PRESENÇA</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark-sharp" size={60} color="#22d3ee" />
          <View style={styles.pulseRing} />
        </View>

        <Text style={styles.title}>VALIDAÇÃO_DE_OFENSIVA</Text>
        
        {/* CARD DE STREAK (STREAK HUB) */}
        <View style={styles.streakCard}>
          <LinearGradient colors={['rgba(34, 211, 238, 0.05)', 'transparent']} style={styles.cardGlow} />
          <Ionicons name="flame-sharp" size={32} color="#ef4444" />
          <Text style={styles.streakNumber}>{userData?.streak || 0}</Text>
          <Text style={styles.streakLabel}>DIAS_EM_ATIVIDADE</Text>
        </View>

        <Text style={styles.infoText}>
          MANTENHA A CONSTÂNCIA PARA EVITAR A DEGRADAÇÃO DO SEU RANK E GARANTIR O FLUXO DE RECURSOS.
        </Text>

        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.mainButton} 
          onPress={baterPonto}
        >
          <LinearGradient 
            colors={["#22d3ee", "#0891b2"]} 
            start={{x:0, y:0}} end={{x:1, y:0}}
            style={styles.gradientBtn}
          >
            <Text style={styles.buttonText}>SINCRONIZAR AGORA</Text>
            <Ionicons name="finger-print-sharp" size={20} color="#000" style={{marginLeft: 10}} />
          </LinearGradient>
        </TouchableOpacity>

        {/* RECOMPENSAS ESTIMADAS */}
        <View style={styles.rewardsRow}>
            <View style={styles.rewardItem}>
                <Ionicons name="flash-sharp" size={14} color="#22d3ee" />
                <Text style={styles.rewardText}>+100_XP</Text>
            </View>
            <View style={styles.rewardItem}>
                <Ionicons name="cube-sharp" size={14} color="#22d3ee" />
                <Text style={styles.rewardText}>+50_CRED</Text>
            </View>
        </View>
      </View>

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 25 },
  loading: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, marginBottom: 20 },
  menuBox: { width: 45, height: 45, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(34, 211, 238, 0.05)' },
  headerTag: { color: '#22d3ee', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginLeft: 15 },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  iconContainer: { marginBottom: 30, alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)', opacity: 0.5 },

  title: { color: '#fff', fontSize: 18, fontWeight: "900", letterSpacing: 3, marginBottom: 40, fontStyle: 'italic' },
  
  streakCard: { 
    backgroundColor: 'rgba(15, 23, 42, 0.5)', 
    paddingVertical: 40, 
    width: '100%',
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.1)',
    marginBottom: 40,
    position: 'relative',
    overflow: 'hidden'
  },
  cardGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  streakNumber: { color: '#fff', fontSize: 72, fontWeight: '900', fontStyle: 'italic', marginVertical: 5 },
  streakLabel: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 2 },

  infoText: { color: '#475569', textAlign: 'center', marginBottom: 40, fontSize: 10, lineHeight: 16, fontWeight: '700', letterSpacing: 1 },
  
  mainButton: { width: '100%', height: 65, borderRadius: 2, overflow: 'hidden' },
  gradientBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#000', fontWeight: "900", fontSize: 16, letterSpacing: 1 },

  rewardsRow: { flexDirection: 'row', gap: 30, marginTop: 30 },
  rewardItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rewardText: { color: '#22d3ee', fontWeight: '900', fontSize: 10, letterSpacing: 1 }
});