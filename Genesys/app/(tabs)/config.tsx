import { ScrollView, StyleSheet, View, Text, Switch, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { getAuth, signOut } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { DrawerMenu } from '../../components/drawer-menu';

const { width } = Dimensions.get('window');

export default function ConfigScreen() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [autoSync, setAutoSync] = useState(true);
    const [showDrawer, setShowDrawer] = useState(false);
    
    const auth = getAuth();

    const handleLogout = () => {
        Alert.alert("[ SISTEMA ]", "DESEJA ENCERRAR A CONEXÃO COM O PORTAL?", [
            { text: "CANCELAR", style: "cancel" },
            { text: "SAIR", onPress: () => signOut(auth), style: "destructive" }
        ]);
    };

    return (
        <LinearGradient colors={["#000000", "#020617"]} style={styles.mainContainer}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
                
                {/* HEADER SISTEMA */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setShowDrawer(true)} style={styles.menuIcon}>
                        <Ionicons name="grid-outline" size={24} color="#22d3ee" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>AJUSTES_DE_SISTEMA</Text>
                    <View style={styles.headerLine} />
                </View>

                {/* Seção: Interface */}
                <Text style={styles.sectionHeader}>// INTERFACE_VISUAL</Text>
                <View style={styles.systemBox}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingLabel}>
                            <Ionicons name="moon-sharp" size={18} color="#22d3ee" />
                            <Text style={styles.settingText}>MODO SOMBRA (ALWAYS ON)</Text>
                        </View>
                        <Switch 
                            value={darkMode} 
                            trackColor={{ false: "#0f172a", true: "#22d3ee" }}
                            thumbColor={darkMode ? "#fff" : "#475569"}
                            onValueChange={setDarkMode} 
                        />
                    </View>

                    <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
                        <View style={styles.settingLabel}>
                            <Ionicons name="notifications-sharp" size={18} color="#22d3ee" />
                            <Text style={styles.settingText}>ALERTAS DE MISSÃO</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            trackColor={{ false: "#0f172a", true: "#22d3ee" }}
                            thumbColor={notificationsEnabled ? "#fff" : "#475569"}
                            onValueChange={setNotificationsEnabled}
                        />
                    </View>
                </View>

                {/* Seção: Dados */}
                <Text style={styles.sectionHeader}>// SINCRONIZAÇÃO_DE_DADOS</Text>
                <View style={styles.systemBox}>
                    <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
                        <View style={styles.settingLabel}>
                            <Ionicons name="sync-sharp" size={18} color="#22d3ee" />
                            <Text style={styles.settingText}>AUTO-SYNC XP & STATUS</Text>
                        </View>
                        <Switch 
                            value={autoSync} 
                            trackColor={{ false: "#0f172a", true: "#22d3ee" }}
                            thumbColor={autoSync ? "#fff" : "#475569"}
                            onValueChange={setAutoSync} 
                        />
                    </View>
                </View>

                {/* Ações da Conta */}
                <Text style={styles.sectionHeader}>// AUTENTICAÇÃO</Text>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="power-sharp" size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>ENCERRAR SESSÃO DO JOGADOR</Text>
                </TouchableOpacity>

                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>BUILD: GENESYS_FIT_V1.0.4 [STABLE]</Text>
                    <View style={styles.scanLine} />
                </View>
            </ScrollView>

            <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 25 },
    header: {
        marginTop: 60,
        marginBottom: 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    menuIcon: {
        width: 45,
        height: 45,
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(34, 211, 238, 0.05)'
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 3,
        fontStyle: 'italic'
    },
    headerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(34, 211, 238, 0.2)',
        marginLeft: 10
    },
    sectionHeader: {
        color: '#22d3ee',
        fontSize: 10,
        fontWeight: '900',
        marginBottom: 12,
        letterSpacing: 2,
        opacity: 0.8
    },
    systemBox: {
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.15)',
        marginBottom: 30,
        paddingHorizontal: 15,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(34, 211, 238, 0.05)'
    },
    settingLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    settingText: {
        fontSize: 12,
        color: '#e2e8f0',
        fontWeight: '700',
        letterSpacing: 1
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        marginTop: 5
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: '900',
        fontSize: 11,
        letterSpacing: 1
    },
    versionContainer: {
        marginTop: 60,
        alignItems: 'center',
        opacity: 0.4
    },
    versionText: {
        color: '#22d3ee',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 2
    },
    scanLine: {
        width: 100,
        height: 1,
        backgroundColor: '#22d3ee',
        marginTop: 5,
        opacity: 0.5
    }
});