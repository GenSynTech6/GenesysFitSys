import React, { useEffect, useState, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, Modal, TextInput, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { DrawerMenu } from "../../components/drawer-menu";

const { width } = Dimensions.get('window');

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

const BIOTIPOS_DATA = [
    { id: 'ECTOMORFO', desc: 'DIF_PESO: ALTA | MASSA: BAIXA' },
    { id: 'MESOMORFO', desc: 'DIF_PESO: MÉDIA | MASSA: ALTA' },
    { id: 'ENDOMORFO', desc: 'DIF_PESO: BAIXA | GORDURA: ALTA' }
];

export default function StatusScreen() {
  const auth = getAuth();
  const db = getFirestore();
  
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  
  const [modalPerfil, setModalPerfil] = useState(false);
  const [modalTreino, setModalTreino] = useState<any>(null);

  const [novoPeso, setNovoPeso] = useState('');
  const [novaAltura, setNovaAltura] = useState('');
  const [novoBiotipo, setNovoBiotipo] = useState('');

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        const data = snapshot.data();
        setUserData(data);
        setNovoPeso(data?.peso?.toString() || '');
        setNovaAltura(data?.altura?.toString() || '');
        setNovoBiotipo(data?.biotipo || '');
        setLoading(false);
      });
      return () => unsub();
    }
  }, []);

  const xpNecessario = useMemo(() => (userData?.level || 1) * 1000, [userData?.level]);
  const porcentagemXp = Math.min(100, Math.round(((userData?.xp || 0) / xpNecessario) * 100));
  
  const rankAtual = useMemo(() => {
    const nivel = userData?.level || 1;
    return RANK_SYSTEM.find(r => nivel >= r.min && nivel <= r.max)?.name || 'MONARCA';
  }, [userData?.level]);

  const atualizarPerfil = async () => {
    const userRef = doc(db, "users", auth.currentUser!.uid);
    await updateDoc(userRef, {
        peso: parseFloat(novoPeso),
        altura: parseFloat(novaAltura),
        biotipo: novoBiotipo
    });
    setModalPerfil(false);
    Alert.alert("[ SISTEMA ]", "DADOS BIOMÉTRICOS ATUALIZADOS.");
  };

  const uparAtributo = async (atributo: string) => {
    if (userData?.pontos > 0) {
      const userRef = doc(db, "users", auth.currentUser!.uid);
      await updateDoc(userRef, { [atributo]: increment(1), pontos: increment(-1) });
    }
  };

  if (loading) return (
    <LinearGradient colors={["#000", "#020617"]} style={styles.loading}>
        <ActivityIndicator color="#22d3ee" />
    </LinearGradient>
  );

  return (
    <LinearGradient colors={["#000000", "#020617", "#0f172a"]} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* HEADER SISTEMA */}
        <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setShowDrawer(true)} style={styles.menuBox}>
                <Ionicons name="grid-outline" size={24} color="#22d3ee" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalPerfil(true)} style={styles.settingsBox}>
                <Ionicons name="construct-outline" size={16} color="#22d3ee" />
                <Text style={styles.settingsText}>RECALIBRAR_BIO</Text>
            </TouchableOpacity>
        </View>

        <Text style={styles.mainTitle}>JANELA_DE_STATUS</Text>

        {/* HUNTER ID CARD */}
        <View style={styles.hunterCard}>
          <LinearGradient colors={['rgba(34, 211, 238, 0.1)', 'transparent']} style={styles.cardGlow} />
          <View style={styles.avatarBox}>
            <Text style={styles.avatarLetter}>{userData?.username?.charAt(0).toUpperCase() || "J"}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 18 }}>
            <Text style={styles.systemTag}>SISTEMA_GENESYS // USUÁRIO</Text>
            <Text style={styles.userName}>{userData?.username?.toUpperCase()}</Text>
            <View style={styles.rankContainer}>
               <Text style={styles.rankText}>{rankAtual}</Text>
            </View>
          </View>
          <View style={styles.pointsColumn}>
            <Text style={styles.pointsVal}>{userData?.pontos || 0}</Text>
            <Text style={styles.pointsLab}>PONTOS_RESTANTES</Text>
          </View>
        </View>

        {/* NÍVEL E NÚCLEO DE XP */}
        <View style={styles.xpBox}>
            <View style={styles.xpInfoRow}>
                <Text style={styles.levelLabel}>NÍVEL <Text style={{color: '#fff'}}>{userData?.level || 1}</Text></Text>
                <Text style={styles.xpLabel}>{userData?.xp || 0} / {xpNecessario} XP_CORE</Text>
            </View>
            <View style={styles.xpTrack}>
                <LinearGradient 
                    colors={["#0891b2", "#22d3ee"]} 
                    start={{x:0, y:0}} end={{x:1, y:0}}
                    style={[styles.xpFill, { width: `${porcentagemXp}%` }]} 
                />
            </View>
        </View>

        {/* GRID DE ATRIBUTOS */}
        <Text style={styles.sectionTitle}>// DISTRIBUIÇÃO_DE_ATRIBUTOS</Text>
        <View style={styles.attrGrid}>
          {[
            { label: 'FORÇA', val: userData?.forca || 1, key: 'forca', icon: 'flash-sharp' },
            { label: 'AGILIDADE', val: userData?.resistencia || 1, key: 'resistencia', icon: 'speed-sharp' },
            { label: 'INTELIGÊNCIA', val: userData?.inteligencia || 1, key: 'inteligencia', icon: 'eye-sharp' }
          ].map((stat, idx) => (
            <View key={idx} style={styles.attrBox}>
              <Text style={styles.attrLabel}>{stat.label}</Text>
              <Text style={styles.attrValue}>{stat.val}</Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.upgradeBtn, { backgroundColor: (userData?.pontos || 0) > 0 ? '#22d3ee' : '#1e293b' }]} 
                onPress={() => uparAtributo(stat.key)}
              >
                <Ionicons name="chevron-up-sharp" size={16} color="#000" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* PROTOCOLOS DE TREINO */}
        <Text style={styles.sectionTitle}>// PROTOCOLOS_DE_BATALHA_REGISTRADOS</Text>
        {userData?.rotinasPersonalizadas?.length > 0 ? (
            userData.rotinasPersonalizadas.map((treino: any) => (
                <TouchableOpacity 
                    key={treino.id} 
                    style={styles.protocolCard}
                    onPress={() => setModalTreino(treino)}
                >
                    <View style={styles.protocolIcon}>
                        <Ionicons name="document-lock-sharp" size={20} color="#22d3ee" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.protocolTitle}>{treino.nome.toUpperCase()}</Text>
                        <Text style={styles.protocolSub}>{treino.exercicios.length} SUB-ROTINAS ATIVAS</Text>
                    </View>
                    <Ionicons name="qr-code-sharp" size={18} color="rgba(34, 211, 238, 0.4)" />
                </TouchableOpacity>
            ))
        ) : (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>NENHUM PROTOCOLO DETECTADO NO GRIMÓRIO.</Text>
            </View>
        )}

      </ScrollView>

      {/* MODAL RECALIBRAGEM */}
      <Modal visible={modalPerfil} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalBody}>
                <Text style={styles.modalHeading}>RECALIBRAGEM_BIO</Text>
                
                <View style={styles.bioInputRow}>
                    <View style={{flex: 1}}>
                        <Text style={styles.bioLabel}>MASSA_KG</Text>
                        <TextInput style={styles.bioInput} value={novoPeso} onChangeText={setNovoPeso} keyboardType="numeric" placeholderTextColor="#475569" />
                    </View>
                    <View style={{flex: 1, marginLeft: 15}}>
                        <Text style={styles.bioLabel}>ALTURA_M</Text>
                        <TextInput style={styles.bioInput} value={novaAltura} onChangeText={setNovaAltura} keyboardType="numeric" placeholderTextColor="#475569" />
                    </View>
                </View>

                <Text style={styles.bioLabel}>BIOTIPO_ALVO</Text>
                {BIOTIPOS_DATA.map(b => (
                    <TouchableOpacity 
                        key={b.id} 
                        style={[styles.bioItem, novoBiotipo === b.id && styles.bioItemActive]}
                        onPress={() => setNovoBiotipo(b.id)}
                    >
                        <Text style={[styles.bioTitle, novoBiotipo === b.id && {color: '#000'}]}>{b.id}</Text>
                        <Text style={[styles.bioSub, novoBiotipo === b.id && {color: '#000'}]}>{b.desc}</Text>
                    </TouchableOpacity>
                ))}

                <View style={styles.modalActions}>
                    <TouchableOpacity onPress={() => setModalPerfil(false)}>
                        <Text style={styles.cancelText}>ABORTAR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmBtn} onPress={atualizarPerfil}>
                        <Text style={styles.confirmBtnText}>EXECUTAR_UPDATE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      {/* MODAL VIEW PROTOCOLO */}
      <Modal visible={!!modalTreino} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.protocolDetails}>
                <View style={styles.protocolHeader}>
                    <Text style={styles.protocolDetailTitle}>{modalTreino?.nome.toUpperCase()}</Text>
                    <TouchableOpacity onPress={() => setModalTreino(null)}>
                        <Ionicons name="close-circle-sharp" size={28} color="#ef4444" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={{marginTop: 15}}>
                    {modalTreino?.exercicios.map((ex: string, i: number) => (
                        <View key={i} style={styles.subRoutineItem}>
                            <Text style={styles.subNumber}>{String(i + 1).padStart(2, '0')}</Text>
                            <Text style={styles.subText}>{ex.toUpperCase()}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
      </Modal>

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 25 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: 20 },
  menuBox: { width: 45, height: 45, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(34, 211, 238, 0.05)' },
  settingsBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 10, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)' },
  settingsText: { color: '#22d3ee', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  
  mainTitle: { color: '#fff', fontSize: 20, fontWeight: "900", textAlign: "center", letterSpacing: 4, marginBottom: 30, fontStyle: 'italic' },
  
  hunterCard: { flexDirection: 'row', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 20, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.15)', alignItems: 'center', marginBottom: 25 },
  cardGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 80 },
  avatarBox: { width: 60, height: 60, borderWidth: 1, borderColor: '#22d3ee', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(34, 211, 238, 0.1)' },
  avatarLetter: { fontSize: 28, fontWeight: '900', color: '#fff' },
  systemTag: { color: '#22d3ee', fontSize: 8, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  userName: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  rankContainer: { backgroundColor: 'rgba(34, 211, 238, 0.1)', paddingHorizontal: 10, paddingVertical: 3, marginTop: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)' },
  rankText: { color: '#22d3ee', fontSize: 10, fontWeight: '900' },
  pointsColumn: { alignItems: 'center', paddingLeft: 15, borderLeftWidth: 1, borderLeftColor: 'rgba(34, 211, 238, 0.1)' },
  pointsVal: { color: '#22d3ee', fontSize: 26, fontWeight: '900', fontStyle: 'italic' },
  pointsLab: { color: '#475569', fontSize: 7, fontWeight: '900' },

  xpBox: { marginBottom: 35 },
  xpInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  levelLabel: { color: '#22d3ee', fontSize: 10, fontWeight: '900' },
  xpLabel: { color: '#475569', fontSize: 9, fontWeight: '900' },
  xpTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  xpFill: { height: '100%' },

  sectionTitle: { color: '#22d3ee', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 18, opacity: 0.8 },
  
  attrGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35 },
  attrBox: { width: '31%', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.1)' },
  attrLabel: { color: '#475569', fontSize: 8, fontWeight: '900' },
  attrValue: { color: '#fff', fontSize: 24, fontWeight: '900', marginVertical: 10, fontStyle: 'italic' },
  upgradeBtn: { width: '100%', height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 2 },

  protocolCard: { flexDirection: 'row', backgroundColor: 'rgba(15, 23, 42, 0.3)', padding: 18, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.05)', borderLeftWidth: 3, borderLeftColor: '#22d3ee' },
  protocolIcon: { backgroundColor: 'rgba(34, 211, 238, 0.05)', padding: 10, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.1)' },
  protocolTitle: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  protocolSub: { color: '#475569', fontSize: 10, marginTop: 4, fontWeight: 'bold' },
  emptyContainer: { padding: 30, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)', borderStyle: 'dashed' },
  emptyText: { color: '#475569', fontSize: 10, fontWeight: '900', textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 25 },
  modalBody: { backgroundColor: '#020617', padding: 25, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)' },
  modalHeading: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 25, letterSpacing: 3, fontStyle: 'italic' },
  bioInputRow: { flexDirection: 'row', marginBottom: 20 },
  bioLabel: { color: '#22d3ee', fontSize: 9, fontWeight: '900', marginBottom: 8, letterSpacing: 1 },
  bioInput: { backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#fff', padding: 12, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.1)', fontWeight: 'bold' },
  bioItem: { backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 15, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  bioItemActive: { backgroundColor: '#22d3ee', borderColor: '#22d3ee' },
  bioTitle: { color: '#22d3ee', fontWeight: '900', fontSize: 14 },
  bioSub: { color: '#475569', fontSize: 9, marginTop: 4, fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30 },
  cancelText: { color: '#475569', fontWeight: '900', fontSize: 12 },
  confirmBtn: { backgroundColor: '#22d3ee', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 2 },
  confirmBtnText: { color: '#000', fontWeight: '900', fontSize: 12 },

  protocolDetails: { backgroundColor: '#000', padding: 25, maxHeight: '85%', borderWidth: 1, borderColor: '#22d3ee' },
  protocolHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(34, 211, 238, 0.1)', paddingBottom: 20 },
  protocolDetailTitle: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  subRoutineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: 'rgba(34, 211, 238, 0.03)', padding: 15, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.05)' },
  subNumber: { color: '#22d3ee', fontWeight: '900', marginRight: 15, fontSize: 16, fontStyle: 'italic' },
  subText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 1 }
});