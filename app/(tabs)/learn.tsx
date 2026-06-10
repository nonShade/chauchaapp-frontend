import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LearnDetailView } from '../learn-detail';
import LearnQuizStep from '../learn-quiz';
import { APP_THEME } from '@/constants/themes';
import { getLearnModules, generateAndWaitForModules } from '@/services/api/learnModules';
import { LearnModule } from '@/types/modulesTypes';
import ModulePlanningTabs from '@/components/learn/ModulePlanningTabs';
import PlanningCard from '@/components/learn/PlanningCard';
import { LearnModulesSkeleton } from '@/components/learn/LearnModulesSkeleton';
import { PlanningSkeleton } from '@/components/learn/PlanningSkeleton';
import { getFinancialPlanningTips, generateAndWaitForFinancialPlanning } from '@/services/api/financialPlanning';
import { FinancialPlanningTip } from '@/types/planningTypes';

export default function AprenderScreen() {
  const mounted = useRef(true);
  const [modules, setModules] = useState<LearnModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'list' | 'detail' | 'quiz'>('list');
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string | null>(null);
  const [quizResultPercent, setQuizResultPercent] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'planning'>('modules');
  const [planningTips, setPlanningTips] = useState<FinancialPlanningTip[]>([]);
  const [planningLoading, setPlanningLoading] = useState(true);
  const [planningError, setPlanningError] = useState<string | null>(null);
  const [selectedPlanningTip, setSelectedPlanningTip] = useState<FinancialPlanningTip | null>(null);

  useEffect(() => {
    loadModules();
    loadPlanningTips();
    return () => { mounted.current = false; };
  }, []);

  async function loadModules() {
    try {
      setLoading(true);
      setError(null);

      const existing = await getLearnModules();
      if (!mounted.current) return;

      if (existing.length > 0) {
        setModules(existing);
        setLoading(false);

        generateAndWaitForModules()
          .then((fresh) => {
            if (mounted.current && fresh.length > 0) setModules(fresh);
          })
          .catch((err) =>
            console.error('Background modules refresh failed:', err)
          );
      } else {
        const data = await generateAndWaitForModules();
        if (!mounted.current) return;
        setModules(data);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error cargando módulos:', err);
      if (!mounted.current) return;
      setError('No se pudieron cargar los módulos. Intenta de nuevo más tarde.');
      setLoading(false);
    }
  }

  async function loadPlanningTips() {
    try {
      setPlanningLoading(true);
      setPlanningError(null);

      const existing = await getFinancialPlanningTips();
      if (!mounted.current) return;

      if (existing.length > 0) {
        setPlanningTips(existing);
        setPlanningLoading(false);

        generateAndWaitForFinancialPlanning()
          .then((fresh) => {
            if (mounted.current && fresh.length > 0) setPlanningTips(fresh);
          })
          .catch((err) =>
            console.error('Background planning refresh failed:', err)
          );
      } else {
        const data = await generateAndWaitForFinancialPlanning();
        if (!mounted.current) return;
        setPlanningTips(data);
        setPlanningLoading(false);
      }
    } catch (err) {
      console.error('Error cargando planificacion:', err);
      if (!mounted.current) return;
      setPlanningError('No se pudo cargar la planificación. Intenta de nuevo más tarde.');
      setPlanningLoading(false);
    }
  }


  const openModule = (slug: string) => {
    setSelectedModuleSlug(slug);
    setQuizResultPercent(null);
    setStep('detail');
  };

  const renderModule = ({ item }: { item: LearnModule }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => openModule(item.slug)}
    >
      {/* Fila 1: Dificultad, Tiempo, Flecha */}
      <View style={styles.row1}>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{item.level}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={14} color={APP_THEME.text.secondary} />
          <Text style={styles.timeText}>{item.estimatedTimeMinutes} min</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={APP_THEME.text.secondary} style={styles.arrow} />
      </View>

      {/* Fila 2: Título + Descripción */}
      <View style={styles.row2}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>

      {/* Fila 3: Temas + Preguntas */}
      <View style={styles.row3}>
        <View style={styles.topicsContainer}>
          <Ionicons name="book-outline" size={14} color={APP_THEME.text.secondary} />
          <Text style={styles.topicsText}>{item.topicsCount} temas</Text>
        </View>
        <View style={styles.questionsContainer}>
          <Ionicons name="bulb-outline" size={14} color="#3FD364" />
          <Text style={styles.questionsText}>{item.questionsCount} preguntas</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPlanningTip = ({ item }: { item: FinancialPlanningTip }) => (
    <PlanningCard tip={item} onPress={() => setSelectedPlanningTip(item)} />
  );

  // Step rendering: list | detail | quiz
  if (step === 'detail' && selectedModuleSlug) {
    return (
      <LearnDetailView
        moduleSlug={selectedModuleSlug}
        onBack={() => {
          setStep('list');
          setSelectedModuleSlug(null);
          setQuizResultPercent(null);
        }}
        onStartQuiz={() => setStep('quiz')}
        quizResultPercent={quizResultPercent}
      />
    );
  }

  if (step === 'quiz' && selectedModuleSlug) {
    return (
      <LearnQuizStep
        moduleSlug={selectedModuleSlug}
        onBack={() => setStep('detail')}
        onReturnToModules={() => {
          setStep('list');
          setSelectedModuleSlug(null);
          setQuizResultPercent(null);
        }}
        onQuizComplete={(percent: number) => {
          setQuizResultPercent(percent);
          setStep('detail');
        }}
      />
    );
  }

  const modalCategoryStyle = getPlanningCategoryStyle(selectedPlanningTip?.category ?? '');

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Aprender</Text>
      <Text style={styles.screenSubtitle}>Educacion financiera con quizzes interactivos</Text>
      <View style={styles.tabsWrapper}>
        <ModulePlanningTabs value={activeTab} onChange={setActiveTab} />
      </View>
      {activeTab === 'planning' ? (
        planningLoading ? (
          <PlanningSkeleton />
        ) : planningError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{planningError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadPlanningTips}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : planningTips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay planificación disponible por el momento.</Text>
          </View>
        ) : (
          <FlatList
            data={planningTips}
            keyExtractor={(item) => item.id}
            renderItem={renderPlanningTip}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : loading ? (
        <LearnModulesSkeleton />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadModules}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : modules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay módulos disponibles por el momento.</Text>
        </View>
      ) : (
        <FlatList
          data={modules}
          keyExtractor={(item) => item.id}
          renderItem={renderModule}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      <Modal visible={!!selectedPlanningTip} animationType="fade" transparent statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setSelectedPlanningTip(null)} 
          />
          <View style={styles.modalCard}>
            {selectedPlanningTip && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalBadgeWrapper}>
                      <View style={[styles.modalIconWrap, { backgroundColor: modalCategoryStyle.iconBg }]}>
                        <Ionicons
                          name={modalCategoryStyle.icon}
                          size={18}
                          color={modalCategoryStyle.badgeText}
                        />
                      </View>
                      <View
                        style={[styles.modalBadge, { backgroundColor: modalCategoryStyle.badgeBg }]}
                      >
                      <Text style={styles.modalBadgeText}>
                        {formatCategory(selectedPlanningTip.category)}
                      </Text>
                    </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedPlanningTip(null)}
                      style={styles.modalCloseButton}
                    >
                      <Ionicons name="close" size={18} color={APP_THEME.text.secondary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.modalTitle}>{selectedPlanningTip.title}</Text>
                  <Text style={styles.modalDescription}>{selectedPlanningTip.description}</Text>

                  <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="checkmark-circle" size={18} color="#2FE08F" />
                      <Text style={styles.sectionTitle}>Puntos clave</Text>
                    </View>
                    {selectedPlanningTip.keyPoints.map((point, index) => (
                      <View key={index} style={styles.listRow}>
                        <View style={styles.numberBadge}>
                          <Text style={styles.numberBadgeText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.listText}>{point}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="arrow-forward-circle" size={18} color="#2FE08F" />
                      <Text style={styles.sectionTitle}>Acciones a tomar</Text>
                    </View>
                    {selectedPlanningTip.actionItems.map((item, index) => (
                      <View key={index} style={styles.listRow}>
                        <Ionicons name="checkmark" size={16} color={APP_THEME.text.secondary} />
                        <Text style={styles.listText}>{item}</Text>
                      </View>
                    ))}
                  </View>

                  {selectedPlanningTip.resources.length > 0 && (
                    <View style={styles.sectionBlock}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="link" size={18} color={APP_THEME.text.secondary} />
                        <Text style={styles.sectionTitle}>Recursos</Text>
                      </View>
                      {selectedPlanningTip.resources.map((resource, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.resourceRow}
                          onPress={() => openResource(resource.url)}
                        >
                          <Text style={styles.resourceText}>{resource.title}</Text>
                          <Ionicons name="open-outline" size={16} color={APP_THEME.button.primary.background} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </ScrollView>
              )}
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => setSelectedPlanningTip(null)}
              >
                <Text style={styles.modalActionText}>Entendido</Text>
              </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const formatCategory = (value: string) => {
  if (!value) return 'General';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getPlanningCategoryStyle = (value: string) => {
  const key = value?.toLowerCase?.() ?? '';
  const map: Record<string, { badgeBg: string; badgeText: string; iconBg: string; icon: keyof typeof Ionicons.glyphMap }> = {
    emergencia: { badgeBg: '#2A1518', badgeText: '#FF5C6A', iconBg: '#13221B', icon: 'shield-checkmark-outline' },
    metas: { badgeBg: '#112720', badgeText: '#2FE08F', iconBg: '#142420', icon: 'locate-outline' },
    deudas: { badgeBg: '#2A1B12', badgeText: '#FF9B4A', iconBg: '#1E1713', icon: 'trending-down-outline' },
    presupuesto: { badgeBg: '#12212F', badgeText: '#54B3FF', iconBg: '#141B23', icon: 'wallet-outline' },
    retiro: { badgeBg: '#1D2030', badgeText: '#9EA8FF', iconBg: '#191C26', icon: 'leaf-outline' },
    inversion: { badgeBg: '#1E1B2A', badgeText: '#C58BFF', iconBg: '#1A1724', icon: 'pulse-outline' },
  };

  return map[key] ?? {
    badgeBg: '#1F2430',
    badgeText: '#9AA3B2',
    iconBg: '#151A22',
    icon: 'reader-outline',
  };
};

const openResource = async (url: string) => {
  try {
    await Linking.openURL(url);
  } catch (err) {
    console.warn('No se pudo abrir recurso:', err);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  screenTitle: {
    color: APP_THEME.text.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  screenSubtitle: {
    color: APP_THEME.text.secondary,
    fontSize: 13,
    marginBottom: 16,
  },
  tabsWrapper: {
    marginBottom: 18,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: APP_THEME.card.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 24,
    marginBottom: 16,
    aspectRatio: 2,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  // Row 1: Difficulty, Time, Arrow
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(71, 214, 118, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    color: '#47D676',
    fontSize: 12,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: APP_THEME.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  arrow: {
    marginLeft: 'auto',
  },

  // Row 2: Title + Description
  row2: {
    gap: 3,
  },
  cardTitle: {
    color: APP_THEME.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  cardDescription: {
    color: APP_THEME.text.secondary,
    fontSize: 12,
  },

  // Row 3: Topics + Questions
  row3: {
    flexDirection: 'row',
    gap: 12,
  },
  topicsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topicsText: {
    color: APP_THEME.text.secondary,
    fontSize: 12,
  },
  questionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  questionsText: {
    color: '#3FD364',
    fontSize: 12,
    fontWeight: '600',
  },

  errorContainer: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 14,
  },
  retryButton: {
    backgroundColor: APP_THEME.button.primary.background,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: APP_THEME.button.primary.text,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: APP_THEME.text.secondary,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 96,
  },
  modalCard: {
    backgroundColor: APP_THEME.background.primary,
    borderRadius: 28,
    width: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '78%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  modalBadgeText: {
    color: APP_THEME.text.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 6,
  },
  modalTitle: {
    color: APP_THEME.text.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalDescription: {
    color: APP_THEME.text.secondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  sectionBlock: {
    marginBottom: 18,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F2A1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBadgeText: {
    color: '#2FE08F',
    fontSize: 12,
    fontWeight: '700',
  },
  listText: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resourceText: {
    color: APP_THEME.text.primary,
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  modalActionButton: {
    backgroundColor: APP_THEME.button.primary.background,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalActionText: {
    color: APP_THEME.button.primary.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
