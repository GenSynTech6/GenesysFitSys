import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert } from 'react-native';
import { Crown, CheckCircle2, ShieldCheck, Zap, ArrowRight } from 'lucide-react-native';
import { getFunctions, httpsCallable } from 'firebase/functions'; // Importe do Firebase WEB SDK
import { Linking } from 'react-native';

const handleContratar = async (planoId: string) => {
    try {
        const functions = getFunctions();
        const apiPagamento = httpsCallable(functions, 'processarAssinaturaGenesys');

        const result = await apiPagamento({ planId: planoId });
        const { checkoutUrl } = result.data as any;

        if (checkoutUrl) {
            // Abre o Mercado Pago no navegador do celular
            await Linking.openURL(checkoutUrl);
        }
    } catch (e) {
        Alert.alert("Erro", "Não foi possível iniciar o portal de pagamento.");
    }
};
// Dentro do seu componente SubscriptionScreen:
const handleSubscribe = async (planId: string) => {
    const functions = getFunctions();
    const chamarSistema = httpsCallable(functions, 'processarAssinaturaGenesys');

    try {
        const result = await chamarSistema({ planId });
        console.log(result.data);
    } catch (error) {
        console.error("Erro ao invocar sistema:", error);
    }
};

const plans = [
    {
        id: 'basic',
        title: 'Plano Básico',
        price: 'R$ 0',
        period: '/mês',
        highlight: false,
        badge: null,
        features: ['Acesso básico', 'Suporte por email'],
    },
    {
        id: 'premium',
        title: 'Plano Premium',
        price: 'R$ 19,90',
        period: '/mês',
        highlight: true,
        badge: 'POPULAR',
        features: ['Acesso total', 'Suporte prioritário', 'Recursos exclusivos'],
    },
];

export default function SubscriptionScreen() {
    const [selectedPlan, setSelectedPlan] = useState('premium');

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header Épico */}
            <View style={styles.header}>
                <Crown color="#FFD700" size={48} strokeWidth={1.5} />
                <Text style={styles.title}>EVOLUA SUA linhagem</Text>
                <Text style={styles.subtitle}>Desbloqueie o poder total do sistema Genesys e alcance o Rank S.</Text>
            </View>

            {/* Cards de Planos */}
            <View style={styles.plansContainer}>
                {plans.map((plan) => (
                    <TouchableOpacity
                        key={plan.id}
                        activeOpacity={0.9}
                        onPress={() => setSelectedPlan(plan.id as any)}
                        style={[
                            styles.planCard,
                            plan.highlight && styles.highlightCard,
                            selectedPlan === plan.id && styles.selectedCard,
                        ]}
                    >
                        {plan.badge && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{plan.badge}</Text>
                            </View>
                        )}

                        <Text style={[styles.planTitle, plan.highlight && { color: '#FFD700' }]}>
                            {plan.title}
                        </Text>

                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>{plan.price}</Text>
                            <Text style={styles.period}>{plan.period}</Text>
                        </View>

                        <View style={styles.divider} />

                        {plan.features.map((feature, index) => (
                            <View key={index} style={styles.featureRow}>                                
                                <CheckCircle2 color={plan.highlight ? "#FFD700" : "#888"} size={18} />
                                <Text style={styles.featureText}>{feature}</Text>
                            </View>
                        ))}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Botão de Ação */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.subscribeButton}>
                    <Text style={styles.subscribeButtonText}>contratar plano</Text>
                    <ArrowRight color="#111" size={20} strokeWidth={3} />
                </TouchableOpacity>
                <Text style={styles.footerNote}>Cancele quando quiser.</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111', // Charcoal
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 30,
        marginBottom: 30,
    },
    title: {
        color: '#FFD700', // Gold
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginTop: 15,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    subtitle: {
        color: '#aaa',
        textAlign: 'center',
        marginTop: 10,
        fontSize: 16,
        lineHeight: 22,
    },
    plansContainer: {
        paddingHorizontal: 20,
        gap: 20,
    },
    planCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 25,
        borderWidth: 1,
        borderColor: '#333',
        position: 'relative',
        overflow: 'hidden',
    },
    highlightCard: {
        borderColor: '#FFD700',
        backgroundColor: '#222',
    },
    selectedCard: {
        backgroundColor: '#252525',
        transform: [{ scale: 1.02 }],
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FFD700',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderBottomLeftRadius: 15,
    },
    badgeText: {
        color: '#111',
        fontWeight: 'bold',
        fontSize: 10,
    },
    planTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    price: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
    },
    period: {
        color: '#888',
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginBottom: 20,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    featureText: {
        color: '#ccc',
        fontSize: 14,
    },
    footer: {
        padding: 30,
        alignItems: 'center',
    },
    subscribeButton: {
        backgroundColor: '#FFD700',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        elevation: 8,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    subscribeButtonText: {
        color: '#111',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    footerNote: {
        color: '#555',
        marginTop: 15,
        fontSize: 12,
    },
});