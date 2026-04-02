import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, TextInput, TouchableOpacity, View, 
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform, Dimensions 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";

// Firebase Engine (Mantendo sua lógica original)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { 
  getAuth, 
  initializeAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  // @ts-ignore
  getReactNativePersistence 
} from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Configuração Firebase (Mantida)
const firebaseConfig = {
  apiKey: "AIzaSyAC-uFM4pwfXDuKxGvsFM3Z7v7oF0BC3U4",
  authDomain: "biosyntech-8ffe1.firebaseapp.com",
  projectId: "biosyntech-8ffe1",
  storageBucket: "biosyntech-8ffe1.firebasestorage.app",
  messagingSenderId: "642421745104",
  appId: "1:642421745104:web:ef5298a181d4a178f145d5",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  auth = getAuth(app);
}

export default function LoginScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "642421745104-dumta3ri29l1spsj7ikrlqfuqu922m2k.apps.googleusercontent.com",
    webClientId: "642421745104-5b5lhva0c32t6rfl72elovp71ojcl432.apps.googleusercontent.com",
  });

  // Lógica de Auth (Mantida sua implementação original)
  const createUserData = async (uid: string, name: string, mail: string) => {
    await setDoc(doc(db, "users", uid), {
      username: name,
      email: mail,
      level: 1,
      xp: 0,
      rank: "F-Rank Hunter",
      createdAt: new Date().toISOString()
    });
  };

  const handleAuth = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    if (!cleanEmail || !cleanPassword) return Alert.alert("SISTEMA", "Credenciais incompletas.");
    
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        router.replace('/(tabs)');
      } else {
        if (!username || cleanPassword !== confirmPassword) throw new Error("Dados inválidos.");
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        await updateProfile(userCredential.user, { displayName: username });
        await createUserData(userCredential.user.uid, username, cleanEmail);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert("ERRO DE ACESSO", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#000000", "#020617"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          {/* HEADER SISTEMA */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
                <Ionicons name="flash" size={50} color="#22d3ee" />
            </View>
            <Text style={styles.systemTitle}>GENESYS <Text style={styles.systemTitleAlt}>SYSTEM</Text></Text>
            <View style={styles.separator} />
            <Text style={styles.subtitle}>{isLogin ? "[ AUTENTICAÇÃO NECESSÁRIA ]" : "[ REGISTRO DE NOVO JOGADOR ]"}</Text>
          </View>

          {/* TABS ESTILO SOLO LEVELING */}
          <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabBtn} onPress={() => setIsLogin(true)}>
              <Text style={[styles.tabText, isLogin && styles.activeTabText]}>LOGIN</Text>
              {isLogin && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn} onPress={() => setIsLogin(false)}>
              <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>CADASTRO</Text>
              {!isLogin && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </View>

          {/* ÁREA DE INPUTS */}
          <View style={styles.inputArea}>
            {!isLogin && (
              <View style={styles.inputBox}>
                <Ionicons name="person-sharp" size={18} color="#22d3ee" />
                <TextInput 
                  placeholder="NOME DO JOGADOR" 
                  placeholderTextColor="#475569"
                  style={styles.inputField} 
                  value={username} 
                  onChangeText={setUsername} 
                />
              </View>
            )}
            
            <View style={styles.inputBox}>
              <Ionicons name="mail-sharp" size={18} color="#22d3ee" />
              <TextInput 
                placeholder="E-MAIL" 
                placeholderTextColor="#475569"
                style={styles.inputField} 
                keyboardType="email-address" 
                autoCapitalize="none" 
                value={email} 
                onChangeText={setEmail} 
              />
            </View>

            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-sharp" size={18} color="#22d3ee" />
              <TextInput 
                placeholder="SENHA" 
                placeholderTextColor="#475569"
                style={styles.inputField} 
                secureTextEntry 
                value={password} 
                onChangeText={setPassword} 
              />
            </View>

            {!isLogin && (
              <View style={styles.inputBox}>
                <Ionicons name="shield-checkmark-sharp" size={18} color="#22d3ee" />
                <TextInput 
                  placeholder="CONFIRMAR SENHA" 
                  placeholderTextColor="#475569"
                  style={styles.inputField} 
                  secureTextEntry 
                  value={confirmPassword} 
                  onChangeText={setConfirmPassword} 
                />
              </View>
            )}

            {/* BOTÃO PRINCIPAL COM GLOW */}
            <TouchableOpacity style={styles.mainButton} onPress={handleAuth} disabled={loading}>
              <LinearGradient 
                colors={["#0891b2", "#22d3ee"]} 
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 0}} 
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.buttonLabel}>{isLogin ? 'ACESSAR PORTAL' : 'DESPERTAR'}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={styles.footerNote}>ADVERTÊNCIA: O PERFIL SERÁ VINCULADO AO SEU DNA DIGITAL.</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  iconCircle: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#22d3ee',
    borderRadius: 50,
    marginBottom: 15,
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
  },
  systemTitle: { fontSize: 32, fontWeight: '900', color: '#fff', fontStyle: 'italic' },
  systemTitleAlt: { color: '#22d3ee' },
  separator: { width: 50, height: 3, backgroundColor: '#22d3ee', marginVertical: 10 },
  subtitle: { fontSize: 10, color: '#22d3ee', fontWeight: 'bold', letterSpacing: 2 },
  
  tabBar: { flexDirection: 'row', marginBottom: 30 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabText: { fontWeight: '900', color: '#475569', fontSize: 12, letterSpacing: 1 },
  activeTabText: { color: '#fff' },
  activeIndicator: { width: '40%', height: 2, backgroundColor: '#22d3ee', marginTop: 5 },

  inputArea: { gap: 15 },
  inputBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(34, 211, 238, 0.2)', 
    paddingHorizontal: 15, 
    height: 55, 
    backgroundColor: 'rgba(15, 23, 42, 0.5)' 
  },
  inputField: { flex: 1, marginLeft: 12, fontSize: 13, color: '#fff', fontWeight: 'bold' },
  
  mainButton: { height: 55, marginTop: 10, elevation: 5 },
  buttonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  buttonLabel: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 2 },
  
  footerNote: { 
    textAlign: 'center', 
    color: '#475569', 
    fontSize: 8, 
    fontWeight: 'bold', 
    marginTop: 20, 
    letterSpacing: 1 
  },
});