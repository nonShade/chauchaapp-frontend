import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { APP_THEME } from "@/constants/themes";
import { FormData } from "@/types/registerForm";
 
type Props = {
  formData: FormData;
  categoryMap: Record<string, any>;
  toggleCategory: (categoryId: string) => void;
};
 
export default function StepThree({
  formData,
  categoryMap,
  toggleCategory,
}: Props) {
  const foreground = APP_THEME.text.primary;
  const border = APP_THEME.input.border;
  const mutedForeground = APP_THEME.text.secondary;
  const primary = APP_THEME.button.primary.background;
 
  return (
    <View>
      <Text style={[styles.hint, { color: mutedForeground }]}>
        Selecciona todos los que aplican. Mínimo 1.
      </Text>
 
      <View style={styles.grid}>
        {Object.values(categoryMap).map((category: any) => {
          const isActive = formData.economicCategories.includes(category.id);
 
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.gridOption,
                { borderColor: border },
                isActive && {
                  backgroundColor: `${primary}20`,
                  borderColor: primary,
                  borderWidth: 2,
                },
                { alignItems: "flex-start", justifyContent: "flex-start" },
              ]}
              onPress={() => toggleCategory(category.id)}
            >
              <Text
                style={[
                  styles.gridText,
                  { color: foreground },
                  isActive && { color: primary },
                ]}
              >
                {category.name}
              </Text>
              <Text
                style={[
                  styles.gridSubText,
                  { color: mutedForeground },
                ]}
              >
                {category.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  hint: {
    fontSize: 16,
    marginBottom: 4,
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
  },
  gridText: {
    fontWeight: "600",
    fontSize: 16,
    textAlign: "left",
  },
  gridSubText: {
    fontSize: 12,
    textAlign: "left",
    marginTop: 4,
  },
});