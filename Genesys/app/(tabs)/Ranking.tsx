import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { DrawerMenu } from '@/components/drawer-menu';

const { width } = Dimensions.get('window');

interface UserRanking {
  id: string;
  username?: string;
  rank?: string;
  xp: number;
  streak?: number;
}

export default function LeaderboardScreen() {
  const [topUsers, setTopUsers] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(10));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as UserRanking[];
      
      setTopUsers(users);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const renderRankIcon = (index: number) => {
    if (index === 0) return <Ionicons name="shield-half-sharp" size={24} color="#22d3ee" />;
    if (index === 1) return <Ionicons name="shield-sharp" size={22} color="rgba(34, 211, 238, 0.7)" />;
    if (index === 2) return <Ionicons name="shield-outline" size={20} color="rgba(34, 211, 238, 0.5)" />;
    return <ThemedText style={styles.rankNumber}>{index + 1}</ThemedText>;
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#22d3ee" />
    </View>
  );

  return (
    <LinearGradient colors={["#000", "#020617"]} style={styles.container}>
      
      {/* HEADER PROTOCOLO */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuBox} onPress={() => setShowDrawer(true)}>
          <Ionicons name="grid-outline" size={24} color="#22d3ee" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTag}>SISTEMA // RANKING_GLOBAL</ThemedText>
      </View>

      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>LIGA_DOS_MONARCAS</ThemedText>
        <View style={styles.separator} />
        <ThemedText style={styles.headerSub}>TOP_10_CAÇADORES_ATIVOS</ThemedText>
      </View>

      <FlatList
        data={topUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
        renderItem={({ item, index }) => (
          <View style={[
            styles.userCard, 
            index < 3 && styles.topThreeCard,
            index === 0 && styles.firstPlaceBorder
          ]}>
            {index === 0 && <LinearGradient colors={['rgba(34, 211, 238, 0.15)', 'transparent']} style={styles.cardGlow} />}
            
            <View style={styles.rankSection}>
              {renderRankIcon(index)}
            </View>
            
            <View style={styles.userInfo}>
              <ThemedText style={[styles.userName, index === 0 && { color: '#22d3ee' }]}>
                {item.username?.toUpperCase() || "PLAYER_UNKNOWN"}
              </ThemedText>
              <View style={styles.rankBadgeContainer}>
                <ThemedText style={styles.userRankBadge}>{item.rank || "RANK_E"}</ThemedText>
              </View>
            </View>

            <View style={styles.statsSection}>
              <View style={styles.xpContainer}>
                <ThemedText style={styles.xpValue}>{item.xp}</ThemedText>
                <ThemedText style={styles.xpLabel}>XP</ThemedText>
              </View>
              <View style={styles.streakRow}>
                <Ionicons name="flame-sharp" size={10} color="#ef4444" />
                <ThemedText style={styles.streakValue}>{item.streak || 0}</ThemedText>
              </View>
            </View>
          </View>
        )}
      />

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  
  topBar: { flexDirection: 'row', alignItems: 'center', marginTop: 50, paddingHorizontal: 20, marginBottom: 20 },
  menuBox: { width: 45, height: 45, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(34, 211, 238, 0.05)' },
  headerTag: { color: '#22d3ee', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginLeft: 15 },

  header: { alignItems: 'center', marginBottom: 30 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 4, fontStyle: 'italic' },
  separator: { width: 40, height: 2, backgroundColor: '#22d3ee', marginVertical: 8 },
  headerSub: { color: '#475569', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  userCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(15, 23, 42, 0.4)', 
    padding: 18, 
    borderRadius: 2, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.05)',
    position: 'relative',
    overflow: 'hidden'
  },
  topThreeCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  firstPlaceBorder: {
    borderColor: '#22d3ee',
    borderLeftWidth: 4,
  },
  cardGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  
  rankSection: { width: 40, alignItems: 'center' },
  rankNumber: { color: '#475569', fontWeight: '900', fontSize: 14, fontStyle: 'italic' },
  
  userInfo: { flex: 1, marginLeft: 15 },
  userName: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  rankBadgeContainer: { marginTop: 4 },
  userRankBadge: { color: '#475569', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  
  statsSection: { alignItems: 'flex-end' },
  xpContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  xpValue: { color: '#22d3ee', fontWeight: '900', fontSize: 16, fontStyle: 'italic' },
  xpLabel: { color: '#22d3ee', fontSize: 8, fontWeight: '900' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  streakValue: { color: '#ef4444', fontWeight: '900', fontSize: 10 }
});