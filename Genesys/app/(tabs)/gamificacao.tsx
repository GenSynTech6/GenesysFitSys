import React, { useEffect, useState, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Colors } from "../../constants/colors";
import { DrawerMenu } from "../../components/drawer-menu";

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
];

export default function StatusScreen() {
  const auth = getAuth();
  const db = getFirestore();
  
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);

  // Escuta os dados do Firebase
  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        setUserData(snapshot.data());
        setLoading(false);
      });
      return () => unsub();
    }
  }, []);

  // Lógica de RPG (Mesma da HomePage para consistência)
  const xpNecessario = useMemo(() => (userData?.level || 1) * 1000, [userData?.level]);
  const porcentagemXp = Math.min(100, Math.round(((userData?.xp || 0) / xpNecessario) * 100));
  
  const rankAtual = useMemo(() => {
    const nivel = userData?.level || 1;
    return RANK_SYSTEM.find(r => nivel >= r.min && nivel <= r.max)?.name || 'Monarca';
  }, [userData?.level]);

  // Função para gastar pontos de atributo
  const uparAtributo = async (atributo: string) => {
    if (userData?.pontos > 0) {
      const userRef = doc(db, "users", auth.currentUser!.uid);
      try {
        await updateDoc(userRef, {
          [atributo]: increment(1),
          pontos: increment(-1)
        });
      } catch (e) {
        Alert.alert("Erro", "Falha ao atualizar atributo.");
      }
    } else {
      Alert.alert("Sem Pontos", "Suba de nível para ganhar mais pontos de atributo!");
    }
  };

  // Ganhar XP salvando no banco
  const completarMissao = async (valor: number, titulo: string) => {
    const userRef = doc(db, "users", auth.currentUser!.uid);
    await updateDoc(userRef, { xp: increment(valor) });
    Alert.alert("Missão Concluída", `${titulo}\n+${valor} XP concedido!`);
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator color={Colors.gold} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.charcoal }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowDrawer(true)}>
          <Ionicons name="menu" size={32} color={Colors.gold} />
        </TouchableOpacity>

        <Text style={styles.title}>🏆 STATUS DO SISTEMA</Text>

        {/* Card do Jogador */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{userData?.username?.charAt(0).toUpperCase() || "G"}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.userName}>{userData?.username || "Guerreiro"}</Text>
            <View style={styles.rankBadge}>
               <Text style={styles.rankBadgeText}>{rankAtual}</Text>
            </View>
            <Text style={styles.xpDetail}>Nível {userData?.level || 1} • {userData?.xp || 0}/{xpNecessario} XP</Text>
          </View>
          <View style={styles.pointsDisplay}>
            <Text style={styles.pointsValue}>{userData?.pontos || 0}</Text>
            <Text style={styles.pointsLabel}>PONTOS</Text>
          </View>
        </View>

        {/* Barra de Progresso RPG */}
        <View style={styles.progressContainer}>
           <View style={styles.progressBarBg}>
              <View style={[styles.progressFill, { width: `${porcentagemXp}%` }]} />
           </View>
           <Text style={styles.progressText}>{porcentagemXp}% para o próximo Rank</Text>
        </View>

        

        {/* Atributos Editáveis */}
        <Text style={styles.sectionHeader}>⚔️ DISTRIBUIR ATRIBUTOS</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'FORÇA', val: userData?.forca || 1, key: 'forca', icon: 'fitness' },
            { label: 'RESIST.', val: userData?.resistencia || 1, key: 'resistencia', icon: 'shield' },
            { label: 'INTEL.', val: userData?.inteligencia || 1, key: 'inteligencia', icon: 'bulb' }
          ].map((stat, idx) => (
            <View key={idx} style={styles.statBox}>
              <Ionicons name={stat.icon as any} size={20} color={Colors.gold} />
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.val}</Text>
              <TouchableOpacity 
                style={[styles.plusButton, { opacity: (userData?.pontos || 0) > 0 ? 1 : 0.3 }]} 
                onPress={() => uparAtributo(stat.key)}
              >
                <Ionicons name="add" size={20} color={Colors.charcoal} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Missões Reais */}
        <Text style={styles.sectionHeader}>⚡ MISSÕES DIÁRIAS</Text>
        <TouchableOpacity style={styles.missionCard} onPress={() => completarMissao(50, "Treino de Hoje")}>
          <Ionicons name="barbell" size={24} color={Colors.gold} />
          <View style={{flex: 1, marginLeft: 15}}>
            <Text style={styles.missionText}>Treino Diário Completo</Text>
            <Text style={{color: '#666', fontSize: 11}}>Conclua uma sessão de treino</Text>
          </View>
          <Text style={styles.missionXp}>+50 XP</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.missionCard} onPress={() => completarMissao(30, "Dieta")}>
          <Ionicons name="restaurant" size={24} color={Colors.gold} />
          <View style={{flex: 1, marginLeft: 15}}>
            <Text style={styles.missionText}>Dieta Registrada</Text>
            <Text style={{color: '#666', fontSize: 11}}>Mantenha suas calorias no alvo</Text>
          </View>
          <Text style={styles.missionXp}>+30 XP</Text>
        </TouchableOpacity>

        {/* Recompensas de Pontos */}
        <Text style={styles.sectionHeader}>🛒 TROCAR PONTOS</Text>
        <TouchableOpacity 
            style={styles.rewardItem} 
            onPress={() => (userData?.pontos >= 5) ? Alert.alert("Sucesso", "Item resgatado!") : Alert.alert("Ops", "Necessário 5 pontos")}
        >
          <Text style={styles.rewardTitle}>Desbloquear Skin de Avatar</Text>
          <Text style={styles.rewardCost}>5 PTS</Text>
        </TouchableOpacity>

      </ScrollView>
      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loading: { flex: 1, backgroundColor: Colors.charcoal, justifyContent: 'center' },
  menuButton: { marginTop: 40, marginBottom: 20 },
  title: { color: Colors.gold, fontSize: 24, fontWeight: "900", textAlign: "center", letterSpacing: 2 },
  
  userCard: { 
    flexDirection: 'row', 
    backgroundColor: '#1a1a1a', 
    padding: 20, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#333',
    alignItems: 'center',
    marginVertical: 20
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.gold, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 28, fontWeight: 'bold', color: Colors.charcoal },
  userName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  rankBadge: { backgroundColor: '#333', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5, alignSelf: 'flex-start', marginTop: 5 },
  rankBadgeText: { color: Colors.gold, fontSize: 12, fontWeight: 'bold' },
  xpDetail: { color: '#888', fontSize: 11, marginTop: 8 },
  
  pointsDisplay: { alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#333', paddingLeft: 15 },
  pointsValue: { color: Colors.gold, fontSize: 24, fontWeight: 'bold' },
  pointsLabel: { color: '#666', fontSize: 9, fontWeight: 'bold' },

  progressContainer: { marginBottom: 30 },
  progressBarBg: { height: 10, backgroundColor: '#333', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.gold },
  progressText: { color: '#666', textAlign: 'center', fontSize: 11, marginTop: 8 },

  sectionHeader: { color: Colors.gold, fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginBottom: 15, opacity: 0.8 },
  
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statBox: { width: '30%', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  statLabel: { color: '#666', fontSize: 9, fontWeight: 'bold', marginTop: 5 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginVertical: 5 },
  plusButton: { backgroundColor: Colors.gold, padding: 5, borderRadius: 8 },

  missionCard: { flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  missionText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  missionXp: { color: Colors.gold, fontWeight: 'bold' },

  rewardItem: { backgroundColor: '#1a1a1a', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', borderLeftWidth: 4, borderLeftColor: Colors.gold },
  rewardTitle: { color: '#fff', fontWeight: '600' },
  rewardCost: { color: Colors.gold, fontWeight: 'bold' }
});