{/*import { DrawerActions, useNavigation } from "@react-navigation/native"; */ }
import React, { useState } from "react";
import { ThemedText } from '@/components/themed-text';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { DrawerMenu } from "../../components/drawer-menu";


export default function StatusScreen() {
  const [xp, setXp] = useState(0);
  const [nivel, setNivel] = useState(1);
  const [pontos, setPontos] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  {/*const navigation = useNavigation();*/ }

  // atributos
  const [forca, setForca] = useState(1);
  const [resistencia, setResistencia] = useState(1);
  const [inteligencia, setInteligencia] = useState(1);

  const xpNecessario = 100 * nivel * nivel;

  // tabela de ranks
const RANK_SYSTEM = [
  { min: 1, max: 5, name: "Aprendiz" },
  { min: 6, max: 10, name: "Rank E" },
  { min: 11, max: 20, name: "Rank D" },
  { min: 21, max: 35, name: "Rank C" },
  { min: 41, max: 45, name: "Rank B" },
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
  const rankAtual = getRank(nivel);
  const xpLimite = 1000;

  // ganhar XP
  const ganharXp = (valor: number) => {
    let novoXp = xp + valor;
    if (novoXp >= xpNecessario) {
      setNivel(nivel + 1);
      novoXp = novoXp - xpNecessario;
      setPontos(pontos + 5); // ganha pontos ao upar
      alert(`🎉 Level Up! Você agora é nível ${nivel + 1} (${rankAtual})`);
    }
    setXp(novoXp);
  };

  // resetar tudo
  const resetar = () => {
    setXp(0);
    setNivel(1);
    setPontos(0);
    setForca(1);
    setResistencia(1);
    setInteligencia(1);
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowDrawer(true)}>
          <Ionicons name="menu" size={28} color={Colors.gold} />
        </TouchableOpacity>

        <Text style={styles.title}>🏆 Status do Jogador</Text>

        {/* XP e Nível */}
        <ThemedText style={styles.levelLabel}>NÍVEL {userData?.level || 1}</ThemedText>
        <ThemedText style={styles.levelLabel}>Rank: {userData?.rank || getRank(userData?.level || 0)}</ThemedText>
        <ThemedText style={styles.xpLabel}>{userData?.xp || 0} / {xpLimite} XP</ThemedText>

        {/* Barra de progresso */}
        <View style={styles.progressBar}>
          <View
            style={{
              width: `${(xp / xpNecessario) * 100}%`,
              height: "100%",
              backgroundColor: Colors.gold,
              borderRadius: 10,
            }}
          />
        </View>

        {/* Tabela de Ranks */}
        <Text style={styles.section}>📜 Tabela de Ranks</Text>
        {RANK_SYSTEM.map((r, i) => (
          <View key={i} style={styles.rankRow}>
            <Text style={styles.rankText}>
              {r.min} - {r.max}: {r.name}
            </Text>
          </View>
        ))}


        {/*parte dos boões da lateral
        <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                style={{ padding: 10, backgroundColor: "gold", marginBottom: 10 }}
        >
            <Text style={{ color: "black", fontWeight: "bold" }}>☰ Menu</Text>
        </TouchableOpacity> */}

        {/* Botões para ganhar XP */}
        <Text style={styles.section}>⚡ Ganhar XP</Text>
        <TouchableOpacity style={styles.button} onPress={() => ganharXp(50)}>
          <Text style={styles.buttonText}>Completar Treino (+50 XP)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => ganharXp(30)}>
          <Text style={styles.buttonText}>Registrar Dieta (+30 XP)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => ganharXp(20)}>
          <Text style={styles.buttonText}>Cronômetro Finalizado (+20 XP)</Text>
        </TouchableOpacity>

        {/* Pontos */}
        <Text style={styles.subtitle}>🎁 Pontos disponíveis: {pontos}</Text>

        {/* Sistema de recompensas */}
        <Text style={styles.section}>🛒 Recompensas</Text>
        <TouchableOpacity style={styles.button} onPress={() => {
          if (pontos >= 3) { setPontos(pontos - 3); alert("🍔 Dia do Lixo resgatado!"); }
          else alert("Pontos insuficientes!");
        }}>
          <Text style={styles.buttonText}>Dia do Lixo (3 pts)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => {
          if (pontos >= 2) { setPontos(pontos - 2); alert("🎮 1 Hora de Game resgatada!"); }
          else alert("Pontos insuficientes!");
        }}>
          <Text style={styles.buttonText}>1 Hora de Game (2 pts)</Text>
        </TouchableOpacity>

        {/* Atributos */}
        <Text style={styles.section}>⚔️ Atributos</Text>
        <Text style={styles.attr}>Força: {forca}</Text>
        <TouchableOpacity style={styles.button} onPress={() => {
          if (pontos > 0) { setForca(forca + 1); setPontos(pontos - 1); }
        }}>
          <Text style={styles.buttonText}>Upar Força (1 pt)</Text>
        </TouchableOpacity>

        <Text style={styles.attr}>Resistência: {resistencia}</Text>
        <TouchableOpacity style={styles.button} onPress={() => {
          if (pontos > 0) { setResistencia(resistencia + 1); setPontos(pontos - 1); }
        }}>
          <Text style={styles.buttonText}>Upar Resistência (1 pt)</Text>
        </TouchableOpacity>

        <Text style={styles.attr}>Inteligência: {inteligencia}</Text>
        <TouchableOpacity style={styles.button} onPress={() => {
          if (pontos > 0) { setInteligencia(inteligencia + 1); setPontos(pontos - 1); }
        }}>
          <Text style={styles.buttonText}>Upar Inteligência (1 pt)</Text>
        </TouchableOpacity>

        {/* Botão de reset */}
        <TouchableOpacity style={[styles.button, { backgroundColor: "red" }]} onPress={resetar}>
          <Text style={styles.buttonText}>Resetar Informações</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Menu Drawer */}
      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.charcoal, padding: 20, paddingTop: 50 },
  menuButton: { position: "absolute", top: 16, left: 20, zIndex: 10 },
  title: { color: Colors.gold, fontSize: 26, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  subtitle: { color: Colors.cream, fontSize: 16, marginBottom: 10 },
  levelLabel: { color: '#FFD700', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  xpLabel: { color: '#64748b', fontSize: 12 },
  section: { color: Colors.tan, fontSize: 18, marginTop: 20, marginBottom: 10, fontWeight: "bold" },
  progressBar: { height: 20, backgroundColor: Colors.cream, borderRadius: 10, marginVertical: 10 },
  button: { backgroundColor: Colors.tan, padding: 12, borderRadius: 10, marginVertical: 6, alignItems: "center" },
  buttonText: { color: Colors.cream, fontWeight: "bold" },
  attr: { color: Colors.cream, fontSize: 16, marginVertical: 4 },
  rankRow: { backgroundColor: Colors.tan, padding: 10, borderRadius: 8, marginVertical: 4 },
  rankText: { color: Colors.cream, fontSize: 16 },
});
