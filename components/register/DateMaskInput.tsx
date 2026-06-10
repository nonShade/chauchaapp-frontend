import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { APP_THEME, Typography } from "@/constants/themes";
 
/**
 * Input de fecha con máscara visual DD/MM/AAAA.
 *
 * El usuario escribe solo números; el componente:
 *  - Inserta las barras automáticamente al formatear el valor
 *  - Muestra el placeholder restante (ej. "15/1_/____") en la prop placeholder
 *  - Aplica las reglas de cada segmento al vuelo
 *  - Valida rango de fechas al completar los 8 dígitos o al hacer submit
 */
 
type Props = {
  value: Date;
  minDate: Date;
  maxDate: Date;
  onChange: (date: Date) => void;
  hasError?: boolean;
  onSubmitEditing?: () => void;
};
 
const pad2 = (n: number) => String(n).padStart(2, "0");
 
const toDigits = (date: Date) =>
  `${pad2(date.getDate())}${pad2(date.getMonth() + 1)}${date.getFullYear()}`;
 
/**
 * Convierte dígitos crudos (máx 8) en la cadena con barras: "15/10/2000"
 */
const formatWithSlashes = (raw: string): string => {
  const d = raw.slice(0, 2);
  const m = raw.slice(2, 4);
  const y = raw.slice(4, 8);
 
  if (raw.length <= 2) return d;
  if (raw.length <= 4) return `${d}/${m}`;
  return `${d}/${m}/${y}`;
};
 
/**
 * Genera el placeholder dinámico con los huecos restantes.
 * Ej. con digits="151" → "15/1_/____"
 */
const buildPlaceholder = (raw: string): string => {
  const template = "DD/MM/AAAA";
  const formatted = formatWithSlashes(raw);
  // El placeholder muestra lo que falta a partir de donde está el valor
  return formatted + template.slice(formatted.length);
};
 
/**
 * Procesa cada dígito entrante aplicando las reglas de segmento.
 */
const processDigits = (incoming: string, current: string): string => {
  const clean = incoming.replace(/[^0-9]/g, "");
 
  // Borrado: devolvemos directamente
  if (clean.length <= current.length) return clean.slice(0, 8);
 
  let result = current;
 
  for (const ch of clean.slice(current.length)) {
    const pos = result.length;
 
    if (pos === 0) {
      // Día d1: 0-3 → normal; otro → prefija 0
      result += "0123".includes(ch) ? ch : "0" + ch;
    } else if (pos === 1) {
      // Día d2: si d1=3, solo 0 o 1
      result += result[0] === "3" && !"01".includes(ch) ? "0" : ch;
    } else if (pos === 2) {
      // Mes m1: 0 o 1 → normal; otro → prefija 0
      result += "01".includes(ch) ? ch : "0" + ch;
    } else if (pos === 3) {
      // Mes m2: si m1=1, solo 0, 1, 2
      result += result[2] === "1" && !"012".includes(ch) ? "0" : ch;
    } else if (pos < 8) {
      result += ch;
    }
 
    if (result.length >= 8) break;
  }
 
  return result.slice(0, 8);
};
 
export default function DateMaskInput({
  value,
  minDate,
  maxDate,
  onChange,
  hasError,
  onSubmitEditing,
}: Props) {
  const [digits, setDigits] = useState<string>(toDigits(value));
  const [dateError, setDateError] = useState("");
 
  const background = APP_THEME.background.primary;
  const foreground = APP_THEME.text.primary;
  const border = APP_THEME.input.border;
  const mutedForeground = APP_THEME.text.secondary;
  const primary = APP_THEME.button.primary.background;
  const errorColor = APP_THEME.status.error;
 
  const hasAnyError = !!(dateError || hasError);
 
  /* ── Validación y commit al padre ── */
  const tryCommit = (raw: string) => {
    if (raw.length < 8) return; // incompleto, no validamos aún
 
    setDateError("");
 
    const day = parseInt(raw.slice(0, 2), 10);
    const month = parseInt(raw.slice(2, 4), 10) - 1;
    const year = parseInt(raw.slice(4, 8), 10);
    const date = new Date(year, month, day);
 
    // Fecha inexistente (ej. 31/02)
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      setDateError("Fecha inválida");
      return;
    }
 
    // Menor de 18
    if (date > minDate) {
      setDateError("Debes tener al menos 18 años");
      return;
    }
 
    // Mayor de 50
    if (date < maxDate) {
      setDateError("La fecha excede el rango permitido");
      return;
    }
 
    onChange(date);
  };
 
  /* ── Handler principal ── */
  const handleChangeText = (text: string) => {
    // Extraemos solo dígitos (permite que el usuario pegue "15/10/2000")
    const rawInput = text.replace(/[^0-9]/g, "");
    const next = processDigits(rawInput, digits);
    setDigits(next);
    setDateError("");
 
    if (next.length === 8) tryCommit(next);
  };
 
  const displayValue = formatWithSlashes(digits);
  const placeholder = buildPlaceholder(digits);
 
  return (
    <View style={styles.wrapper}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: background,
            color: foreground,
            borderColor: hasAnyError ? errorColor : border,
          },
          hasAnyError && { backgroundColor: errorColor + "15" },
        ]}
        value={displayValue}
        onChangeText={handleChangeText}
        onSubmitEditing={() => {
          tryCommit(digits);
          onSubmitEditing?.();
        }}
        placeholder={placeholder}
        placeholderTextColor={mutedForeground}
        keyboardType="number-pad"
        // inputMode="numeric" activa el teclado numérico en web y simuladores móvil
        {...(typeof window !== "undefined" ? { inputMode: "numeric" } : {})}
        maxLength={10} // DD/MM/YYYY = 10 chars con barras
        returnKeyType="done"
        selectionColor={primary}
      />
 
      {dateError !== "" && (
        <Text style={[styles.errorMsg, { color: errorColor }]}>
          {dateError}
        </Text>
      )}
    </View>
  );
}
 
const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: Typography.md,
  },
  errorMsg: {
    fontSize: Typography.hint,
  },
});