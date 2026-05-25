import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  BackHandler,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { APP_THEME } from '@/constants/themes';
import {
  getLearnModuleDetail,
  startModuleProgress,
  completeModuleSection,
} from '@/services/api/learnModules';
import { LearnModuleDetailResponse } from '@/types/modulesTypes';

export interface LearnDetailViewProps {
  moduleSlug: string;
  onBack?: () => void;
  onStartQuiz?: () => void;
  quizResultPercent?: number | null;
}

export function LearnDetailView({ moduleSlug, onBack, onStartQuiz, quizResultPercent }: LearnDetailViewProps) {
  const [moduleData, setModuleData] = useState<LearnModuleDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockPositions, setBlockPositions] = useState<number[]>([]);
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [completedSectionIds, setCompletedSectionIds] = useState<string[]>([]);
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const progressStartedRef = useRef(false);

  const introductionExists = Boolean(moduleData?.module.content?.introduction);
  const sectionCount = moduleData?.module.content?.sections?.length ?? 0;
  const tipsExist = Boolean(moduleData?.module.content?.practicalTips?.length);
  const totalReadBlocks = (introductionExists ? 1 : 0) + sectionCount + (tipsExist ? 1 : 0);

  const blockIds = useMemo(() => {
    if (!moduleData) return [];
    const ids: string[] = [];
    if (moduleData.module.content.introduction) {
      ids.push('introduction');
    }
    if (moduleData.module.content.sections) {
      ids.push(...moduleData.module.content.sections.map((section) => section.id));
    }
    if (moduleData.module.content.practicalTips?.length) {
      ids.push('practicalTips');
    }
    return ids;
  }, [moduleData]);

  const sectionIds = useMemo(() => {
    if (!moduleData) return [];
    return moduleData.module.content.sections?.map((section) => section.id) ?? [];
  }, [moduleData]);

  useEffect(() => {
    if (!moduleData) return;
    setBlockPositions(Array(totalReadBlocks).fill(0));
    if (!progressStartedRef.current) {
      setActiveBlockIndex(0);
    }
  }, [moduleData, totalReadBlocks]);

  const updateBlockPosition = (index: number, y: number) => {
    setBlockPositions((prev) => {
      const next = [...prev];
      next[index] = y;
      return next;
    });
  };

  const saveCompletedSection = useCallback(
    async (sectionId: string) => {
      const moduleId = moduleData?.module?.id;
      if (!moduleId || !sectionIds.includes(sectionId)) return;

      // If server already reports this section as completed, skip.
      const serverCompleted = moduleData?.progress?.completedSections ?? [];
      if (serverCompleted.includes(sectionId) || completedSectionIds.includes(sectionId)) return;

      // Optimistically mark as completed to avoid duplicate PATCH calls.
      setCompletedSectionIds((prev) => (prev.includes(sectionId) ? prev : [...prev, sectionId]));
      try {
        await completeModuleSection(moduleId, sectionId);
      } catch (err) {
        // Revert optimistic update on failure
        setCompletedSectionIds((prev) => prev.filter((id) => id !== sectionId));
        console.warn('No se pudo guardar sección completada:', sectionId, err);
      }
    },
    [completedSectionIds, moduleData, sectionIds],
  );

  const startProgressIfNeeded = useCallback(async () => {
    const moduleId = moduleData?.module?.id;
    if (!moduleId) return;
    // Prevent multiple starts in the same view lifecycle
    if (progressStartedRef.current) return;

    progressStartedRef.current = true;

    try {
      const progress = await startModuleProgress(moduleId);

      // Merge server progress with existing progress to avoid overwriting
      // previously returned completed sections or a higher percentage.
      const existingProgress = moduleData?.progress;
      const existingCompleted = existingProgress?.completedSections ?? [];
      const serverCompleted = progress?.completedSections ?? [];

      const mergedCompleted = serverCompleted.length > 0 ? serverCompleted : existingCompleted;

      const mergedProgressPercentage = Math.max(
        progress?.progressPercentage ?? 0,
        existingProgress?.progressPercentage ?? 0,
      );

      const mergedProgress = {
        ...(existingProgress || {}),
        ...(progress || {}),
        completedSections: mergedCompleted,
        progressPercentage: mergedProgressPercentage,
      };

      setModuleData((prev) => (prev ? { ...prev, progress: mergedProgress } : prev));
      setCompletedSectionIds(mergedCompleted);

      // If there are completed sections, try to set the active block index
      // to the last completed section so the UI reflects saved progress.
      if (mergedProgress.status === 'completed') {
        setActiveBlockIndex(Math.max(totalReadBlocks - 1, 0));
      } else if (mergedCompleted.length > 0) {
        const furthestIdx = mergedCompleted.reduce((maxIdx, sectionId) => {
          const idx = blockIds.indexOf(sectionId);
          return idx > maxIdx ? idx : maxIdx;
        }, -1);
        if (furthestIdx >= 0) {
          setActiveBlockIndex(Math.min(furthestIdx, Math.max(totalReadBlocks - 1, 0)));
        }
      }
    } catch (err) {
      console.warn('No se pudo iniciar progreso del módulo:', err);
    }
  }, [moduleData, blockIds, totalReadBlocks]);

  const syncCurrentProgress = useCallback(async () => {
    if (!moduleData || blockIds.length === 0) return;
    const sectionIdsToSave = blockIds
      .slice(0, activeBlockIndex + 1)
      .filter((id) => sectionIds.includes(id) && !completedSectionIds.includes(id));
    await Promise.all(sectionIdsToSave.map((id) => saveCompletedSection(id)));
    console.debug('[learn-detail] syncCurrentProgress finished');
  }, [activeBlockIndex, blockIds, completedSectionIds, moduleData, saveCompletedSection, sectionIds]);

  const handleBack = useCallback(async () => {
    await syncCurrentProgress();
    if (onBack) {
      onBack();
    }
  }, [onBack, syncCurrentProgress]);

useEffect(() => {
  progressStartedRef.current = false;
}, [moduleSlug]);

useEffect(() => {
  if (!moduleData) return;
  // Solo sincronizar completedSectionIds si aún no se ha iniciado el progreso
  // (antes de que startProgressIfNeeded lo haga con datos del servidor)
  if (!progressStartedRef.current) {
    setCompletedSectionIds(moduleData.progress.completedSections ?? []);
  }
}, [moduleData?.module?.id]); // ← dependencia estable, no el objeto entero

useEffect(() => {
  if (!moduleData) return;
  if (progressStartedRef.current) return;

  startProgressIfNeeded();
}, [moduleData?.module?.id]); // ← misma dependencia estable

  useEffect(() => {
    if (!moduleData || !blockIds.length) return;
    const sectionId = blockIds[activeBlockIndex];
    if (!sectionId || completedSectionIds.includes(sectionId) || !sectionIds.includes(sectionId)) return;
    saveCompletedSection(sectionId);
  }, [activeBlockIndex, blockIds, completedSectionIds, moduleData, saveCompletedSection, sectionIds]);

  useEffect(() => {
    const onHardwareBackPress = () => {
      handleBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => subscription.remove();
  }, [handleBack]);

  // Ensure we sync progress when the component unmounts (e.g. user switches tabs)
  useEffect(() => {
    return () => {
      // fire-and-forget: sync progress on unmount
      console.debug('[learn-detail] unmount -> syncing progress');
      void syncCurrentProgress();
    };
  }, [syncCurrentProgress]);

  const showConfirmDialog = async (title: string, message: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      return window.confirm(message);
    }

    return new Promise<boolean>((resolve) => {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Sí, comenzar', onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) },
      );
    });
  };

  const handleConfirmStartQuiz = async () => {
    if (!onStartQuiz) return;
    const confirmed = await showConfirmDialog(
      'Comenzar quiz',
      '¿Estás seguro de que quieres empezar el quiz? Si sales antes se guardara el quiz con tus respuestas hasta ese punto y las demas se relleneran como incorrectas.',
    );

    if (!confirmed) return;
    setIsStartingQuiz(true);
    await syncCurrentProgress();
    setIsStartingQuiz(false);
    onStartQuiz();
  };

  const completedServerSectionProgress = useMemo(() => {
    if (!moduleData) return 0;
    const totalSections = moduleData.module.content.sections?.length ?? 0;
    const completedSectionsCount = moduleData.progress.completedSections?.length ?? 0;
    if (totalSections === 0 || completedSectionsCount === 0) return 0;
    return Math.round((completedSectionsCount / totalSections) * 90);
  }, [moduleData]);

  const computeBaseReadProgress = () => {
    if (totalReadBlocks === 0) return 0;
    return Math.round(90 * Math.min(activeBlockIndex + 1, totalReadBlocks) / totalReadBlocks);
  };
  const moduleStatus = moduleData?.progress?.status;

  const displayedProgress = Math.min(
    100,
    moduleStatus === 'completed'
      ? 100
      : quizResultPercent != null
        ? 90 + Math.round((quizResultPercent / 100) * 10)
        : Math.max(completedServerSectionProgress, computeBaseReadProgress()),
  );

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const HEADER_HEIGHT = 116;
    let candidateIndex = 0;

    for (let i = 0; i < blockPositions.length; i += 1) {
      if (blockPositions[i] <= y + HEADER_HEIGHT) {
        candidateIndex = i;
      } else {
        break;
      }
    }

    const nextActiveIndex = Math.min(candidateIndex, Math.max(totalReadBlocks - 1, 0));
    if (nextActiveIndex > activeBlockIndex) {
      setActiveBlockIndex(nextActiveIndex);
    }
  };

  useEffect(() => {
    if (moduleSlug) {
      loadModuleDetail();
    }
  }, [moduleSlug]);

  async function loadModuleDetail() {
    try {
      setLoading(true);
      setError(null);
      const data = await getLearnModuleDetail(moduleSlug);
      setModuleData(data);
    } catch (err) {
      console.error('Error cargando detalle del módulo:', err);
      setError('No se pudo cargar el módulo. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_THEME.button.primary.background} />
        <Text style={styles.loadingText}>Cargando módulo...</Text>
      </View>
    );
  }

  if (error || !moduleData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Error desconocido'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { module, progress } = moduleData;
  const sortedQuizAttempts = [...progress.quizAttempts]
    .sort((a, b) => {
      const scoreA = a.correctAnswers / a.totalQuestions;
      const scoreB = b.correctAnswers / b.totalQuestions;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  return (
    <View style={styles.screenContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerWrapper}>
          <View style={styles.headerRowOne}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.6}
            >
              <Ionicons name="chevron-back" size={20} color={APP_THEME.text.primary} />
              <Text style={styles.backButtonText}>Volver a módulos</Text>
            </TouchableOpacity>
            <View style={styles.progressBadge}>
              <Ionicons name="trending-up" size={16} color={APP_THEME.text.primary} />
              <Text style={styles.progressPercentage}>{displayedProgress}%</Text>
            </View>
          </View>

          <View style={styles.progressBarWrapper}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressTrackFill, { width: `${displayedProgress}%` }]} />
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Fila 2: Dificultad */}
      <View style={styles.difficultyContainer}>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{module.level}</Text>
        </View>
      </View>

      {/* Fila 3: Título */}
      <Text style={styles.moduleTitle}>{module.title}</Text>

      {/* Fila 4: Tiempo + Temas */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={18} color={APP_THEME.text.secondary} />
          <Text style={styles.metaText}>{module.estimatedTimeMinutes} min</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="book-outline" size={18} color={APP_THEME.text.secondary} />
          <Text style={styles.metaText}>{module.topicsCount} temas</Text>
        </View>
      </View>

      {/* Fila 5: Contenidos */}
      {module.content && (
        <View style={styles.contentSection}>
          <View style={styles.contentContainer}>
            {module.content.introduction && (
              <View
                style={styles.contentItem}
                onLayout={(event) => updateBlockPosition(0, event.nativeEvent.layout.y)}
              >
                <Text style={styles.contentTitle}>Introducción</Text>
                <Text style={styles.contentText}>{module.content.introduction}</Text>
              </View>
            )}
            {module.content.sections && module.content.sections.map((section, idx) => (
              <View
                key={idx}
                style={styles.contentItem}
                onLayout={(event) => updateBlockPosition(
                  (module.content.introduction ? 1 : 0) + idx,
                  event.nativeEvent.layout.y,
                )}
              >
                <Text style={styles.contentTitle}>{section.title}</Text>
                <Text style={styles.contentText}>{section.content}</Text>
              </View>
            ))}
            {module.content.practicalTips && module.content.practicalTips.length > 0 && (
              <View
                style={styles.contentItem}
                onLayout={(event) => updateBlockPosition(
                  (module.content.introduction ? 1 : 0) + (module.content.sections?.length ?? 0),
                  event.nativeEvent.layout.y,
                )}
              >
                <Text style={styles.contentTitle}>Consejos prácticos</Text>
                {module.content.practicalTips.map((tip, idx) => (
                  <Text key={idx} style={styles.contentText}>• {tip}</Text>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Fila 6: Temas Cubiertos */}
      {module.topics && module.topics.length > 0 && (
        <View style={styles.topicsSection}>
          <Text style={styles.sectionTitle}>Temas cubiertos</Text>
          <View style={styles.topicsContainer}>
            {module.topics.map((topic) => (
              <View key={topic.id} style={styles.topicBadge}>
                <Ionicons name="checkmark-circle" size={16} color={APP_THEME.button.primary.background} />
                <Text style={styles.topicText}>{topic.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Fila 7: Historial de Intentos */}
      {sortedQuizAttempts.length > 0 && (
        <View style={styles.attemptsSection}>
          <View style={styles.attemptsHeader}>
            <Ionicons name="trophy" size={18} color="#FFB81C" />
            <Text style={styles.sectionTitle}>Historial de intentos</Text>
          </View>
          {sortedQuizAttempts.map((attempt, idx) => {
            const percentage = Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100);
            const isComplete = percentage === 100;
            return (
              <View key={idx} style={styles.attemptItem}>
                <View style={styles.attemptHeader}>
                  <Text style={styles.attemptNumber}>
                    #{idx + 1} {attempt.correctAnswers}/{attempt.totalQuestions} correctas ({percentage}%)
                  </Text>
                  <Text style={styles.attemptDate}>{formatDate(attempt.completedAt)}</Text>
                </View>
                <View style={[styles.progressBar, isComplete && styles.progressBarComplete]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percentage}%` },
                      isComplete ? styles.progressFillComplete : styles.progressFillIncomplete,
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Fila 8: Quiz */}
      <View style={styles.quizSection}>
        <View style={styles.quizHeader}>
          <View style={styles.quizIconBg}>
            <Ionicons name="bulb" size={20} color="#3FD364" />
          </View>
          <View style={styles.quizInfo}>
            <Text style={styles.quizTitle}>Pon a prueba tus conocimientos</Text>
            <Text style={styles.quizSubtitle}>{module.quiz.questionsCount} preguntas sobre {module.title}</Text>
          </View>
        </View>
        <TouchableOpacity
        style={[styles.quizButton, isStartingQuiz && styles.disabledQuizButton]}
        activeOpacity={0.8}
        onPress={handleConfirmStartQuiz}
        disabled={isStartingQuiz}
      >
        <Text style={styles.quizButtonText}>Comenzar Quiz</Text>
        <Ionicons name="arrow-forward" size={16} color={APP_THEME.button.primary.text} />
      </TouchableOpacity>
      </View>
    </ScrollView>
  </View>
  );
}

  export default function LearnDetailScreen() {
    const router = useRouter();
    const { moduleSlug } = useLocalSearchParams<{ moduleSlug: string }>();
    return <LearnDetailView moduleSlug={moduleSlug ?? ''} onBack={() => router.back()} />;
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },

  // Fila 1: Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  backButtonText: {
    color: APP_THEME.text.primary,
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
  },

  // Fila 2: Difficulty
  difficultyContainer: {
    marginBottom: 12,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(71, 214, 118, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  difficultyText: {
    color: '#47D676',
    fontSize: 16,
    fontWeight: '600',
  },

  // Fila 3: Title
  moduleTitle: {
    color: APP_THEME.text.primary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },

  // Fila 4: Meta Info
  metaRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: APP_THEME.text.secondary,
    fontSize: 16,
  },

  // Fila 5: Content
  contentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: APP_THEME.text.primary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  contentContainer: {
    backgroundColor: "#10141b",
    borderColor: "#252c38",
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    paddingVertical: 36,
  },
  contentItem: {
    marginBottom: 16,
  },
  contentTitle: {
    color: APP_THEME.text.primary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  contentText: {
    color: APP_THEME.text.secondary,
    fontSize: 18,
    lineHeight: 24,
  },

  // Fila 6: Topics
  topicsSection: {
    marginBottom: 24,
    backgroundColor: "#10141b",
    borderColor: "#252c38",
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: "#252c38",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  topicText: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  // Fila 7: Attempts
  attemptsSection: {
    marginBottom: 24,
    backgroundColor: "#10141b",
    borderColor: "#252c38",
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
  },
  attemptsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  attemptItem: {
    marginBottom: 12,
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  attemptNumber: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  attemptDate: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1A1A1B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarComplete: {
    backgroundColor: 'rgba(63, 211, 100, 0.2)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressFillIncomplete: {
    backgroundColor: '#FF453A',
  },
  progressFillComplete: {
    backgroundColor: '#3FD364',
  },

  // Fila 8: Quiz
  quizSection: {
    backgroundColor: "#10141b",
    borderColor: "#252c38",
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    marginBottom: 12,
    gap: 16,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  quizIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(71, 214, 118, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  quizSubtitle: {
    color: APP_THEME.text.secondary,
    fontSize: 16,
  },
  quizButton: {
    backgroundColor: APP_THEME.button.primary.background,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledQuizButton: {
    opacity: 0.5,
  },
  quizButtonText: {
    color: APP_THEME.button.primary.text,
    fontSize: 18,
    fontWeight: '600',
  },

  screenContainer: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
  },
  safeArea: {
    backgroundColor: APP_THEME.background.primary,
  },
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: APP_THEME.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: APP_THEME.input.border,
    zIndex: 10,
  },
  headerRowOne: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: APP_THEME.card.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  progressPercentage: {
    color: APP_THEME.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  progressBarWrapper: {
    marginTop: 16,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#1A1A1B',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressTrackFill: {
    height: '100%',
    backgroundColor: '#3FD364',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: APP_THEME.text.primary,
    fontSize: 18,
    marginTop: 12,
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
    fontSize: 18,
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
});
