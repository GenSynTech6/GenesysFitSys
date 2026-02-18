import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";

// Exemplo de base de dados local (pode ser substituído por API depois)
const alimentos = [
  { nome: "Arroz", calorias: 130 },
  { nome: "Feijão", calorias: 90 },
  { nome: "Frango", calorias: 165 },
  { nome: "Batata", calorias: 77 },
  { nome: "Leite", calorias: 42 },
  { nome: "Ovo", calorias: 155 },
];

export default function PesquisaScreen() {
  const [busca, setBusca] = useState("");
  const [resultado, setResultado] = useState<any[]>([]);

  const pesquisar = () => {
    const filtro = alimentos.filter((item) =>
      item.nome.toLowerCase().includes(busca.toLowerCase())
    );
    setResultado(filtro);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔎 Pesquisa de Alimentos</Text>
      <Text style={styles.subtitle}>Veja as calorias por 100g/ml</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o alimento"
        value={busca}
        onChangeText={setBusca}
        placeholderTextColor={Colors.charcoal}
      />

      <TouchableOpacity style={styles.button} onPress={pesquisar}>
        <Text style={styles.buttonText}>Pesquisar</Text>
      </TouchableOpacity>

      <FlatList
        data={resultado}
        keyExtractor={(item) => item.nome}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>{item.nome}</Text>
            <Text style={styles.cardCalories}>{item.calorias} kcal / 100g</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.charcoal, padding: 20 },
  title: { color: Colors.gold, fontSize: 26, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  subtitle: { color: Colors.cream, fontSize: 16, marginBottom: 20, textAlign: "center" },
  input: { backgroundColor: Colors.cream, padding: 12, borderRadius: 10, marginVertical: 8, color: Colors.charcoal },
  button: { backgroundColor: Colors.tan, padding: 14, borderRadius: 12, alignItems: "center", marginVertical: 8 },
  buttonText: { color: Colors.cream, fontWeight: "bold", fontSize: 18 },
  card: {
    backgroundColor: Colors.tan,
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardText: { color: Colors.cream, fontWeight: "bold", fontSize: 18 },
  cardCalories: { color: Colors.gold, fontSize: 16 },
});
