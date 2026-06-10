import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { APP_THEME, Typography } from "@/constants/themes";
import { FormData, FormErrors } from "@/types/registerForm";
import { MIN_AGE, MAX_AGE, buildAgeDate } from "@/constants/registerValidation";
import DateDrumPicker from "./DateDrumPicker";

type Props = {
  formData:      FormData;
  errors:        FormErrors;
  incomeTypes:   any[];
  updateField:   (field: keyof FormData, value: any) => void;
  validateField: (field: keyof FormData, value: any) => boolean;
};

export default function StepTwo({
  formData,
  errors,
  incomeTypes,
  updateField,
  validateField,
}: Props) {
  const spentAmountRef = useRef<TextInput>(null);

  const background      = APP_THEME.background.primary;
  const foreground      = APP_THEME.text.primary;
  const border          = APP_THEME.input.border;
  const mutedForeground = APP_THEME.text.secondary;
  const primary         = APP_THEME.button.primary.background;
  const errorColor      = APP_THEME.status.error;

  const minDate = buildAgeDate(MIN_AGE); // fecha más reciente permitida
  const maxDate = buildAgeDate(MAX_AGE); // fecha más antigua permitida

  const inputStyle = [
    styles.input,
    { backgroundColor: background, color: foreground, borderColor: border },
  ];
  const inputErrorStyle = {
    borderColor:     errorColor,
    backgroundColor: errorColor + "15",
  };

  return (
    <View style={styles.mainContainer}>
      {/* ── Fecha de nacimiento ── */}
      <View>
        <Text style={[styles.inputLabel, { color: foreground }]}>
          Fecha de nacimiento
        </Text>
        <DateDrumPicker
          value={formData.birthDate}
          minDate={minDate}
          maxDate={maxDate} 
          onChange={(date) => updateField("birthDate", date)}
        />
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
                  borderColor:     primary,
                  borderWidth:     2,
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
          style={[inputStyle, errors.incomeAmount && inputErrorStyle, styles.normalText]}
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
          style={[inputStyle, errors.spentAmount && inputErrorStyle, styles.normalText]}
          placeholder="Ej: 500000"
          placeholderTextColor={mutedForeground}
          keyboardType="numeric"
          value={formData.spentAmount}
          onChangeText={(text) =>
            updateField("spentAmount", text.replace(/[^0-9]/g, ""))
          }
          onBlur={() => formData.spentAmount === "" ? updateField("spentAmount", "0") : validateField("spentAmount", formData.spentAmount)}
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
    fontWeight:   "600",
    fontSize:     Typography.base,
  },
  normalText: {
    fontSize: Typography.md,
  },
  input: {
    borderWidth:      1,
    borderRadius:     12,
    height:           48,
    paddingHorizontal: 16,
    justifyContent:   "center",
  },
  grid: {
    flexDirection:  "row",
    flexWrap:       "wrap",
    justifyContent: "space-between",
    gap:            12,
    marginTop:      8,
  },
  gridOption: {
    width:          "48%",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius:   12,
    borderWidth:    1,
    alignItems:     "center",
    justifyContent: "center",
  },
});