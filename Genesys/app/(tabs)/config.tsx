import { ScrollView, StyleSheet, View, Text, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { DrawerMenu } from '../../components/drawer-menu';

export default function ConfigScreen() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [autoSync, setAutoSync] = useState(true);
    const [showDrawer, setShowDrawer] = useState(false);

    return (
        <>
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.menuButton} onPress={() => setShowDrawer(true)}>
                <Ionicons name="menu" size={28} color="#f5d104" />
            </TouchableOpacity>

            <View style={styles.section}>
                <Text style={styles.title}>Configurações</Text>
            </View>


            <View style={styles.settingItem}>
                <Text style={styles.settingText}>Notificações</Text>
                <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                />
            </View>

            <View style={styles.settingItem}>
                <Text style={styles.settingText}>Modo Escuro</Text>
                <Switch value={darkMode} onValueChange={setDarkMode} />
            </View>

            <View style={styles.settingItem}>
                <Text style={styles.settingText}>Sincronizar Automaticamente</Text>
                <Switch value={autoSync} onValueChange={setAutoSync} />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => {}}>
                    <Text style={styles.buttonText}>Salvar Preferências</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
        <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#072018',
        bottom: -56,
    },
    menuButton: { 
        position: "absolute", 
        top: 16, 
        left: 20, 
        zIndex: 10 
    },
    section: {
        padding: 16,
        marginTop: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#ffffff',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    settingText: {
        fontSize: 16,
        color: '#fff5f5',
    },
    buttonContainer: {
        paddingHorizontal: 16,
        paddingBottom: 24,
        marginTop: 16,
    },
    button: {
        backgroundColor: '#f5d104',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});