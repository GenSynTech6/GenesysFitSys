import React, { useState, useMemo, useEffect } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { DrawerMenu } from "../../components/drawer-menu";

const { width } = Dimensions.get('window');

const alimentosBase = [
  { nome: "Arroz", calorias: 130, categoria: "CARBO" },
  { nome: "Feijão", calorias: 90, categoria: "FIBRA" },
  { nome: "Frango", calorias: 165, categoria: "PROT" },
  { nome: "Batata", calorias: 77, categoria: "CARBO" },
  { nome: "Ovo", calorias: 155, categoria: "PROT" },
  { nome: "Pão Integral", calorias: 250, categoria: "FIBRA" },
  { nome: "Banana", calorias: 89, categoria: "VIT" },
];

export default function PesquisaScreen() {
  const auth = getAuth();
  const db = getFirestore();
  
  const [busca, setBusca] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  
  const [kcalAdicionadasHoje, setKcalAdicionadasHoje] = useState(0);
  const LIMITE_DIARIO_XP = 200; 

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        const data = snapshot.data();
        setUserData(data);
        setKcalAdicionadasHoje(data?.farmDiario || 0);
        setLoading(false);
      });
      return () => unsub();
    }
  }, []);

  const resultado = useMemo(() => {
    return alimentosBase.filter((item) =>
      item.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [busca]);

  const handleAdicionar = async (item: any) => {
    if (!auth.currentUser) return;

    if (kcalAdicionadasHoje >= LIMITE_DIARIO_XP) {
      Alert.alert(
        "[ LIMITE ATINGIDO ]", 
        "A SINCRONIZAÇÃO DE XP PARA ESTE CICLO FOI CONCLUÍDA. NOVOS DADOS NÃO GERARÃO EVOLUÇÃO ATÉ O PRÓXIMO RESET."
      );
      return;
    }

    const userRef = doc(db, "users", auth.currentUser.uid);
    
    try {
      await updateDoc(userRef, {
        xp: increment(10), 
        farmDiario: increment(item.calorias) 
      });
      
      Alert.alert("[ SUCESSO ]", `+10 XP ADQUIRIDO. ${item.nome.toUpperCase()} ESCANEADO.`);
    } catch (error) {
      console.log("Erro ao salvar XP:", error);
    }
  };

  if (loading) return (
    <LinearGradient colors={["#000", "#020617"]} style={styles.loading}>
        <ActivityIndicator color="#22d3ee" />
    </LinearGradient>
  );

  return (
    <LinearGradient colors={["#000000", "#020617"]} style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setShowDrawer(true)} style={styles.menuBox}>
            <Ionicons name="grid-outline" size={24} color="#22d3ee" />
        </TouchableOpacity>
        <Text style={styles.headerTag}>SISTEMA // DATABASE_BIO</Text>
      </View>

      <Text style={styles.title}>ENCICLOPÉDIA_DE_MANA</Text>
      
      {/* BARRA DE SYNC (FARM) */}
      <View style={styles.syncContainer}>
        <View style={styles.syncHeader}>
            <Text style={styles.syncLabel}>STATUS_DE_SINCRONIZAÇÃO_DIÁRIA</Text>
            <Text style={styles.syncValue}>{kcalAdicionadasHoje} / {LIMITE_DIARIO_XP} KCAL</Text>
        </View>
        <View style={styles.syncTrack}>
            <LinearGradient 
                colors={["#0891b2", "#22d3ee"]} 
                start={{x:0, y:0}} end={{x:1, y:0}}
                style={[styles.syncFill, { width: `${Math.min(100, (kcalAdicionadasHoje/LIMITE_DIARIO_XP)*100)}%` }]} 
            />
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Ionicons name="scan-outline" size={20} color="#22d3ee" style={{ marginLeft: 15 }} />
        <TextInput
          style={styles.input}
          placeholder="PROCURAR ELEMENTO..."
          value={busca}
          onChangeText={setBusca}
          placeholderTextColor="#475569"
        />
      </View>

      <FlatList
        data={resultado}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyExtractor={(item) => item.nome}
        renderItem={({ item }) => {
          const isLimitReached = kcalAdicionadasHoje >= LIMITE_DIARIO_XP;
          return (
            <TouchableOpacity 
              activeOpacity={0.7}
              style={[styles.elementCard, isLimitReached && styles.elementDisabled]} 
              onPress={() => handleAdicionar(item)}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.tagRow}>
                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{item.categoria}</Text>
                    </View>
                </View>
                <Text style={[styles.elementName, isLimitReached && { color: '#475569' }]}>
                    {item.nome.toUpperCase()}
                </Text>
                <Text style={styles.elementInfo}>POTENCIAL: {item.calorias} KCAL</Text>
              </View>
              
              <View style={styles.actionArea}>
                <Ionicons 
                    name={isLimitReached ? "lock-closed-sharp" : "barcode-sharp"} 
                    size={22} 
                    color={isLimitReached ? "#1e293b" : "#22d3ee"} 
                />
                {!isLimitReached && <Text style={styles.xpText}>+10_XP</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  menuBox: { width: 45, height: 45, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(34, 211, 238, 0.05)' },
  headerTag: { color: '#22d3ee', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  title: { color: '#fff', fontSize: 20, fontWeight: "900", textAlign: "center", letterSpacing: 3, marginBottom: 30, fontStyle: 'italic' },
  
  syncContainer: { backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 18, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.1)', marginBottom: 25 },
  syncHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  syncLabel: { color: '#475569', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  syncValue: { color: '#22d3ee', fontSize: 9, fontWeight: '900' },
  syncTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  syncFill: { height: '100%' },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)', marginBottom: 25 },
  input: { flex: 1, padding: 15, color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  
  elementCard: { 
    backgroundColor: 'rgba(15, 23, 42, 0.4)', 
    padding: 20, 
    marginBottom: 12, 
    flexDirection: "row", 
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#22d3ee'
  },
  elementDisabled: { borderLeftColor: '#1e293b', opacity: 0.6 },
  tagRow: { flexDirection: 'row', marginBottom: 8 },
  categoryTag: { backgroundColor: 'rgba(34, 211, 238, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)' },
  categoryText: { color: '#22d3ee', fontSize: 7, fontWeight: '900' },
  elementName: { color: '#fff', fontWeight: "900", fontSize: 16, letterSpacing: 1 },
  elementInfo: { color: '#475569', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  
  actionArea: { alignItems: 'center', paddingLeft: 15, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.05)' },
  xpText: { color: '#22d3ee', fontSize: 8, fontWeight: '900', marginTop: 5 }
});