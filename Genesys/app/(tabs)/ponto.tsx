import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";

export default function PontoScreen() {
  const [diasTreinados, setDiasTreinados] = useState(0);
  const [descanso, setDescanso] = useState(false);

  const baterPonto = () => {
    if (descanso) {
      alert("Hoje é dia de descanso! Não precisa bater ponto.");
    } else {
      setDiasTreinados(diasTreinados + 1);
      alert("✅ Ponto registrado!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Sistema de Ponto</Text>
      <Text style={styles.subtitle}>Dias treinados: {diasTreinados}</Text>

      <TouchableOpacity style={styles.button} onPress={baterPonto}>
        <Text style={styles.buttonText}>Bater Ponto</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setDescanso(!descanso)}>
        <Text style={styles.buttonText}>{descanso ? "Cancelar Descanso" : "Marcar Descanso"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.charcoal, padding: 20 },
  title: { color: Colors.gold, fontSize: 26, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  subtitle: { color: Colors.cream, fontSize: 16, marginBottom: 20, textAlign: "center" },
  button: { backgroundColor: Colors.tan, padding: 14, borderRadius: 12, alignItems: "center", marginVertical: 8 },
  buttonText: { color: Colors.cream, fontWeight: "bold", fontSize: 18 },
});
