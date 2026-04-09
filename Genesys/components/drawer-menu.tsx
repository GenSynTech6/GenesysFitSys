import React, { useState, useEffect, useMemo } from 'react'; // Adicionado useMemo
import { StyleSheet, View, TouchableOpacity, Modal, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from './themed-text';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import * as Linking from 'expo-linking';

const { width } = Dimensions.get('window');

// 🛡️ LISTA DE UIDs COM ACESSO AO SISTEMA (Adicione o seu UID aqui)
const AUTHORIZED_ADMINS = [
  'n6fLFP6McFVEDuuW6bGOfBlFIJU2', //Elli 1
  'YkFbsUINjHgg1hgMpAAV1lev3R73',//Lavinia(Noiva do Elli)
  '30905YXrl6YnfuFtEMV8oNFJZJI3',//Arthur 
  'EwtzdA4FR2OwhzcyBGzbO7qMiq92'//Jheferson

];

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  const [userData, setUserData] = useState<any>(null);
  const [slideAnim] = React.useState(new Animated.Value(-width * 0.8));

  // Pega o UID do usuário logado no momento
  const currentUid = auth.currentUser?.uid;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const unsub = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
          setUserData(snapshot.data());
        });
        return unsub;
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -width * 0.8,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [visible]);

  // 🛠️ LISTA DE ITENS DINÂMICA
  const menuItems = useMemo(() => {
    const baseItems = [
      { label: 'DASHBOARD_PRINCIPAL', icon: 'grid-outline', route: '/(tabs)' },
      { label: 'GRIMÓRIO_DE_TREINOS', icon: 'barbell-outline', route: '/(tabs)/treinos' },
      { label: 'RANKING_MONARCAS', icon: 'trophy-outline', route: '/(tabs)/Ranking' },
      { label: 'TEMPORIZADOR_OS', icon: 'timer-outline', route: '/(tabs)/cronometro' },
      { label: 'PROTOCOLO_DIETÉTICO', icon: 'flask-outline', route: '/(tabs)/dieta' },
      { label: 'BUSCA_DE_SISTEMA', icon: 'search-outline', route: '/(tabs)/pesquisa' },
      { label: 'EXPLORAÇÃO_MAPA', icon: 'map-outline', route: '/(tabs)/explore' },
      { label: 'TERMINAL_DE_PONTO', icon: 'location-outline', route: '/(tabs)/ponto' },
      { label: 'PERFIL_OPERADOR', icon: 'person-outline', route: '/(tabs)/gamificacao' },
      { label: 'REGISTROS_PR', icon: 'medal-outline', route: '/(tabs)/ContrataAssinatura' },
      { label: 'CONFIG_NÚCLEO', icon: 'settings-outline', route: '/(tabs)/config' },
    ];

    // Verifica se o usuário atual está na lista de administradores
    if (currentUid && AUTHORIZED_ADMINS.includes(currentUid)) {
      baseItems.push({ 
        label: 'SISTEMA_MONARCA', 
        icon: 'key-outline', 
        route: 'https://genesysfitsys.onrender.com/admin-portal'
      });
    }

    return baseItems;
  }, [currentUid]);

  const handleLogout = () => {
    signOut(auth);
    onClose();
    router.replace('/(auth)/login');
  };

  const handleNavigation = (route: string) => {
    if (route.startsWith('http')) {
      Linking.openURL(route);
    } else {
      router.push(route as any);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="none">
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={onClose} 
          activeOpacity={1} 
        />

        <Animated.View style={[styles.drawer, { left: slideAnim }]}>
          {/* USER_IDENTITY_SECTION */}
          <View style={styles.drawerHeader}>
            <View style={styles.userContainer}>
              <View style={[styles.avatarBox, AUTHORIZED_ADMINS.includes(currentUid || '') && styles.adminAvatar]}>
                <ThemedText style={styles.avatarText}>
                  {userData?.username?.charAt(0).toUpperCase() || 'U'}
                </ThemedText>
              </View>
              <View style={styles.userInfo}>
                <ThemedText style={styles.userName}>
                  {userData?.username?.toUpperCase() || 'OPERADOR_NULL'}
                </ThemedText>
                <ThemedText style={styles.userRank}>
                  {userData?.rank?.toUpperCase() || 'NOVATO'} // LVL_{userData?.level || 1}
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="chevron-back-outline" size={20} color="#22d3ee" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>MÓDULOS_DE_ACESSO</ThemedText>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem, 
                    item.label === 'SISTEMA_MONARCA' && styles.adminMenuItem
                  ]}
                  onPress={() => handleNavigation(item.route)}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={item.label === 'SISTEMA_MONARCA' ? "#facc15" : "#22d3ee"} 
                    style={styles.menuIcon} 
                  />
                  <ThemedText style={[
                    styles.menuLabel,
                    item.label === 'SISTEMA_MONARCA' && { color: '#facc15' }
                  ]}>
                    {item.label}
                  </ThemedText>
                  <View style={styles.activeIndicator} />
                </TouchableOpacity>
              ))}
            </View>

            {/* STATUS_BAR_SECTION */}
            <View style={styles.statusSection}>
              <ThemedText style={styles.sectionTitle}>STATUS_DO_NÚCLEO</ThemedText>
              <View style={styles.statusBox}>
                <View style={styles.statusItem}>
                  <ThemedText style={styles.statusLabel}>XP_PROGRESS</ThemedText>
                  <ThemedText style={styles.statusValue}>{userData?.xp || 0} / 1000</ThemedText>
                  <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${(userData?.xp / 1000) * 100}%` }]} /></View>
                </View>
                <View style={styles.statusItem}>
                  <ThemedText style={styles.statusLabel}>CRÉDITOS_GENESYS</ThemedText>
                  <ThemedText style={styles.statusValue}>$ {userData?.moedas || 0}</ThemedText>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* DISCONNECT_SECTION */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="power-outline" size={18} color="#f43f5e" />
              <ThemedText style={styles.logoutText}>DESCONECTAR_SISTEMA</ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // ... Mantenha seus estilos anteriores ...
  adminAvatar: {
    borderColor: '#facc15', // Cor dourada para destacar o Admin
    shadowColor: '#facc15',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  adminMenuItem: {
    borderColor: 'rgba(250, 204, 21, 0.2)',
    backgroundColor: 'rgba(250, 204, 21, 0.05)',
  },
  // Resto dos estilos (copie do seu código original)
  container: { flex: 1, flexDirection: 'row' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)' },
  drawer: {
    width: '82%',
    backgroundColor: '#020617',
    borderRightWidth: 1,
    borderRightColor: 'rgba(34, 211, 238, 0.2)',
    height: '100%',
  },
  drawerHeader: {
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(34, 211, 238, 0.1)',
  },
  userContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 15 },
  avatarBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#22d3ee',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
  },
  avatarText: { color: '#22d3ee', fontSize: 20, fontWeight: '900' },
  userInfo: { flex: 1 },
  userName: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  userRank: { color: '#22d3ee', fontSize: 9, fontWeight: 'bold', marginTop: 4, opacity: 0.7 },
  closeBtn: { padding: 8, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)' },
  scrollContent: { flex: 1, padding: 15 },
  section: { marginBottom: 30 },
  sectionTitle: { color: '#475569', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 15, marginLeft: 5 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.03)',
  },
  menuIcon: { marginRight: 15, opacity: 0.8 },
  menuLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '900', letterSpacing: 1, flex: 1 },
  activeIndicator: { width: 4, height: 4, backgroundColor: '#22d3ee', borderRadius: 2, opacity: 0.3 },
  statusSection: { marginBottom: 20 },
  statusBox: { backgroundColor: 'rgba(255,255,255,0.02)', padding: 15, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.05)' },
  statusItem: { marginBottom: 15 },
  statusLabel: { color: '#475569', fontSize: 8, fontWeight: '900', marginBottom: 5 },
  statusValue: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  progressBar: { height: 2, backgroundColor: '#1e293b', marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#22d3ee' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(34, 211, 238, 0.1)' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
    backgroundColor: 'rgba(244, 63, 94, 0.05)',
  },
  logoutText: { color: '#f43f5e', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
});