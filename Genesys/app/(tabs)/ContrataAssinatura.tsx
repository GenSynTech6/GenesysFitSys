import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert, Modal, Clipboard, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get('window');

const plans = [
    {
        id: 'basic',
        title: 'RANK-E (FREE)',
        price: 'R$ 0',
        period: '/mês',
        highlight: false,
        badge: 'AVALIAÇÃO',
        features: ['Acesso básico ao portal', 'Suporte via terminal', 'Treinos Padrão'],
    },
    {
        id: 'premium',
        title: 'RANK-S (PREMIUM)',
        price: 'R$ 19,90',
        period: '/mês',
        highlight: true,
        badge: 'MAIS DESPERTADOS',
        features: [
            'Acesso total ao Sistema IA', 
            'Consultoria Estratégica Rank-S', 
            'Bônus de 500 Créditos de Sistema',
            'Remoção de Limites de Evolução'
        ],
    },
];

export default function SubscriptionScreen() {
    const [selectedPlan, setSelectedPlan] = useState('premium');
    const [showPixModal, setShowPixModal] = useState(false);

    // DADOS DO SEU PIX - COLOQUE SUA CHAVE AQUI
    const PIX_KEY = "(11)930549420"; 
    const BENEFICIARIO = "Equipe Genesys";

    const handleContratar = () => {
        if (selectedPlan === 'basic') {
            Alert.alert("[ SISTEMA ]", "VOCÊ JÁ POSSUI ACESSO AO RANK-E.");
            return;
        }
        // Abre o modal de pagamento manual (PIX)
        setShowPixModal(true);
    };

    const copiarPix = () => {
        Clipboard.setString(PIX_KEY);
        Alert.alert("[ SISTEMA ]", "CÓDIGO PIX COPIADO PARA A ÁREA DE TRANSFERÊNCIA.");
    };

    return (
        <LinearGradient colors={["#000000", "#020617", "#0f172a"]} style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconGlow}>
                        <Ionicons name="flash" size={40} color="#22d3ee" />
                    </View>
                    <Text style={styles.systemTag}>// PROTOCOLO_DE_EVOLUÇÃO</Text>
                    <Text style={styles.title}>SUPERE SUA <Text style={styles.titleHighlight}>LINHAGEM</Text></Text>
                    <Text style={styles.subtitle}>Desbloqueie o poder total do sistema Genesys e alcance o topo do Rank-S.</Text>
                </View>

                {/* Cards de Planos */}
                <View style={styles.plansContainer}>
                    {plans.map((plan) => (
                        <TouchableOpacity
                            key={plan.id}
                            activeOpacity={0.8}
                            onPress={() => setSelectedPlan(plan.id)}
                            style={[
                                styles.planCard,
                                selectedPlan === plan.id && styles.selectedCard,
                                plan.highlight && styles.premiumShadow
                            ]}
                        >
                            {plan.badge && (
                                <View style={[styles.badge, plan.highlight ? styles.badgePremium : styles.badgeBasic]}>
                                    <Text style={styles.badgeText}>{plan.badge}</Text>
                                </View>
                            )}

                            <Text style={[styles.planTitle, plan.highlight && { color: '#22d3ee' }]}>
                                {plan.title}
                            </Text>

                            <View style={styles.priceContainer}>
                                <Text style={styles.price}>{plan.price}</Text>
                                <Text style={styles.period}>{plan.period}</Text>
                            </View>

                            <View style={[styles.divider, plan.highlight && { backgroundColor: 'rgba(34, 211, 238, 0.3)' }]} />

                            {plan.features.map((feature, index) => (
                                <View key={index} style={styles.featureRow}>                                
                                    <Ionicons 
                                        name="shield-checkmark" 
                                        color={plan.highlight ? "#22d3ee" : "#475569"} 
                                        size={16} 
                                    />
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Botão de Ação */}
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.subscribeButton}
                        onPress={handleContratar}
                    >
                        <LinearGradient 
                            colors={["#0891b2", "#22d3ee"]} 
                            start={{x: 0, y: 0}} 
                            end={{x: 1, y: 0}} 
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.subscribeButtonText}>INICIAR DESPERTAR</Text>
                            <Ionicons name="arrow-forward" color="#000" size={20} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* MODAL PIX MOMENTÂNEO */}
            <Modal visible={showPixModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.pixCard}>
                        <View style={styles.pixHeader}>
                            <Ionicons name="qr-code-outline" size={30} color="#22d3ee" />
                            <Text style={styles.pixTitle}>PORTAL DE PAGAMENTO</Text>
                            <TouchableOpacity onPress={() => setShowPixModal(false)}>
                                <Ionicons name="close" size={24} color="#475569" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.pixInstruction}>
                            Para despertar o <Text style={{color: '#22d3ee'}}>RANK-S</Text>, realize a transferência via PIX e envie o comprovante no suporte.
                        </Text>

                        <View style={styles.pixKeyBox}>
                            <Text style={styles.pixKeyLabel}>CHAVE PIX (E-MAIL/CPF):</Text>
                            <Text style={styles.pixKeyValue}>{PIX_KEY}</Text>
                            <Text style={styles.pixKeyOwner}>{BENEFICIARIO}</Text>
                        </View>

                        <TouchableOpacity style={styles.copyButton} onPress={copiarPix}>
                            <Ionicons name="copy-outline" size={20} color="#000" />
                            <Text style={styles.copyButtonText}>COPIAR CHAVE PIX</Text>
                        </TouchableOpacity>

                        <Text style={styles.pixWarning}>
                            [ APÓS O PAGAMENTO, O SISTEMA SERÁ ATUALIZADO MANUALMENTE PELO ADMINISTRADOR ]
                        </Text>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { alignItems: 'center', paddingTop: 70, paddingHorizontal: 30, marginBottom: 40 },
    iconGlow: {
        padding: 15, borderWidth: 1, borderColor: '#22d3ee', borderRadius: 50,
        backgroundColor: 'rgba(34, 211, 238, 0.05)', marginBottom: 15,
        shadowColor: "#22d3ee", shadowRadius: 15, shadowOpacity: 0.3,
    },
    systemTag: { color: '#22d3ee', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 5 },
    title: { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center', fontStyle: 'italic', textTransform: 'uppercase' },
    titleHighlight: { color: '#22d3ee' },
    subtitle: { color: '#64748b', textAlign: 'center', marginTop: 12, fontSize: 13, lineHeight: 20, fontWeight: '700' },
    plansContainer: { paddingHorizontal: 25, gap: 20 },
    planCard: {
        backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 4, padding: 25,
        borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.1)', position: 'relative',
    },
    selectedCard: { borderColor: '#22d3ee', backgroundColor: 'rgba(34, 211, 238, 0.03)' },
    premiumShadow: { shadowColor: "#22d3ee", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 20 },
    badge: { position: 'absolute', top: 0, right: 0, paddingVertical: 5, paddingHorizontal: 12 },
    badgePremium: { backgroundColor: '#22d3ee' },
    badgeBasic: { backgroundColor: '#1e293b' },
    badgeText: { color: '#000', fontWeight: '900', fontSize: 9, letterSpacing: 1 },
    planTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 8, fontStyle: 'italic' },
    priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
    price: { color: '#fff', fontSize: 28, fontWeight: '900' },
    period: { color: '#64748b', fontSize: 14, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 20 },
    featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
    featureText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
    footer: { padding: 30, alignItems: 'center' },
    subscribeButton: { width: '100%', height: 60 },
    buttonGradient: { flex: 1, borderRadius: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    subscribeButtonText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

    // ESTILOS DO MODAL PIX
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 20 },
    pixCard: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#22d3ee', padding: 25, borderRadius: 2 },
    pixHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    pixTitle: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
    pixInstruction: { color: '#94a3b8', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 25 },
    pixKeyBox: { backgroundColor: 'rgba(34, 211, 238, 0.05)', padding: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: '#22d3ee', alignItems: 'center', marginBottom: 20 },
    pixKeyLabel: { color: '#22d3ee', fontSize: 10, fontWeight: '900', marginBottom: 5 },
    pixKeyValue: { color: '#fff', fontSize: 16, fontWeight: '900' },
    pixKeyOwner: { color: '#475569', fontSize: 11, marginTop: 5, fontWeight: '700' },
    copyButton: { backgroundColor: '#22d3ee', padding: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    copyButtonText: { color: '#000', fontWeight: '900', fontSize: 14 },
    pixWarning: { color: '#475569', fontSize: 9, textAlign: 'center', marginTop: 20, fontWeight: '900' }
});