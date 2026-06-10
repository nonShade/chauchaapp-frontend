import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { APP_THEME } from "@/constants/themes";
import { LearnModuleQuestion } from "@/types/modulesTypes";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AnswerRecord {
  questionId:    string;
  selectedIndex: number;
  isCorrect:     boolean | null;
}

interface Props {
  moduleTitle:   string;
  questions:     LearnModuleQuestion[];
  answers:       AnswerRecord[];
  passingScore:  number;
  onReviewModule: () => void;
  onContinue:    () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getResultMessage(percent: number, passed: boolean): string {
  if (!passed) {
    if (percent >= 40) return "¡Casi lo logras! Repasa el módulo y vuelve a intentarlo.";
    return "Sigue practicando, repasa el contenido con calma y vuelve cuando estés listo.";
  }
  if (percent >= 100) return "¡Perfecto! Dominaste todos los conceptos del módulo.";
  if (percent >= 90)  return "¡Excelente trabajo! Tienes un dominio muy sólido del tema.";
  if (percent >= 75)  return "¡Buen trabajo! Superaste el módulo con una comprensión sólida.";
  return "¡Lo lograste! Sigue repasando para afianzar los conceptos.";
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function QuizResultScreen({
  moduleTitle,
  questions,
  answers,
  passingScore,
  onReviewModule,
  onContinue,
}: Props) {
  const correctCount   = answers.filter((a) => a.isCorrect === true).length;
  const totalQuestions = questions.length;
  const percent        = totalQuestions === 0
    ? 0
    : Math.round((correctCount / totalQuestions) * 100);
  const passed         = percent >= passingScore;

  const scoreColor  = passed
    ? (APP_THEME.status?.success ?? "#3FD364") as string
    : (APP_THEME.status?.error   ?? "#FF453A") as string;

  const background      = APP_THEME.background.primary  as string;
  const cardBg          = APP_THEME.card.background     as string;
  const cardBorder      = APP_THEME.card.border         as string;
  const textPrimary     = APP_THEME.text.primary        as string;
  const textSecondary   = APP_THEME.text.secondary      as string;
  const primaryColor    = APP_THEME.button.primary.background as string;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Tarjeta principal ── */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>

        {/* Banner verde superior */}
        <View style={styles.banner}>
          <Ionicons name="trophy" size={40} color="#000" />
          <Text style={styles.bannerTitle}>¡Módulo Completado!</Text>
          <Text style={styles.bannerSubtitle}>{moduleTitle}</Text>
        </View>

        {/* Puntuación */}
        <View style={styles.scoreSection}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>
            {percent}%
          </Text>
          <Text style={[styles.scoreDetail, { color: textSecondary }]}>
            {correctCount} de {totalQuestions} respuestas correctas
          </Text>
          <Text style={[styles.scoreMessage, { color: textSecondary }]}>
            {getResultMessage(percent, passed)}
          </Text>
        </View>
      </View>

      {/* ── Tarjeta resumen de respuestas ── */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[styles.summaryTitle, { color: textPrimary }]}>
          Resumen de respuestas
        </Text>

        <View style={styles.answerList}>
          {questions.map((question, index) => {
            const answer         = answers[index];
            const answeredCorrectly = answer?.isCorrect === true;

            return (
              <View
                key={question.id}
                style={[
                  styles.answerRow,
                  { backgroundColor: background, borderColor: cardBorder },
                ]}
              >
                {/* Ícono correcto / incorrecto */}
                <View
                  style={[
                    styles.answerIcon,
                    { backgroundColor: answeredCorrectly ? "#3FD364" : "#FF453A" },
                  ]}
                >
                  <Ionicons
                    name={answeredCorrectly ? "checkmark" : "close"}
                    size={14}
                    color="#000"
                  />
                </View>

                {/* Texto de la pregunta (1 línea) */}
                <Text
                  style={[styles.answerText, { color: textPrimary }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {index + 1}. {question.question}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Botones ── */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.reviewButton, { borderColor: cardBorder }]}
          onPress={onReviewModule}
        >
          <Ionicons name="book-outline" size={18} color={textPrimary} />
          <Text style={[styles.reviewButtonText, { color: textPrimary }]}>
            Revisar módulo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: primaryColor }]}
          onPress={onContinue}
        >
          <Text style={[styles.continueButtonText, { color: APP_THEME.button.primary.text as string }]}>
            Continuar
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding:       16,
    paddingBottom: 40,
  },

  // Tarjetas
  card: {
    borderRadius: 16,
    borderWidth:  1,
    overflow:     "hidden",
    marginBottom: 16,
  },

  // Banner verde
  banner: {
    backgroundColor: "#20A353",
    paddingVertical:  28,
    paddingHorizontal: 20,
    alignItems:       "center",
    gap:              8,
  },
  bannerTitle: {
    color:      "#000",
    fontSize:   22,
    fontWeight: "800",
  },
  bannerSubtitle: {
    color:      "#000",
    fontSize:   15,
    fontWeight: "500",
    opacity:    0.75,
    textAlign:  "center",
  },

  // Puntuación
  scoreSection: {
    paddingVertical:   24,
    paddingHorizontal: 20,
    alignItems:        "center",
    gap:               8,
  },
  scoreText: {
    fontSize:   56,
    fontWeight: "800",
    lineHeight: 64,
  },
  scoreDetail: {
    fontSize: 15,
  },
  scoreMessage: {
    fontSize:   14,
    textAlign:  "center",
    marginTop:  4,
    paddingHorizontal: 8,
  },

  // Resumen de respuestas
  summaryTitle: {
    fontSize:          17,
    fontWeight:        "700",
    paddingHorizontal: 16,
    paddingTop:        16,
    paddingBottom:     12,
  },
  answerList: {
    paddingHorizontal: 12,
    paddingBottom:     16,
    gap:               8,
  },
  answerRow: {
    flexDirection:    "row",
    alignItems:       "center",
    gap:              10,
    borderRadius:     10,
    borderWidth:      1,
    paddingVertical:  10,
    paddingHorizontal: 12,
  },
  answerIcon: {
    width:          22,
    height:         22,
    borderRadius:   11,
    alignItems:     "center",
    justifyContent: "center",
  },
  answerText: {
    flex:     1,
    fontSize: 14,
  },

  // Botones
  actions: {
    gap: 10,
    marginBottom: 16,
    flexDirection: "row",
  },
  reviewButton: {
    flex: 1,
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            8,
    borderWidth:    1,
    borderRadius:   14,
    paddingVertical: 14,
  },
  reviewButtonText: {
    fontSize:   16,
    fontWeight: "600",
  },
  continueButton: {
    flex: 1,
    borderRadius:    14,
    paddingVertical: 14,
    alignItems:      "center",
  },
  continueButtonText: {
    fontSize:   16,
    fontWeight: "700",
  },
});