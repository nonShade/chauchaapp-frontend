import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { APP_THEME } from "@/constants/themes";
import { FormData, FormErrors } from "@/types/registerForm";
import DateMaskInput from "./DateMaskInput";
 
/* Intentamos importar el picker nativo; si el módulo no existe
   (web, Expo Go sin módulo nativo, etc.) activamos el fallback.  */
let DateTimePicker: any = null;
let dateTimePickerAvailable = false;
try {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
  dateTimePickerAvailable = Platform.OS === "ios" || Platform.OS === "android";
} catch {
  dateTimePickerAvailable = false;
}
 
type Props = {
  formData: FormData;
  errors: FormErrors;
  incomeTypes: any[];
  updateField: (field: keyof FormData, value: any) => void;
  validateField: (field: keyof FormData, value: any) => boolean;
};
 
const MIN_AGE = 18;
const MAX_AGE = 50;
 
const buildAgeDate = (yearsAgo: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  return d;
};
 
export default function StepTwo({
  formData,
  errors,
  incomeTypes,
  updateField,
  validateField,
}: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const spentAmountRef = useRef<TextInput>(null);
 
  const background = APP_THEME.background.primary;
  const foreground = APP_THEME.text.primary;
  const border = APP_THEME.input.border;
  const mutedForeground = APP_THEME.text.secondary;
  const primary = APP_THEME.button.primary.background;
  const errorColor = APP_THEME.status.error;
 
  const minDate = buildAgeDate(MIN_AGE); // fecha más reciente permitida
  const maxDate = buildAgeDate(MAX_AGE); // fecha más antigua permitida
 
  const inputStyle = [
    styles.input,
    { backgroundColor: background, color: foreground, borderColor: border },
  ];
  const inputErrorStyle = {
    borderColor: errorColor,
    backgroundColor: errorColor + "15",
  };
 
  const handleNativeDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      updateField("birthDate", selectedDate);
    }
    setShowDatePicker(false);
  };
 
  return (
    <View style={styles.mainContainer}>
      {/* ── Fecha de nacimiento ── */}
      <View>
        <Text style={[styles.inputLabel, { color: foreground }]}>
          Fecha de nacimiento
        </Text>
 
        {dateTimePickerAvailable ? (
          /* Picker nativo iOS / Android */
          <>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <View
                style={[
                  styles.input,
                  {
                    backgroundColor: background,
                    borderColor: errors.birthDate ? errorColor : border,
                    justifyContent: "center",
                  },
                  errors.birthDate && inputErrorStyle,
                ]}
              >
                <Text style={[{ color: foreground }, styles.normalText]}>
                  {formData.birthDate.toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
 
            {showDatePicker && DateTimePicker && (
              <DateTimePicker
                value={formData.birthDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={minDate}
                minimumDate={maxDate}
                onChange={handleNativeDateChange}
              />
            )}
          </>
        ) : (
          /* Fallback: campo enmascarado DD/MM/YYYY */
          <DateMaskInput
            value={formData.birthDate}
            minDate={minDate}
            maxDate={maxDate}
            onChange={(date) => updateField("birthDate", date)}
            hasError={!!errors.birthDate}
          />
        )}
      </View>
 
      {/* ── Tipo de ingreso ── */}
      <View>
        <Text style={[styles.inputLabel, { color: foreground }]}>
          Tipo de ingreso
        </Text>
        <View style={styles.grid}>
          {incomeTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.gridOption,
                { borderColor: border, borderRadius: 20 },
                formData.incomeType === type.id && {
                  backgroundColor: `${primary}20`,
                  borderColor: primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => updateField("incomeType", type.id)}
            >
              <Text
                style={[
                  styles.inputLabel,
                  { color: foreground },
                  styles.normalText,
                  formData.incomeType === type.id && { color: primary },
                ]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
 
      {/* ── Ingreso mensual ── */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.inputLabel, { color: foreground }]}>
          Ingreso mensual (CLP)
        </Text>
        <TextInput
          style={[
            inputStyle,
            errors.incomeAmount && inputErrorStyle,
            styles.normalText,
          ]}
          placeholder="Ej: 800000"
          placeholderTextColor={mutedForeground}
          keyboardType="numeric"
          value={formData.incomeAmount}
          onChangeText={(text) =>
            updateField("incomeAmount", text.replace(/[^0-9]/g, ""))
          }
          onBlur={() => validateField("incomeAmount", formData.incomeAmount)}
          onSubmitEditing={() => spentAmountRef.current?.focus()}
          returnKeyType="next"
        />
      </View>
 
      {/* ── Gastos mensuales ── */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.inputLabel, { color: foreground }]}>
          Gastos mensuales estimados (CLP)
        </Text>
        <TextInput
          ref={spentAmountRef}
          style={[
            inputStyle,
            errors.spentAmount && inputErrorStyle,
            styles.normalText,
          ]}
          placeholder="Ej: 500000"
          placeholderTextColor={mutedForeground}
          keyboardType="numeric"
          value={formData.spentAmount}
          onChangeText={(text) =>
            updateField("spentAmount", text.replace(/[^0-9]/g, ""))
          }
          onBlur={() => validateField("spentAmount", formData.spentAmount)}
          returnKeyType="done"
        />
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  mainContainer: {
    gap: 12,
  },
  fieldContainer: {
    gap: 4,
  },
  inputLabel: {
    marginBottom: 4,
    fontWeight: "600",
    fontSize: 14,
  },
  normalText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
  },
  gridOption: {
    width: "48%",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});