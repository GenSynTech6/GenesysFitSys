import { StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { useState, useEffect } from 'react';
import { LinearGradient } from "expo-linear-gradient";

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DrawerMenu } from '@/components/drawer-menu';

const { width } = Dimensions.get('window');

const SHOP_ITEMS = [
  { id: '1', name: 'ELIXIR DE DESPERTAR', price: 500, icon: 'flask-sharp', desc: 'CONTEÚDO: +200 XP IMEDIATO NO NÚCLEO.', type: 'xp' },
  { id: '2', name: 'INSÍGNIA DE PRESTÍGIO', price: 1200, icon: 'shield-sharp', desc: 'COSMÉTICO: DESTAQUE SEU RANK NO SISTEMA.', type: 'cosmetic' },
  { id: '3', name: 'ESCUDO DE PERSISTÊNCIA', price: 300, icon: 'shield-checkmark-sharp', desc: 'BUFF: PROTEGE SUA OFENSIVA (STREAK) POR 24H.', type: 'buff' },
];

export default function ShopScreen() {
  const [moedas, setMoedas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        setMoedas(snapshot.data()?.moedas || 0);
        setLoading(false);
      });
      return () => unsub();
    }
  }, []);

  const processarCompra = async (item: any) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);

    try {
      const updateData: any = {
        moedas: increment(-item.price)
      };

      if (item.type === 'xp') {
        updateData.xp = increment(200);
      }

      await updateDoc(userRef, updateData);
      
      Alert.alert("[ SISTEMA ]", `ITEM ADQUIRIDO: ${item.name}.\n${item.type === 'xp' ? 'XP SINCRONIZADO COM O NÚCLEO.' : 'PROTOCOLO ATIVADO.'}`);
    } catch (error) {
      Alert.alert("[ ERRO ]", "FALHA NA CONEXÃO COM O DATABASE DA LOJA.");
    }
  };

  const handleBuy = (item: any) => {
    if (moedas < item.price) {
      Alert.alert("[ SALDO INSUFICIENTE ]", "RECURSOS INSUFICIENTES. COMPLETE MAIS MISSÕES PARA OBTER CRÉDITOS.");
      return;
    }

    Alert.alert(
      "[ CONFIRMAR TRANSAÇÃO ]",
      `DESEJA TROCAR ${item.price} CRÉDITOS POR ${item.name}?`,
      [
        { text: "ABORTAR", style: "cancel" },
        { text: "ADQUIRIR", onPress: () => processarCompra(item) }
      ]
    );
  };

  if (loading) return (
    <ThemedView style={styles.loading}>
      <ActivityIndicator color="#22d3ee" />
    </ThemedView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#000', dark: '#000' }}
        headerImage={
          <View style={styles.headerContainer}>
            <LinearGradient colors={['rgba(34, 211, 238, 0.15)', 'transparent']} style={styles.headerGlow} />
            <TouchableOpacity onPress={() => setShowDrawer(true)} style={styles.menuBox}>
              <Ionicons name="grid-outline" size={24} color="#22d3ee" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Ionicons name="cart-sharp" size={80} color="#22d3ee" style={styles.headerIconShadow} />
              <ThemedText style={styles.headerTitle}>LOJA_DE_SUPRIMENTOS</ThemedText>
              <View style={styles.headerLine} />
            </View>
          </View>
        }>

        <ThemedView style={styles.content}>
          {/* TESOURO DO JOGADOR */}
          <View style={styles.balanceWindow}>
            <View>
              <ThemedText style={styles.balanceLabel}>CRÉDITOS DISPONÍVEIS</ThemedText>
              <View style={styles.coinBadge}>
                <Ionicons name="flash-sharp" size={22} color="#22d3ee" />
                <ThemedText style={styles.coinText}>{moedas}</ThemedText>
              </View>
            </View>
            <View style={styles.balanceDecoration} />
          </View>

          <ThemedText style={styles.sectionTitle}>// ITENS_DISPONÍVEIS</ThemedText>

          {SHOP_ITEMS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              activeOpacity={0.8}
              style={[styles.itemCard, moedas < item.price && styles.itemCardDisabled]}
              onPress={() => handleBuy(item)}
            >
              <View style={styles.iconBox}>
                <Ionicons name={item.icon as any} size={28} color="#22d3ee" />
              </View>
              
              <View style={styles.itemInfo}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <ThemedText style={styles.itemDesc}>{item.desc}</ThemedText>
              </View>

              <View style={[styles.priceTag, moedas < item.price ? styles.priceTagDisabled : styles.priceTagActive]}>
                <ThemedText style={[styles.priceText, { color: moedas < item.price ? '#475569' : '#000' }]}>
                  {item.price}
                </ThemedText>
                <Ionicons name="flash-sharp" size={12} color={moedas < item.price ? '#475569' : '#000'} />
              </View>
            </TouchableOpacity>
          ))}
          
        </ThemedView>
      </ParallaxScrollView>
      
      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  headerContainer: {
    height: '100%',
    backgroundColor: '#000',
    paddingTop: 50,
    paddingHorizontal: 25,
    justifyContent: 'center'
  },
  headerGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  menuBox: { 
    position: 'absolute', top: 60, left: 25, 
    width: 45, height: 45, 
    borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(34, 211, 238, 0.05)'
  },
  headerContent: { alignItems: 'center', marginTop: 20 },
  headerIconShadow: {
    shadowColor: "#22d3ee",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 15,
    fontStyle: 'italic'
  },
  headerLine: { width: 60, height: 2, backgroundColor: '#22d3ee', marginTop: 10 },
  content: { padding: 25, backgroundColor: '#000', minHeight: 700 },
  
  balanceWindow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: '#22d3ee'
  },
  balanceDecoration: { width: 10, height: 40, borderRightWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)' },
  balanceLabel: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  coinBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  coinText: { color: '#22d3ee', fontSize: 28, fontWeight: '900', fontStyle: 'italic' },
  
  sectionTitle: { color: '#22d3ee', fontSize: 10, fontWeight: '900', marginBottom: 15, letterSpacing: 2, opacity: 0.8 },

  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    padding: 15,
    borderRadius: 2,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.1)',
  },
  itemCardDisabled: { opacity: 0.5 },
  iconBox: {
    width: 55,
    height: 55,
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemName: { color: '#fff', fontSize: 13, fontWeight: '900', fontStyle: 'italic', letterSpacing: 0.5 },
  itemDesc: { color: '#64748b', fontSize: 10, marginTop: 4, fontWeight: '700', lineHeight: 14 },
  
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 2,
    gap: 4,
  },
  priceTagActive: { backgroundColor: '#22d3ee' },
  priceTagDisabled: { backgroundColor: '#1e293b' },
  priceText: { fontWeight: '900', fontSize: 14 },
});