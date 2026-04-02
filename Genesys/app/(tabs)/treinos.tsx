import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Modal, Dimensions, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { DrawerMenu } from "../../components/drawer-menu";

const { width } = Dimensions.get('window');

const exerciciosDisponiveis: Record<string, string[]> = {
    Peito: ["Supino Barra", "Supino Halter", "Supino Inclinado", "Crucifixo", "Cross Over", "Flexão", "Peck Deck"],
    Costas: ["Puxada Frente", "Remada Baixa", "Remada Unilateral", "Barra Fixa", "Levantamento Terra", "Pull Down", "Remada Curvada"],
    Pernas: ["Agachamento", "Leg Press", "Extensora", "Flexora", "Afundo", "Stiff", "Cadeira Abdutora", "Panturrilha em Pé"],
    Ombros: ["Desenvolvimento Halter", "Elevação Lateral", "Elevação Frontal", "Face Pull", "Desenvolvimento Arnold", "Encolhimento"],
    Biceps: ["Rosca Direta", "Rosca Martelo", "Rosca Scott", "Rosca Concentrada", "Rosca Inversa"],
    Triceps: ["Tríceps Corda", "Tríceps Testa", "Tríceps Pulley", "Mergulho Banco", "Tríceps Francês"],
    Abdomen: ["Abdominal Supra", "Abdominal Infra", "Plancha", "Russian Twist", "Elevação de Pernas"],
};

interface Exercicio {
    nome: string;
    series: number;
    reps: number;
}

export default function TreinosScreen() {
    const auth = getAuth();
    const db = getFirestore();
    const [userData, setUserData] = useState<any>(null);
    const [showDrawer, setShowDrawer] = useState(false);
    const [loading, setLoading] = useState(true);

    const [modalCriar, setModalCriar] = useState(false);
    const [modalView, setModalView] = useState<any>(null);
    const [nomeRotina, setNomeRotina] = useState("");
    const [exerciciosSelecionados, setExerciciosSelecionados] = useState<Exercicio[]>([]);
    const [grupoAtivo, setGrupoAtivo] = useState("Peito");

    useEffect(() => {
        if (auth.currentUser) {
            const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
                setUserData(snapshot.data());
                setLoading(false);
            });
            return () => unsub();
        }
    }, []);

    const imagensExercicios: Record<string, string> = {
        "Supino Barra": "https://grandeatleta.com.br/blog/wp-content/uploads/2025/08/supino-inclinado-com-barra-como-fazer.gif",
        "Supino Halter": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/supino-reto-com-halteres.gif",
        "Peck Deck": "https://i.pinimg.com/originals/a2/12/cd/a212cde8804175ee82be3abe83ca51e3.gif",
        "Rosca Direta": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmN4eXoxbm93bmZid2R4eHh4eHh4eHh4eHh4eHh4eHh4eHh4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCBhbmRfaWQ9MA/3o7TKMGpxx8y93NAdq/giphy.gif",
        "Hip Thrust": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Hip-Thrust.gif",
        "Padrão": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueXZueXZueXZueXZueXZueXZueXZueXZueXZueXZueXZueZ3JpZCUyMGZpdG5lc3MlMjBhbmltYXRpb24v/giphy.gif"
    };

    const deletarRotina = (rotina: any) => {
        Alert.alert(
            "EXTERMINAR REGISTRO",
            `Deseja apagar a missão "${rotina.nome.toUpperCase()}"?`,
            [
                { text: "ABORTAR", style: "cancel" },
                {
                    text: "CONFIRMAR",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const userRef = doc(db, "users", auth.currentUser!.uid);
                            await updateDoc(userRef, { rotinasPersonalizadas: arrayRemove(rotina) });
                        } catch (error) {
                            Alert.alert("Erro", "Falha ao deletar do Grimório.");
                        }
                    }
                }
            ]
        );
    };

    const getTreinoRank = (count: number) => {
        if (count <= 3) return { label: 'RANK_E', color: '#64748b' };
        if (count <= 5) return { label: 'RANK_C', color: '#0ea5e9' };
        if (count <= 7) return { label: 'RANK_A', color: '#f43f5e' };
        return { label: 'RANK_S', color: '#22d3ee' };
    };

    const toggleExercicio = (nomeEx: string) => {
        setExerciciosSelecionados(prev => {
            const existe = prev.find(item => item.nome === nomeEx);
            if (existe) return prev.filter(item => item.nome !== nomeEx);
            return [...prev, { nome: nomeEx, series: 3, reps: 12 }];
        });
    };

    const ajustarValor = (nome: string, campo: 'series' | 'reps', delta: number) => {
        setExerciciosSelecionados(prev => prev.map(ex => {
            if (ex.nome === nome) return { ...ex, [campo]: Math.max(1, ex[campo] + delta) };
            return ex;
        }));
    };

    const salvarRotina = async () => {
        if (!nomeRotina || exerciciosSelecionados.length === 0) return Alert.alert("AVISO", "DEFINA O NOME E OS OBJETIVOS.");
        try {
            const userRef = doc(db, "users", auth.currentUser!.uid);
            const novaRotina = { id: Date.now().toString(), nome: nomeRotina, exercicios: exerciciosSelecionados, criadoEm: new Date().toISOString() };
            await updateDoc(userRef, { rotinasPersonalizadas: arrayUnion(novaRotina) });
            setModalCriar(false); setNomeRotina(""); setExerciciosSelecionados([]);
        } catch (error) { Alert.alert("ERRO", "FALHA NA SINCRONIZAÇÃO."); }
    };

    if (loading) return (
        <LinearGradient colors={["#000", "#020617"]} style={styles.loading}>
            <ActivityIndicator color="#22d3ee" />
        </LinearGradient>
    );

    return (
        <LinearGradient colors={["#000", "#020617"]} style={styles.container}>
            {/* HEADER */}
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => setShowDrawer(true)} style={styles.menuBox}>
                    <Ionicons name="grid-outline" size={24} color="#22d3ee" />
                </TouchableOpacity>
                <Text style={styles.headerTag}>SISTEMA // DATABASE_TREINOS</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <Text style={styles.title}>GRIMÓRIO_DE_MISSÕES</Text>
                
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>REGISTROS_ATIVOS</Text>
                    <TouchableOpacity style={styles.createBtn} onPress={() => setModalCriar(true)}>
                        <Ionicons name="add-circle-outline" size={18} color="#000" />
                        <Text style={styles.createBtnText}>CRIAR</Text>
                    </TouchableOpacity>
                </View>

                {userData?.rotinasPersonalizadas?.map((rotina: any) => {
                    const rank = getTreinoRank(rotina.exercicios.length);
                    return (
                        <TouchableOpacity
                            key={rotina.id}
                            style={[styles.rotinaCard, { borderLeftColor: rank.color }]}
                            onPress={() => setModalView(rotina)}
                            onLongPress={() => deletarRotina(rotina)}
                        >
                            <View style={styles.rotinaMainInfo}>
                                <Text style={[styles.rankBadge, { color: rank.color }]}>{rank.label}</Text>
                                <Text style={styles.rotinaNome}>{rotina.nome.toUpperCase()}</Text>
                                <Text style={styles.rotinaExCount}>{rotina.exercicios.length} MÓDULOS DE COMBATE</Text>
                            </View>
                            <Ionicons name="scan-outline" size={20} color="#1e293b" />
                        </TouchableOpacity>
                    );
                })}

                <View style={styles.separator} />

                <Text style={styles.sectionTitle}>BIBLIOTECA_DO_SISTEMA</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
                    {Object.keys(exerciciosDisponiveis).map(grupo => (
                        <TouchableOpacity
                            key={grupo}
                            onPress={() => setGrupoAtivo(grupo)}
                            style={[styles.tabItem, grupoAtivo === grupo && styles.tabItemActive]}
                        >
                            <Text style={[styles.tabText, grupoAtivo === grupo && styles.tabTextActive]}>{grupo.toUpperCase()}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.libList}>
                    {exerciciosDisponiveis[grupoAtivo].map((ex, i) => (
                        <View key={ex} style={styles.libItemContainer}>
                            <View style={styles.libHeader}>
                                <Text style={styles.libIndex}>0{i + 1}</Text>
                                <Text style={styles.libText}>{ex.toUpperCase()}</Text>
                            </View>
                            <Image
                                source={{ uri: imagensExercicios[ex] || imagensExercicios["Padrão"] }}
                                style={styles.exercisePreview}
                                resizeMode="cover"
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* MODAL VIEW */}
            <Modal visible={!!modalView} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <LinearGradient colors={["#0f172a", "#020617"]} style={styles.viewModalContent}>
                        <View style={styles.viewModalHeader}>
                            <View>
                                <Text style={styles.viewModalSub}>DADOS_DA_MISSÃO</Text>
                                <Text style={styles.viewModalTitle}>{modalView?.nome.toUpperCase()}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalView(null)}>
                                <Ionicons name="close-circle-outline" size={32} color="#22d3ee" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.viewExList} showsVerticalScrollIndicator={false}>
                            {modalView?.exercicios.map((ex: Exercicio, index: number) => (
                                <View key={index} style={styles.viewExItem}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.viewExText}>{ex.nome.toUpperCase()}</Text>
                                        <Text style={styles.viewExStats}>{ex.series} SETS // {ex.reps} REPS</Text>
                                    </View>
                                    <View style={styles.viewExBadge}>
                                        <Text style={styles.viewExBadgeText}>{ex.series}x{ex.reps}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setModalView(null)}>
                            <Text style={styles.closeBtnText}>FECHAR_MODAL</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </Modal>

            {/* MODAL CRIAR */}
            <Modal visible={modalCriar} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>REGISTRAR_NOVA_MISSÃO</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="NOME_DO_PROTOCOLO"
                            placeholderTextColor="#475569"
                            value={nomeRotina}
                            onChangeText={setNomeRotina}
                        />

                        <ScrollView style={{ marginVertical: 15 }} showsVerticalScrollIndicator={false}>
                            <Text style={styles.grupoLabel}>SELECIONAR_MÓDULOS</Text>
                            {Object.entries(exerciciosDisponiveis).map(([categoria, lista]) => (
                                <View key={categoria} style={{ marginBottom: 20 }}>
                                    <Text style={styles.categoryTitle}>{categoria.toUpperCase()}</Text>
                                    <View style={styles.chipContainer}>
                                        {lista.map(ex => {
                                            const selecionado = exerciciosSelecionados.find(s => s.nome === ex);
                                            return (
                                                <TouchableOpacity
                                                    key={ex}
                                                    onPress={() => toggleExercicio(ex)}
                                                    style={[styles.chip, selecionado && styles.chipActive]}
                                                >
                                                    <Text style={[styles.chipText, selecionado && styles.chipTextActive]}>{ex.toUpperCase()}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            ))}

                            {exerciciosSelecionados.length > 0 && (
                                <>
                                    <View style={styles.configDivider} />
                                    <Text style={styles.grupoLabel}>AJUSTE_DE_CARGA_E_VOLUME</Text>
                                    {exerciciosSelecionados.map((ex) => (
                                        <View key={ex.nome} style={styles.editCard}>
                                            <Text style={styles.editCardTitle}>{ex.nome.toUpperCase()}</Text>
                                            <View style={styles.editRow}>
                                                <Counter label="SETS" value={ex.series} onAdj={(d) => ajustarValor(ex.nome, 'series', d)} />
                                                <Counter label="REPS" value={ex.reps} onAdj={(d) => ajustarValor(ex.nome, 'reps', d)} />
                                            </View>
                                        </View>
                                    ))}
                                </>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalCriar(false)}>
                                <Text style={styles.cancelBtnText}>ABORTAR</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={salvarRotina}>
                                <Text style={styles.saveBtnText}>SINCRONIZAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
        </LinearGradient>
    );
}

const Counter = ({ label, value, onAdj }: { label: string, value: number, onAdj: (d: number) => void }) => (
    <View style={styles.counterGroup}>
        <Text style={styles.counterLabel}>{label}</Text>
        <View style={styles.counterActions}>
            <TouchableOpacity onPress={() => onAdj(-1)}><Ionicons name="remove-circle-outline" size={24} color="#475569" /></TouchableOpacity>
            <Text style={styles.counterValue}>{value}</Text>
            <TouchableOpacity onPress={() => onAdj(1)}><Ionicons name="add-circle-outline" size={24} color="#22d3ee" /></TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    headerTop: { flexDirection: 'row', alignItems: 'center', marginTop: 50, marginBottom: 20 },
    menuBox: { width: 45, height: 45, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(34, 211, 238, 0.05)' },
    headerTag: { color: '#22d3ee', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginLeft: 15 },

    title: { color: '#fff', fontSize: 20, fontWeight: "900", letterSpacing: 3, marginBottom: 30, fontStyle: 'italic', textAlign: 'center' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    createBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#22d3ee', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 2 },
    createBtnText: { color: '#000', fontWeight: '900', fontSize: 11 },

    rotinaCard: { backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: 2, padding: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.05)', borderLeftWidth: 4 },
    rotinaMainInfo: { flex: 1 },
    rankBadge: { fontSize: 8, fontWeight: '900', marginBottom: 4 },
    rotinaNome: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
    rotinaExCount: { color: '#475569', fontSize: 9, fontWeight: 'bold', marginTop: 4 },

    separator: { height: 1, backgroundColor: 'rgba(34, 211, 238, 0.1)', marginVertical: 30 },

    tabBar: { marginBottom: 20 },
    tabItem: { paddingHorizontal: 15, paddingVertical: 10, marginRight: 8, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.1)', backgroundColor: 'rgba(15, 23, 42, 0.5)' },
    tabItemActive: { backgroundColor: 'rgba(34, 211, 238, 0.1)', borderColor: '#22d3ee' },
    tabText: { color: '#475569', fontWeight: '900', fontSize: 10 },
    tabTextActive: { color: '#22d3ee' },

    libList: { gap: 15 },
    libItemContainer: { backgroundColor: 'rgba(15, 23, 42, 0.5)', borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.05)', overflow: 'hidden' },
    libHeader: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    libIndex: { color: '#22d3ee', fontSize: 12, fontWeight: '900', marginRight: 15, opacity: 0.5 },
    libText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
    exercisePreview: { width: '100%', height: 250, backgroundColor: '#000', opacity: 0.8 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    viewModalContent: { borderRadius: 2, padding: 25, width: '90%', maxHeight: '80%', borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)' },
    viewModalHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(34, 211, 238, 0.1)', paddingBottom: 15 },
    viewModalSub: { color: '#475569', fontSize: 8, fontWeight: '900' },
    viewModalTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', marginTop: 5 },
    viewExList: { marginVertical: 20 },
    viewExItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, marginBottom: 10, borderLeftWidth: 2, borderLeftColor: '#22d3ee' },
    viewExText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
    viewExStats: { color: '#475569', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
    viewExBadge: { backgroundColor: 'rgba(34, 211, 238, 0.1)', padding: 6, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)' },
    viewExBadgeText: { color: '#22d3ee', fontSize: 10, fontWeight: '900' },
    closeBtn: { backgroundColor: '#22d3ee', padding: 15, alignItems: 'center' },
    closeBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },

    modalContent: { backgroundColor: '#020617', padding: 25, width: '95%', maxHeight: '90%', borderWidth: 1, borderColor: '#22d3ee' },
    modalTitle: { color: '#fff', fontSize: 16, fontWeight: '900', textAlign: 'center', marginBottom: 20, letterSpacing: 2 },
    input: { backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#FFF', padding: 15, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)', fontSize: 14, fontWeight: '900', marginBottom: 15 },
    grupoLabel: { color: '#22d3ee', fontSize: 10, fontWeight: '900', marginBottom: 15, letterSpacing: 1 },
    categoryTitle: { color: '#475569', fontSize: 8, fontWeight: '900', marginBottom: 10 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.1)' },
    chipActive: { backgroundColor: 'rgba(34, 211, 238, 0.1)', borderColor: '#22d3ee' },
    chipText: { color: '#475569', fontSize: 9, fontWeight: '900' },
    chipTextActive: { color: '#22d3ee' },

    configDivider: { height: 1, backgroundColor: 'rgba(34, 211, 238, 0.1)', marginVertical: 25 },
    editCard: { backgroundColor: 'rgba(255,255,255,0.02)', padding: 15, marginBottom: 10, borderLeftWidth: 2, borderLeftColor: '#22d3ee' },
    editCardTitle: { color: '#FFF', fontWeight: '900', fontSize: 12, marginBottom: 15 },
    editRow: { flexDirection: 'row', justifyContent: 'space-between' },
    counterGroup: { alignItems: 'center' },
    counterLabel: { color: '#475569', fontSize: 8, fontWeight: '900', marginBottom: 8 },
    counterActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    counterValue: { color: '#FFF', fontSize: 16, fontWeight: '900', minWidth: 25, textAlign: 'center' },

    modalFooter: { flexDirection: 'row', gap: 15, marginTop: 20 },
    cancelBtn: { flex: 1, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(244, 63, 94, 0.3)' },
    cancelBtnText: { color: '#f43f5e', fontWeight: '900', fontSize: 12 },
    saveBtn: { flex: 2, backgroundColor: '#22d3ee', padding: 15, alignItems: 'center' },
    saveBtnText: { color: '#000', fontWeight: '900', fontSize: 14 }
});