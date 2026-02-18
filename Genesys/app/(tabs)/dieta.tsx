import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";

// Base de alimentos (exemplo)
const alimentos = [
  { nome: "Arroz", calorias: 130 },   // kcal por 100g
  { nome: "Feijão", calorias: 90 },
  { nome: "Frango", calorias: 165 },
  { nome: "Batata", calorias: 77 },
  { nome: "Leite", calorias: 42 },    // kcal por 100ml
  { nome: "Ovo", calorias: 155 },
];

export default function DietaScreen() {
  const [limite, setLimite] = useState(2000);
  const [consumido, setConsumido] = useState(0);
  const [busca, setBusca] = useState("");
  const [resultado, setResultado] = useState<any[]>([]);
  const [quantidade, setQuantidade] = useState("100"); // gramas/ml

  const pesquisar = () => {
    const filtro = alimentos.filter((item) =>
      item.nome.toLowerCase().includes(busca.toLowerCase())
    );
    setResultado(filtro);
  };

  const adicionarConsumo = (alimento: { nome: string; calorias: number }) => {
    const qtd = Number(quantidade);
    const kcal = (alimento.calorias * qtd) / 100;
    const novoTotal = consumido + kcal;
    setConsumido(novoTotal);

    if (novoTotal > limite) {
      alert("⚠️ Você ultrapassou seu limite diário de calorias!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🥗 Dieta</Text>
      <Text style={styles.subtitle}>Controle seu consumo diário</Text>

      <Text style={styles.text}>Limite diário: {limite} kcal</Text>
      <Text style={styles.text}>Consumido: {consumido.toFixed(0)} kcal</Text>

      <TextInput
        style={styles.input}
        placeholder="Defina seu limite diário (kcal)"
        keyboardType="numeric"
        onChangeText={(v) => setLimite(Number(v))}
        placeholderTextColor={Colors.charcoal}
      />

      <TextInput
        style={styles.input}
        placeholder="Pesquisar alimento"
        value={busca}
        onChangeText={setBusca}
        placeholderTextColor={Colors.charcoal}
      />


      <TextInput
        style={styles.input}
        placeholder="Quantidade em gramas/ml"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
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
            <View>
              <Text style={styles.cardText}>{item.nome}</Text>
              <Text style={styles.cardCalories}>{item.calorias} kcal / 100g</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => adicionarConsumo(item)}
            >
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
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
  text: { color: Colors.cream, marginBottom: 10 },
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
    alignItems: "center",
  },
  cardText: { color: Colors.cream, fontWeight: "bold", fontSize: 18 },
  cardCalories: { color: Colors.gold, fontSize: 16 },
  addButton: { backgroundColor: Colors.gold, padding: 10, borderRadius: 8 },
  addButtonText: { color: Colors.charcoal, fontWeight: "bold" },
});
    