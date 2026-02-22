import React, { useState, useEffect, useMemo } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { useXpSystem } from "../../constants/xpSystem";
import { DrawerMenu } from "../../components/drawer-menu";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const treinosPorGrupo: Record<string, string[]> = {
  Peito: ["Supino com Barra", "Supino Inclinado", "Fly na Máquina"],
  Braços: ["Rosca Direta", "Tríceps Testa", "Flexão de Braço"],
  Pernas: ["Agachamento Livre", "Leg Press", "Avanço"],
  Costas: ["Remada Curvada", "Barra Fixa", "Pulldown"],
  Ombros: ["Desenvolvimento com Halteres", "Elevação Lateral", "Arnold Press"],
  Abdômen: ["Prancha", "Abdominal Supra", "Abdominal Oblíquo"],
};

const treinosDetalhados: Record<string, string[]> = {
  supino: ["Deite-se no banco...", "Segure a barra...", "Desça até o peito.", "Empurre para cima."],
  agachamento: ["Pés na largura dos ombros.", "Flexione os joelhos.", "Ângulo de 90°.", "Suba lentamente."],
  flexao: ["Barriga para baixo.", "Mãos na largura dos ombros.", "Corpo reto.", "Suba estendendo braços."]
};

export default function TreinosScreen() {
  const auth = getAuth();
  const db = getFirestore();
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [resultado, setResultado] = useState<string[] | null>(null);
  
  const { xp, nivel, xpNecessario, rankAtual, ganharXp } = useXpSystem();

  // Monitorar dados do Firebase
  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        const data = snapshot.data();
        if (data) {
          setUserData(data);
          // Lógica de Level Up baseada no XP total acumulado
          if (data.xp >= 1000) {
            handleLevelUp(data.level);
          }
        }
      });
      return () => unsub();
    }
  }, []);

  const handleLevelUp = async (currentLevel: number) => {
    const userRef = doc(db, "users", auth.currentUser!.uid);
    await updateDoc(userRef, {
      level: increment(1),
      xp: 0
    });
    Alert.alert("LEVEL UP! 🎊", `Você atingiu o nível ${currentLevel + 1}!`);
  };

  const selecionarGrupo = (grupo: string) => {
    setSelecionado(grupo);
    setResultado(null);
    ganharXp(50); // Ganha XP ao explorar um novo grupo
  };

  const pesquisarTreino = () => {
    const treino = treinosDetalhados[busca.toLowerCase().trim()];
    if (treino) {
      setResultado(treino);
      setSelecionado(null);
    } else {
      Alert.alert("Busca", "Treino não encontrado na base detalhada.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={() => setShowDrawer(true)}>
        <Ionicons name="menu" size={28} color={Colors.gold} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>🏋️ Treinos</Text>
        
        {/* Painel de Status do Jogador */}
        <View style={styles.statusPanel}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>NÍVEL</Text>
            <Text style={styles.statusValue}>{userData?.level || nivel}</Text>
          </View>
          <View style={[styles.statusItem, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#333' }]}>
            <Text style={styles.statusLabel}>RANK</Text>
            <Text style={styles.statusValue}>{userData?.rank || rankAtual}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>XP</Text>
            <Text style={styles.statusValue}>{userData?.xp || xp}/{userData?.xpNecessario || xpNecessario}</Text>
          </View>
        </View>

        {/* Barra de Busca */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            placeholder="Pesquisar guia (ex: supino)"
            value={busca}
            onChangeText={setBusca}
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={pesquisarTreino}>
            <Ionicons name="search" size={20} color={Colors.charcoal} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Grupos Musculares</Text>
        
        {/* Grid de Grupos */}
        <View style={styles.grid}>
          {Object.keys(treinosPorGrupo).map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.groupCard, selecionado === item && styles.groupCardActive]}
              onPress={() => selecionarGrupo(item)}
            >
              <Ionicons 
                name={selecionado === item ? "checkbox" : "barbell-outline"} 
                size={24} 
                color={selecionado === item ? Colors.charcoal : Colors.gold} 
              />
              <Text style={[styles.groupText, selecionado === item && styles.groupTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Área de Resultados */}
        {(resultado || selecionado) && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Ionicons name="list" size={20} color={Colors.gold} />
              <Text style={styles.resultTitle}>
                {resultado ? "Passo a Passo" : `Exercícios: ${selecionado}`}
              </Text>
            </View>
            
            {(resultado || treinosPorGrupo[selecionado!]).map((item, i) => (
              <View key={i} style={styles.resultItem}>
                <Text style={styles.resultText}>• {item}</Text>
              </View>
            ))}

            <TouchableOpacity 
              style={styles.completeBtn} 
              onPress={() => {
                ganharXp(100);
                Alert.alert("Treino Finalizado", "Você ganhou +100 XP!");
              }}
            >
              <Text style={styles.completeBtnText}>FINALIZAR TREINO</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.charcoal, paddingHorizontal: 20, paddingTop: 60 },
  menuButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: { color: Colors.gold, fontSize: 28, fontWeight: "900", textAlign: "center", marginBottom: 20, letterSpacing: 2 },
  
  statusPanel: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 15, padding: 15, marginBottom: 25, borderWidth: 1, borderColor: '#333' },
  statusItem: { flex: 1, alignItems: 'center' },
  statusLabel: { color: '#666', fontSize: 10, fontWeight: 'bold' },
  statusValue: { color: Colors.gold, fontSize: 16, fontWeight: 'bold', marginTop: 4 },

  searchBox: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  input: { flex: 1, backgroundColor: '#1a1a1a', padding: 15, borderRadius: 12, color: Colors.cream, borderWidth: 1, borderColor: '#333' },
  searchBtn: { backgroundColor: Colors.gold, width: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  sectionTitle: { color: Colors.cream, fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginLeft: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  groupCard: { width: '48%', backgroundColor: '#1a1a1a', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  groupCardActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  groupText: { color: Colors.cream, fontWeight: 'bold', marginTop: 8 },
  groupTextActive: { color: Colors.charcoal },

  resultContainer: { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 20, marginTop: 10, borderWidth: 1, borderColor: Colors.gold },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  resultTitle: { color: Colors.gold, fontSize: 18, fontWeight: 'bold' },
  resultItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#333' },
  resultText: { color: Colors.cream, fontSize: 15 },
  
  completeBtn: { backgroundColor: Colors.gold, padding: 18, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  completeBtnText: { color: Colors.charcoal, fontWeight: '900', fontSize: 16 }
});