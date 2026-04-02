import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { getFunctions, httpsCallable } from 'firebase/functions';

const { width } = Dimensions.get('window');

const plans = [
    {
        id: 'basic',
        title: 'RANK-E (FREE)',
        price: 'R$ 0',
        period: '/mês',
        highlight: false,
        badge: 'AVALIAÇÃO',
        features: ['Acesso básico ao portal', 'Suporte via terminal'],
    },
    {
        id: 'premium',
        title: 'RANK-S (PREMIUM)',
        price: 'R$ 19,90',
        period: '/mês',
        highlight: true,
        badge: 'MAIS DESPERTADOS',
        features: ['Acesso total ao Sistema', 'Suporte Prioritário Rank-S', 'Recursos exclusivos de Elite'],
    },
];

export default function SubscriptionScreen() {
    const [selectedPlan, setSelectedPlan] = useState('premium');
    const [loading, setLoading] = useState(false);

    const handleContratar = async (planoId: string) => {
        setLoading(true);
        try {
            const functions = getFunctions();
            const apiPagamento = httpsCallable(functions, 'processarAssinaturaGenesys');
            const result = await apiPagamento({ planId: planoId });
            const { checkoutUrl } = result.data as any;

            if (checkoutUrl) {
                await Linking.openURL(checkoutUrl);
            }
        } catch (e) {
            Alert.alert("[ ERRO DE SISTEMA ]", "NÃO FOI POSSÍVEL INICIAR O PORTAL DE PAGAMENTO.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={["#000000", "#020617", "#0f172a"]} style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
                
                {/* Header Estilo Solo Leveling */}
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
                        onPress={() => handleContratar(selectedPlan)}
                        disabled={loading}
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
                    <Text style={styles.footerNote}>[ O VÍNCULO PODE SER ENCERRADO A QUALQUER MOMENTO ]</Text>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        alignItems: 'center',
        paddingTop: 70,
        paddingHorizontal: 30,
        marginBottom: 40,
    },
    iconGlow: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#22d3ee',
        borderRadius: 50,
        backgroundColor: 'rgba(34, 211, 238, 0.05)',
        marginBottom: 15,
        shadowColor: "#22d3ee",
        shadowRadius: 15,
        shadowOpacity: 0.3,
    },
    systemTag: {
        color: '#22d3ee',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 5,
    },
    title: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '900',
        textAlign: 'center',
        fontStyle: 'italic',
        textTransform: 'uppercase',
    },
    titleHighlight: { color: '#22d3ee' },
    subtitle: {
        color: '#64748b',
        textAlign: 'center',
        marginTop: 12,
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '700',
    },
    plansContainer: { paddingHorizontal: 25, gap: 20 },
    planCard: {
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderRadius: 4,
        padding: 25,
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.1)',
        position: 'relative',
    },
    selectedCard: {
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.03)',
    },
    premiumShadow: {
        shadowColor: "#22d3ee",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        paddingVertical: 5,
        paddingHorizontal: 12,
    },
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
    subscribeButton: { width: '100%', height: 60, elevation: 10, shadowColor: '#22d3ee', shadowOpacity: 0.4, shadowRadius: 10 },
    buttonGradient: { flex: 1, borderRadius: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    subscribeButtonText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
    footerNote: { color: '#475569', marginTop: 20, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
});