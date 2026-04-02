import React, { useState, useEffect } from "react"; 
import { TouchableOpacity, StyleSheet, Text, View, Pressable, SafeAreaView, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { DrawerMenu } from '@/components/drawer-menu';
import { Dimensions } from "react-native";
import { BlurView } from 'expo-blur';
const { width, height } = Dimensions.get('window');

export default function CronometroScreen() {
  const [tempo, setTempo] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isTimerMode, setIsTimerMode] = useState(false); // Alterna entre Cronômetro e Temporizador

  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval>;
    
    if (isRunning) {
      intervalo = setInterval(() => {
        setTempo((t) => {
          if (isTimerMode) {
            if (t <= 0) {
              setIsRunning(false);
              Alert.alert("[ SISTEMA ]", "TEMPO ESGOTADO! MISSÃO CONCLUÍDA.");
              return 0;
            }
            return t - 1;
          }
          return t + 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [isRunning, isTimerMode]);

  const formatarTempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${String(mins).padStart(2, "0")}:${String(segs).padStart(2, "0")}`;
  };

  const resetar = () => {
    setIsRunning(false);
    setTempo(0);
  };

  const ajustarTempo = (segundos: number) => {
    if (!isRunning) {
      setTempo((t) => Math.max(0, t + segundos));
    }
  };

  return (
    <LinearGradient colors={["#000000", "#020617"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowDrawer(true)} style={styles.menuBox}>
            <Ionicons name="grid-outline" size={24} color="#22d3ee" />
          </TouchableOpacity>
          <View style={styles.headerTitleArea}>
            <Text style={styles.systemText}>// TIME_MANAGEMENT_OS</Text>
            <Text style={styles.title}>{isTimerMode ? "TEMPORIZADOR" : "CRONÔMETRO"}</Text>
          </View>
        </View>

        {/* Seletor de Modo */}
        <View style={styles.modeSelector}>
          <TouchableOpacity 
            style={[styles.modeBtn, !isTimerMode && styles.activeModeBtn]} 
            onPress={() => { setIsTimerMode(false); resetar(); }}
          >
            <Text style={[styles.modeBtnText, !isTimerMode && styles.activeModeBtnText]}>STOPWATCH</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeBtn, isTimerMode && styles.activeModeBtn]} 
            onPress={() => { setIsTimerMode(true); resetar(); }}
          >
            <Text style={[styles.modeBtnText, isTimerMode && styles.activeModeBtnText]}>TIMER</Text>
          </TouchableOpacity>
        </View>

        {/* Display Central */}
        <View style={styles.timerWrapper}>
          <View style={[styles.timerCircle, isRunning && styles.activeTimerCircle]}>
            <View style={styles.hudCornerTop} />
            <View style={styles.hudCornerBottom} />
            
            <Text style={styles.timerText}>{formatarTempo(tempo)}</Text>
            <Text style={styles.statusLabel}>
                {isRunning ? "[ EXECUTANDO... ]" : "[ STANDBY ]"}
            </Text>
          </View>
          {isRunning && <View style={styles.coreGlow} />}
        </View>

        {/* Ajustes do Temporizador (Só aparece no modo Timer) */}
        {isTimerMode && !isRunning && (
          <View style={styles.adjustContainer}>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => ajustarTempo(60)}>
              <Text style={styles.adjustBtnText}>+1m</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => ajustarTempo(10)}>
              <Text style={styles.adjustBtnText}>+10s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => ajustarTempo(-10)}>
              <Text style={styles.adjustBtnText}>-10s</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Controles Principais */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.mainButton, isRunning ? styles.btnParar : styles.btnIniciar]}
            onPress={() => setIsRunning(!isRunning)}
          >
            <Ionicons name={isRunning ? "pause-sharp" : "play-sharp"} size={24} color="#000" />
            <Text style={styles.mainButtonText}>{isRunning ? "PAUSAR" : "DESPERTAR"}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.btnReset} onPress={resetar}>
            <Ionicons name="refresh-sharp" size={20} color="#22d3ee" />
            <Text style={styles.resetText}>REINICIALIZAR</Text>
          </TouchableOpacity>
        </View>

        <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, marginTop: 20, gap: 20 },
  menuBox: { width: 45, height: 45, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(34, 211, 238, 0.05)' },
  headerTitleArea: { flex: 1 },
  systemText: { color: '#22d3ee', fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  title: { fontSize: 20, fontWeight: "900", color: "#fff", fontStyle: 'italic' },
  
  modeSelector: { flexDirection: 'row', paddingHorizontal: 25, marginTop: 25, gap: 10 },
  modeBtn: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(71, 85, 105, 0.3)', alignItems: 'center' },
  activeModeBtn: { borderColor: '#22d3ee', backgroundColor: 'rgba(34, 211, 238, 0.1)' },
  modeBtnText: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  activeModeBtnText: { color: '#22d3ee' },

  timerWrapper: { alignItems: 'center', justifyContent: 'center', marginVertical: 30 },
  timerCircle: { width: 280, height: 280, borderRadius: 4, borderWidth: 1, borderColor: "rgba(34, 211, 238, 0.2)", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(15, 23, 42, 0.4)", zIndex: 2 },
  activeTimerCircle: { borderColor: "#22d3ee", borderWidth: 2, shadowColor: "#22d3ee", shadowRadius: 25, shadowOpacity: 0.5 },
  hudCornerTop: { position: 'absolute', top: 15, left: 15, width: 20, height: 20, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#22d3ee' },
  hudCornerBottom: { position: 'absolute', bottom: 15, right: 15, width: 20, height: 20, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#22d3ee' },
  timerText: { fontSize: 75, fontWeight: "900", color: "#fff", fontVariant: ["tabular-nums"], fontStyle: 'italic' },
  statusLabel: { fontSize: 9, fontWeight: "900", marginTop: 10, letterSpacing: 2, color: "#475569" },
  coreGlow: { position: 'absolute', width: 180, height: 180, backgroundColor: 'rgba(34, 211, 238, 0.15)', borderRadius: 90, zIndex: 1 },

  adjustContainer: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 20 },
  adjustBtn: { paddingHorizontal: 15, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.5)', backgroundColor: 'rgba(34, 211, 238, 0.05)' },
  adjustBtnText: { color: '#22d3ee', fontWeight: '900', fontSize: 12 },

  buttonContainer: { paddingHorizontal: 30, gap: 15 },
  mainButton: { height: 60, flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 12, borderRadius: 2 },
  btnIniciar: { backgroundColor: "#22d3ee" },
  btnParar: { backgroundColor: "#ef4444" },
  mainButtonText: { color: "#000", fontWeight: "900", fontSize: 15, letterSpacing: 2 },
  btnReset: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 10 },
  resetText: { color: '#22d3ee', fontWeight: '900', fontSize: 11, letterSpacing: 1 }
});