import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  BackHandler,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';
import {
  getLearnModuleDetail,
  submitQuizAttempt,
} from '@/services/api/learnModules';
import { LearnModuleDetailResponse } from '@/types/modulesTypes';

interface LearnQuizStepProps {
  moduleSlug?: string;
  onBack?: () => void;
  onQuizComplete?: (percent: number) => void;
  onReturnToModules?: () => void;
}

interface AnswerRecord {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean | null;
}

export default function LearnQuizStep({ moduleSlug, onBack, onQuizComplete, onReturnToModules }: LearnQuizStepProps) {
  const [moduleData, setModuleData] = useState<LearnModuleDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultPercent, setResultPercent] = useState<number | null>(null);

  useEffect(() => {
    if (!moduleSlug) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getLearnModuleDetail(moduleSlug);
        setModuleData(data);
      } catch (err) {
        console.error('Error cargando quiz:', err);
        setError('No se pudo cargar el quiz. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [moduleSlug]);

  const questions = moduleData?.module.quiz.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  const determineCorrectness = (question: any, optionIndex: number) => {
    if (question.correctOptionIndex != null) {
      return optionIndex === question.correctOptionIndex;
    }
    if (question.correctAnswer != null) {
      return question.options[optionIndex] === question.correctAnswer;
    }
    return null;
  };

  const getQuestionJustification = (question: any) => {
    return (
      question.justification || question.rationale || question.reason || 'No hay justificación disponible.'
    );
  };

  const getQuestionSource = (question: any) => {
    const source = question.source || question.reference || question.fuente;
    if (!source) return null;
    if (typeof source === 'string') return source;
    return source.title || source.name || source.label || null;
  };

  const getResultMessage = (percent: number) => {
    if (percent >= 100) return '¡Excelente! Dominaste todos los conceptos del módulo.';
    if (percent >= 90) return 'Muy bien hecho, estás muy cerca de dominar este tema.';
    if (percent >= 75) return 'Buen trabajo, tu comprensión es sólida. Solo unos detalles más.';
    if (percent >= 50) return 'Vas bien, revisa el contenido y vuelve a intentarlo para mejorar.';
    if (percent >= 25) return 'No está mal, vuelve a leer el módulo para reforzar los conceptos.';
    return 'Todavía hay espacio para mejorar. Revisa el módulo con calma y vuelve a intentarlo.';
  };

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
          { text: 'Salir', style: 'destructive', onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) },
      );
    });
  };

  const submitAttempt = useCallback(
    async (correctAnswers: number, totalQuestionsValue: number) => {
      const moduleId = moduleData?.module?.id;
      if (!moduleId) {
        console.warn('No se puede enviar intento de quiz: falta moduleId');
        return;
      }
      const score = totalQuestionsValue === 0 ? 0 : Math.round((correctAnswers / totalQuestionsValue) * 100);
      try {
        await submitQuizAttempt(moduleId, score, correctAnswers, totalQuestionsValue);
      } catch (err) {
        console.warn('Error enviando intento de quiz:', err);
      }
    },
    [moduleData],
  );

  const handleLeaveQuiz = useCallback(async () => {
    const confirmed = await showConfirmDialog(
      'Salir del quiz',
      '¿Estás seguro de que quieres salir en mitad del quiz? Ten en cuenta que si sales del quiz entonces tu progreso no se guardará y contará como un intento fallido.',
    );
    if (!confirmed) return;

    const answeredAnswers = selectedIndex != null && currentQuestion
      ? [
          ...answers,
          {
            questionId: currentQuestion.id,
            selectedIndex,
            isCorrect: determineCorrectness(currentQuestion, selectedIndex),
          },
        ]
      : answers;

    const correctCount = answeredAnswers.filter((item) => item.isCorrect === true).length;
    await submitAttempt(correctCount, totalQuestions);
    onBack && onBack();
  }, [answers, currentQuestion, onBack, selectedIndex, submitAttempt, totalQuestions]);

  const finishQuiz = async (nextAnswers: AnswerRecord[]) => {
    const correctCount = nextAnswers.filter((item) => item.isCorrect === true).length;
    const percent = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
    await submitAttempt(correctCount, totalQuestions);
    setResultPercent(percent);
    setShowResult(true);
    onQuizComplete && onQuizComplete(percent);
  };

  const confirmAnswer = () => {
    if (selectedIndex == null || !currentQuestion) return;
    const isCorrect = determineCorrectness(currentQuestion as any, selectedIndex);
    setAnswers((prev) => {
      const next = prev.slice(0, currentQuestionIndex);
      next.push({
        questionId: currentQuestion.id,
        selectedIndex,
        isCorrect,
      });
      return next;
    });
    setFeedbackVisible(true);
  };

  const handleAnswer = async () => {
    if (!feedbackVisible) {
      confirmAnswer();
      return;
    }

    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    if (isLastQuestion) {
      await finishQuiz(answers);
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedIndex(null);
    setFeedbackVisible(false);
  };

  useEffect(() => {
    const onHardwareBackPress = () => {
      handleLeaveQuiz();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => subscription.remove();
  }, [handleLeaveQuiz]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={APP_THEME.button.primary.background} />
        <Text style={styles.loaderText}>Cargando quiz...</Text>
      </View>
    );
  }

  if (error || !moduleData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Quiz no disponible.'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleLeaveQuiz}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const module = moduleData.module;
  const correctCount = answers.filter((item) => item.isCorrect === true).length;
  const percentScore = resultPercent ?? 0;
  const passingScore = module.quiz.passingScore ?? 0;
  const isPassed = percentScore >= passingScore;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const progressPercent = totalQuestions === 0 ? 0 : Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
  const currentAnswer = answers[currentQuestionIndex];
  const buttonText = !feedbackVisible ? 'Confirmar respuesta' : isLastQuestion ? 'Ver resultados' : 'Siguiente respuesta';
  const questionSource = getQuestionSource(currentQuestion as any);
  const questionJustification = getQuestionJustification(currentQuestion as any);
  const questionExplanation = currentQuestion?.explanation || 'No hay explicación disponible.';

  const renderResult = () => (
    <View style={styles.resultContainer}>
      <View style={styles.resultBanner}>
        <Ionicons name="trophy" size={28} color="#000" />
        <Text style={styles.resultBannerTitle}>Módulo completado!</Text>
        <Text style={styles.resultBannerSubtitle}>{module.title}</Text>
      </View>

      <View style={styles.resultFeedbackSection}>
        <Text style={[styles.resultScore, percentScore < 75 ? styles.incorrect : styles.correct]}>{percentScore}%</Text>
        <Text style={styles.resultScoreDetail}>{correctCount} de {totalQuestions} respuestas correctas</Text>
        <Text style={styles.resultMessage}>{getResultMessage(percentScore)}</Text>
      </View>

      <View style={styles.resultAnswersList}>
        {questions.map((question, index) => {
          const answer = answers[index];
          const answeredCorrectly = answer?.isCorrect === true;
          return (
            <View key={question.id} style={styles.resultAnswerRow}>
              <View style={[styles.resultAnswerIcon, answeredCorrectly ? styles.correctIcon : styles.incorrectIcon]}>
                <Ionicons name={answeredCorrectly ? 'checkmark' : 'close'} size={16} color="#fff" />
              </View>
              <Text style={styles.resultAnswerTextRow}>{index + 1}. {question.question}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.resultActions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => onBack && onBack()}>
          <Text style={styles.secondaryButtonText}>Volver a leer el módulo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => onReturnToModules ? onReturnToModules() : onBack && onBack()}
        >
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleLeaveQuiz}>
          <Ionicons name="chevron-back" size={20} color={APP_THEME.text.primary} />
          <Text style={styles.backButtonText}>Volver al módulo</Text>
        </TouchableOpacity>

        <View style={styles.headerColumn}>
          <View style={styles.headerRow}>
            <Text style={styles.questionCounter}>Pregunta {currentQuestionIndex + 1} de {totalQuestions}</Text>
            <View style={styles.difficultyBadgeSmall}>
              <Text style={styles.difficultyTextSmall}>{module.level}</Text>
            </View>
          </View>

          <View style={styles.quizProgressBarWrapper}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressTrackFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          <Text style={styles.quizHeaderSubtitle}>Quiz: {module.title}</Text>
        </View>
      </View>

      {showResult ? (
        renderResult()
      ) : (
        <View style={styles.quizBody}>
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            {currentQuestion.options.map((option, idx) => {
              const selected = selectedIndex === idx;
              const isCorrect = determineCorrectness(currentQuestion as any, idx) === true;
              const isWrongSelected = feedbackVisible && currentAnswer?.selectedIndex === idx && currentAnswer?.isCorrect === false;
              const showIcon = feedbackVisible && (isCorrect || isWrongSelected);

              return (
                <TouchableOpacity
                  key={`${currentQuestion.id}-${idx}`}
                  style={[
                    styles.optionButton,
                    selected && !feedbackVisible && styles.optionSelected,
                    feedbackVisible && isCorrect && styles.optionCorrect,
                    feedbackVisible && isWrongSelected && styles.optionWrong,
                  ]}
                  onPress={() => !feedbackVisible && setSelectedIndex(idx)}
                  activeOpacity={0.8}
                  disabled={feedbackVisible}
                >
                  <View style={styles.optionLabelRow}>
                    <View style={[
                      styles.optionLabel,
                      showIcon ? styles.optionIconLabel : styles.optionLetterLabel,
                      selected && !feedbackVisible && styles.optionLabelSelected,
                      feedbackVisible && isCorrect && styles.optionLabelCorrect,
                      feedbackVisible && isWrongSelected && styles.optionLabelWrong,
                    ]}>
                      {showIcon ? (
                        <Ionicons
                          name={isCorrect ? 'checkmark' : 'close'}
                          size={16}
                          color="#fff"
                        />
                      ) : (
                        <Text style={styles.optionLetter}>{String.fromCharCode(65 + idx)}</Text>
                      )}
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {feedbackVisible && (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackTitle}>Explicación</Text>
              <Text style={styles.feedbackText}>{questionExplanation}</Text>
              <Text style={styles.feedbackTitle}>Justificación</Text>
              <Text style={styles.feedbackText}>{questionJustification}</Text>
              {questionSource ? (
                <View style={styles.feedbackSourceRow}>
                  <Ionicons name="link-outline" size={16} color={APP_THEME.text.secondary} />
                  <Text style={styles.feedbackSourceText}>Fuente: {questionSource}</Text>
                </View>
              ) : null}
            </View>
          )}

          <TouchableOpacity
            style={[styles.nextButton, selectedIndex == null && styles.disabledButton]}
            onPress={handleAnswer}
            disabled={selectedIndex == null}
          >
            <Text style={styles.nextButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: APP_THEME.background.primary,
    flexGrow: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    color: APP_THEME.text.primary,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
  },
  headerSubtitle: {
    color: APP_THEME.text.secondary,
    fontSize: 16,
    marginTop: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerColumn: {
    marginTop: 16,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  questionCounter: {
    color: APP_THEME.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  difficultyBadgeSmall: {
    backgroundColor: 'rgba(71, 214, 118, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyTextSmall: {
    color: '#47D676',
    fontSize: 12,
    fontWeight: '600',
  },
  quizProgressBarWrapper: {
    marginTop: 8,
    marginBottom: 4,
  },
  quizHeaderSubtitle: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
  },
  feedbackCard: {
    backgroundColor: APP_THEME.card.background,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginTop: 12,
  },
  feedbackTitle: {
    color: APP_THEME.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  feedbackText: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  feedbackSourceText: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
  },
  resultBanner: {
    backgroundColor: 'lab(59 -51.76 31.73)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  resultBannerTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: '700',
  },
  resultBannerSubtitle: {
    color: '#000',
    fontSize: 14,
  },
  resultFeedbackSection: {
    backgroundColor: APP_THEME.card.background,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    marginTop: 16,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: '800',
  },
  resultScoreSuccess: {
    color: 'lab(59 -51.76 31.73)',
  },
  resultScoreDetail: {
    color: APP_THEME.text.secondary,
    fontSize: 16,
  },
  resultMessage: {
    color: APP_THEME.text.secondary,
    fontSize: 15,
  },
  resultAnswersList: {
    gap: 12,
    marginTop: 20,
  },
  resultAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: APP_THEME.background.primary,
    borderWidth: 1,
    borderColor: APP_THEME.input.border,
  },
  resultAnswerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctIcon: {
    backgroundColor: 'lab(59 -51.76 31.73)',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: APP_THEME.input.border,
    overflow: 'hidden',
  },
  progressTrackFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: APP_THEME.button.primary.background,
  },
  incorrectIcon: {
    backgroundColor: 'lab(54 69.81 43.62)',
  },
  resultAnswerTextRow: {
    color: APP_THEME.text.primary,
    fontSize: 14,
    flex: 1,
  },
  resultActions: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: APP_THEME.button.primary.background,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: APP_THEME.button.primary.text,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: APP_THEME.input.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_THEME.background.primary,
    padding: 16,
  },
  loaderText: {
    marginTop: 12,
    color: APP_THEME.text.primary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: APP_THEME.background.primary,
  },
  errorText: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  quizBody: {
    gap: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressText: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
  },
  questionCard: {
    backgroundColor: APP_THEME.card.background,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  questionText: {
    color: APP_THEME.text.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_THEME.input.border,
    marginBottom: 10,
    backgroundColor: APP_THEME.background.primary,
  },
  optionSelected: {
    borderColor: 'lab(59 -51.76 31.73)',
    backgroundColor: 'lab(59 -51.76 31.73)',
  },
  optionCorrect: {
    borderColor: 'lab(59 -51.76 31.73)',
    backgroundColor: 'lab(59 -51.76 31.73)',
  },
  optionWrong: {
    borderColor: 'lab(54 69.81 43.62)',
    backgroundColor: 'lab(54 69.81 43.62)',
  },
  optionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'lab(13 -0.83 -5.51)',
    backgroundColor: 'lab(13 -0.83 -5.51)',
  },
  optionLetterLabel: {
    paddingHorizontal: 0,
  },
  optionIconLabel: {
    width: 34,
    height: 34,
  },
  optionLabelSelected: {
    borderColor: 'lab(59 -51.76 31.73)',
    backgroundColor: 'lab(59 -51.76 31.73)',
  },
  optionLabelCorrect: {
    borderColor: 'lab(59 -51.76 31.73)',
    backgroundColor: 'lab(59 -51.76 31.73)',
  },
  optionLabelWrong: {
    borderColor: 'lab(54 69.81 43.62)',
    backgroundColor: 'lab(54 69.81 43.62)',
  },
  optionLetter: {
    color: APP_THEME.text.primary,
    fontWeight: '700',
  },
  optionText: {
    color: APP_THEME.text.primary,
    fontSize: 16,
  },
  optionTextSelected: {
    color: APP_THEME.text.primary,
    fontWeight: '700',
  },
  nextButton: {
    backgroundColor: APP_THEME.button.primary.background,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: APP_THEME.button.primary.text,
    fontSize: 16,
    fontWeight: '700',
  },
  resultContainer: {
    backgroundColor: APP_THEME.card.background,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  resultTitle: {
    color: APP_THEME.text.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  resultSubtitle: {
    color: APP_THEME.text.secondary,
    fontSize: 16,
  },
  resultStats: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: APP_THEME.input.border,
    paddingTop: 16,
  },
  resultStatText: {
    color: APP_THEME.text.primary,
    fontSize: 16,
  },
  resultList: {
    gap: 12,
    marginTop: 16,
  },
  resultQuestionItem: {
    backgroundColor: APP_THEME.background.primary,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: APP_THEME.input.border,
  },
  resultQuestionText: {
    color: APP_THEME.text.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  resultAnswerText: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
    marginBottom: 4,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  correct: {
    color: '#3FD364',
  },
  incorrect: {
    color: '#FF453A',
  },
  finishButton: {
    backgroundColor: APP_THEME.button.primary.background,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  finishButtonText: {
    color: APP_THEME.button.primary.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
