import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { useXpSystem } from "../../constants/xpSystem";
import { DrawerMenu } from "../../components/drawer-menu";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";




// Base de treinos por grupo
const treinosPorGrupo: Record<string, string[]> = {
  Peito: ["Supino com Barra", "Supino Inclinado", "Fly na Máquina"],
  Braços: ["Rosca Direta", "Tríceps Testa", "Flexão de Braço"],
  Pernas: ["Agachamento Livre", "Leg Press", "Avanço"],
  Costas: ["Remada Curvada", "Barra Fixa", "Pulldown"],
  Ombros: ["Desenvolvimento com Halteres", "Elevação Lateral", "Arnold Press"],
  Abdômen: ["Prancha", "Abdominal Supra", "Abdominal Oblíquo"],
};

// Base de treinos detalhados para pesquisa
const treinosDetalhados: Record<string, string[]> = {
  supino: [
    "Deite-se no banco com os pés firmes no chão.",
    "Segure a barra com as mãos afastadas na largura dos ombros.",
    "Desça a barra até o peito.",
    "Empurre a barra para cima até estender os braços."
  ],
  agachamento: [
    "Afaste os pés na largura dos ombros.",
    "Flexione os joelhos mantendo a coluna ereta.",
    "Desça até formar um ângulo de 90°.",
    "Suba lentamente até a posição inicial."
  ],
  flexao: [
    "Deite-se de barriga para baixo.",
    "Apoie as mãos no chão na largura dos ombros.",
    "Mantenha o corpo reto e desça até quase encostar o peito.",
    "Suba novamente estendendo os braços."
  ]
};

export default function TreinosScreen() {
  const auth = getAuth();
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const db = getFirestore();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [resultado, setResultado] = useState<string[] | null>(null);
  const { xp, nivel, xpNecessario, rankAtual, ganharXp } = useXpSystem();

  //dar XP ao selecionar grupo
  const selecionarGrupo = (grupo: string) => {
    setSelecionado(grupo);
    setResultado(null);
    ganharXp(50); // cada grupo dá 50 XP
  };

  const handleLevelUp = async (currentLevel: number) => {
    const userRef = doc(db, "users", auth.currentUser!.uid);
    await updateDoc(userRef, {
      level: increment(1),
      xp: 0 // Reseta o XP ao subir de nível
    });
    Alert.alert("LEVEL UP! 🎊", `Você atingiu o nível ${currentLevel + 1}!`);
  };


  // Monitor de Dados e Level Up
  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        const data = snapshot.data();
        if (data) {
          setUserData(data);
          if (data.peso === 0 || data.altura === 0) setShowWelcome(true);

          // Lógica automática de Level Up
          if (data.xp >= 1000) {
            handleLevelUp(data.level);
          }
        }
      });
      return () => unsub();
    }
  }, []);

  const pesquisarTreino = () => {
    const treino = treinosDetalhados[busca.toLowerCase()];
    setResultado(treino || null);
    setSelecionado(null); // limpa seleção de grupo ao pesquisar
  };

  return (
    <>
      <View style={styles.container}>
        {/* Botão do menu */}
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowDrawer(true)}>
          <Ionicons name="menu" size={28} color={Colors.gold} />
        </TouchableOpacity>

        <Text style={styles.title}>🏋️ Treinos</Text>
        <Text style={styles.subtitle}>Selecione um grupo ou pesquise um treino</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Nível: {userData?.level || nivel}</Text>
          <Text style={styles.infoText}>Rank: {userData?.rank || rankAtual}</Text>
          <Text style={styles.infoText}>XP: {userData?.xp || xp}/{userData?.xpNecessario || xpNecessario}</Text>
        </View>

        {/* XP por selecionar grupo */}
        <TouchableOpacity onPress={() => ganharXp(50)}>
          <Text style={styles.cardText}>Completar Treino (+50 XP)</Text>
        </TouchableOpacity>

        {/* Pesquisa */}
        <TextInput
          style={styles.input}
          placeholder="Digite o nome do treino (ex: supino)"
          value={busca}
          onChangeText={setBusca}
          placeholderTextColor={Colors.charcoal}
        />
        <TouchableOpacity style={styles.button} onPress={pesquisarTreino}>
          <Text style={styles.buttonText}>Pesquisar</Text>
        </TouchableOpacity>

        {/* Botões de grupos musculares */}
        <View style={styles.groupsContainer}>
          {Object.keys(treinosPorGrupo).map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.card,
                selecionado === item && styles.cardSelecionado,
              ]}
              onPress={() => {
                setSelecionado(item);
                setResultado(null);
              }}
            >
              <Text style={styles.cardText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resultado da pesquisa */}
        {resultado && (
          <View style={styles.resultado}>
            <Text style={styles.subtitle}>Passo a passo:</Text>
            {resultado.map((p, i) => (
              <Text key={i} style={styles.text}>• {p}</Text>
            ))}
          </View>
        )}

        {/* Exercícios do grupo selecionado */}
        {selecionado && (
          <View style={styles.resultado}>
            <Text style={styles.subtitle}>Exercícios para {selecionado}:</Text>
            {treinosPorGrupo[selecionado].map((ex, i) => (
              <Text key={i} style={styles.text}>• {ex}</Text>
            ))}
          </View>
        )}
      </View>
      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { bottom: -56, flex: 1, backgroundColor: Colors.charcoal, padding: 20 },
  menuButton: { position: "absolute", top: 16, left: 20, zIndex: 10 },
  title: { color: Colors.gold, fontSize: 26, fontWeight: "bold", marginBottom: 10, textAlign: "center", marginTop: 30 },
  subtitle: { color: Colors.cream, fontSize: 16, marginBottom: 20, textAlign: "center" },
  input: { backgroundColor: Colors.cream, padding: 12, borderRadius: 10, marginVertical: 10, color: Colors.charcoal },
  button: { backgroundColor: Colors.tan, padding: 14, borderRadius: 12, alignItems: "center", marginVertical: 8 },
  buttonText: { color: Colors.cream, fontWeight: "bold", fontSize: 18 },
  infoContainer: { backgroundColor: Colors.tan, padding: 12, borderRadius: 10, marginBottom: 16 },
  infoText: { color: Colors.black, fontSize: 14, fontWeight: "600", marginVertical: 4 },
  groupsContainer: { marginVertical: 10 },
  card: {
    backgroundColor: Colors.tan,
    paddingVertical: 18,
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: Colors.gold,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    alignItems: "center",
  },
  cardSelecionado: { backgroundColor: Colors.gold },
  cardText: { color: Colors.cream, fontWeight: "bold", fontSize: 18 },
  resultado: { marginTop: 20, padding: 16, backgroundColor: Colors.tan, borderRadius: 12 },
  text: { color: Colors.cream, marginBottom: 6, fontSize: 16 },
});

