import React, { useState, useMemo, useEffect } from "react"; 
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { DrawerMenu } from "../../components/drawer-menu";

const { width } = Dimensions.get('window');

const alimentosBase = [
  { nome: "ARROZ", calorias: 130 },
  { nome: "FEIJÃO", calorias: 90 },
  { nome: "FRANGO", calorias: 165 },
  { nome: "BATATA", calorias: 77 },
  { nome: "OVO", calorias: 155 },
  { nome: "WHEY PROTEIN", calorias: 120 },
];

export default function DietaScreen() {
  const auth = getAuth();
  const db = getFirestore();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [consumido, setConsumido] = useState(0);
  const [busca, setBusca] = useState("");
  const [quantidade, setQuantidade] = useState("100");
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

  const resultado = useMemo(() => {
    if (!busca) return [];
    return alimentosBase.filter((item) =>
      item.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [busca]);

  const metaKcal = userData?.metaCalorica || 2000;
  const porcentagem = Math.min(100, Math.round((consumido / metaKcal) * 100));

  const adicionarConsumo = async (alimento: { nome: string; calorias: number }) => {
    const qtd = Number(quantidade) || 0;
    const kcal = (alimento.calorias * qtd) / 100;
    setConsumido(prev => prev + kcal);

    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { xp: increment(5) });
    }

    if (consumido + kcal > metaKcal) {
      Alert.alert("[ ALERTA DE SISTEMA ]", "EXCESSO DE CALORIAS DETECTADO. O RANK PODE SER AFETADO.");
    }
  };

  const atualizarMetaFirebase = async (valor: string) => {
    const novaMeta = Number(valor);
    if (novaMeta > 0 && auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { metaCalorica: novaMeta });
    }
  };

  if (loading) return (
    <LinearGradient colors={["#000", "#020617"]} style={styles.loading}>
      <ActivityIndicator color="#22d3ee" />
    </LinearGradient>
  );

  return (
    <LinearGradient colors={["#000000", "#020617", "#0f172a"]} style={styles.container}>
      
      {/* HEADER PROTOCOLO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowDrawer(true)} style={styles.menuBox}>
          <Ionicons name="grid-outline" size={24} color="#22d3ee" />
        </TouchableOpacity>
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.systemTag}>[ SISTEMA GENESYS ]</Text>
          <Text style={styles.title}>DIETA_&_ALQUIMIA</Text>
        </View>
      </View>
      
      {/* STATUS WINDOW (USER CARD) */}
      <View style={styles.statusWindow}>
        <View style={styles.avatarBorder}>
          <Text style={styles.avatarText}>{userData?.username?.charAt(0).toUpperCase() || "J"}</Text>
        </View>
        <View style={styles.statusInfo}>
          <Text style={styles.userName}>{userData?.username?.toUpperCase() || "JOGADOR"}</Text>
          <Text style={styles.rankText}>CLASSE: <Text style={{color: '#22d3ee'}}>{userData?.rank?.toUpperCase() || "F-RANK"}</Text></Text>
        </View>
        <View style={styles.xpIndicator}>
          <Text style={styles.xpVal}>{userData?.xp || 0}</Text>
          <Text style={styles.xpLabel}>XP_CORE</Text>
        </View>
      </View>

      {/* HUD DE CALORIAS */}
      <View style={styles.hudContainer}>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>OBJETIVO_DIÁRIO</Text>
          <Text style={styles.hudValue}>{metaKcal} <Text style={styles.unit}>KCAL</Text></Text>
        </View>
        <View style={styles.hudDivider} />
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>ABSORVIDO</Text>
          <Text style={[styles.hudValue, { color: consumido > metaKcal ? '#ef4444' : '#22d3ee' }]}>
            {consumido.toFixed(0)} <Text style={styles.unit}>KCAL</Text>
          </Text>
        </View>
      </View>

      {/* BARRA DE MANA (PROGRESSO) */}
      <View style={styles.manaContainer}>
        <View style={styles.manaBarBackground}>
          <LinearGradient 
            colors={["#0891b2", "#22d3ee"]} 
            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
            style={[styles.manaFill, { width: `${porcentagem}%` }]} 
          />
        </View>
        <Text style={styles.manaText}>{porcentagem}% DO PROTOCOLO CONCLUÍDO</Text>
      </View>

      {/* SCANNER DE SUPRIMENTOS (INPUTS) */}
      <View style={styles.scannerSection}>
        <TextInput
          style={styles.inputMeta}
          placeholder="REDEFINIR META_KCAL"
          placeholderTextColor="#475569"
          keyboardType="numeric"
          onSubmitEditing={(e) => atualizarMetaFirebase(e.nativeEvent.text)}
        />
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.inputField, { flex: 2 }]}
            placeholder="ESCANEAR ALIMENTO..."
            placeholderTextColor="#475569"
            value={busca}
            onChangeText={setBusca}
          />
          <TextInput
            style={[styles.inputField, { flex: 1, textAlign: 'center' }]}
            placeholder="QTD (G)"
            placeholderTextColor="#475569"
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <FlatList
        data={resultado}
        keyExtractor={(item) => item.nome}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemCard} onPress={() => adicionarConsumo(item)}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.nome}</Text>
              <Text style={styles.itemSub}>{item.calorias} KCAL / 100G</Text>
            </View>
            <View style={styles.addIconBox}>
                <Ionicons name="flash-sharp" size={18} color="#000" />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={busca.length > 0 ? <Text style={styles.emptyText}>NENHUM SUPRIMENTO ENCONTRADO NO DATABASE.</Text> : null}
      />

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 25 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: 60, flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  menuBox: { width: 45, height: 45, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(34, 211, 238, 0.05)' },
  systemTag: { color: '#22d3ee', fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  title: { color: '#fff', fontSize: 18, fontWeight: "900", fontStyle: 'italic' },
  
  statusWindow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 15, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.15)', marginBottom: 25 },
  avatarBorder: { width: 45, height: 45, borderWidth: 1, borderColor: '#22d3ee', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34, 211, 238, 0.1)' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  statusInfo: { flex: 1, marginLeft: 15 },
  userName: { color: '#fff', fontSize: 14, fontWeight: '900', fontStyle: 'italic' },
  rankText: { fontSize: 10, fontWeight: '900', marginTop: 2, color: '#475569' },
  xpIndicator: { alignItems: 'center', paddingLeft: 15, borderLeftWidth: 1, borderLeftColor: 'rgba(34, 211, 238, 0.1)' },
  xpVal: { color: '#22d3ee', fontSize: 18, fontWeight: '900' },
  xpLabel: { color: '#475569', fontSize: 8, fontWeight: '900' },

  hudContainer: { flexDirection: 'row', backgroundColor: 'rgba(2, 6, 23, 0.8)', padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.1)' },
  hudItem: { flex: 1, alignItems: 'center' },
  hudLabel: { color: '#22d3ee', fontSize: 9, fontWeight: '900', marginBottom: 5, opacity: 0.7 },
  hudValue: { color: '#fff', fontSize: 22, fontWeight: '900', fontStyle: 'italic' },
  hudDivider: { width: 1, height: '100%', backgroundColor: 'rgba(34, 211, 238, 0.1)' },
  unit: { fontSize: 10, color: '#475569' },

  manaContainer: { marginBottom: 30 },
  manaBarBackground: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  manaFill: { height: '100%', shadowColor: '#22d3ee', shadowRadius: 5, shadowOpacity: 0.5 },
  manaText: { color: '#475569', fontSize: 9, fontWeight: '900', marginTop: 8, textAlign: 'center', letterSpacing: 1 },

  scannerSection: { marginBottom: 20 },
  inputMeta: { backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 12, color: '#fff', fontSize: 11, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.1)', fontWeight: 'bold' },
  searchRow: { flexDirection: 'row', gap: 10 },
  inputField: { backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 15, color: '#fff', borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.1)', fontSize: 12, fontWeight: 'bold' },
  
  itemCard: { backgroundColor: 'rgba(15, 23, 42, 0.3)', padding: 18, marginVertical: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderLeftWidth: 3, borderLeftColor: '#22d3ee' },
  itemInfo: { flex: 1 },
  itemName: { color: '#fff', fontWeight: "900", fontSize: 14, letterSpacing: 1 },
  itemSub: { color: '#22d3ee', fontSize: 10, marginTop: 4, fontWeight: '700' },
  addIconBox: { backgroundColor: '#22d3ee', width: 35, height: 35, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#475569', textAlign: 'center', marginTop: 20, fontSize: 10, fontWeight: '900' }
});