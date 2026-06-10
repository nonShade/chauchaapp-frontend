import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { APP_THEME, Typography } from "@/constants/themes";
import { FormData } from "@/types/registerForm";
import { TopicOption } from "@/services/api/userProfile";

type Props = {
  formData:       FormData;
  categoryMap:    TopicOption[];
  toggleCategory: (categoryId: string) => void;
};

export default function StepThree({ formData, categoryMap, toggleCategory }: Props) {
  const foreground      = APP_THEME.text.primary;
  const border          = APP_THEME.input.border;
  const mutedForeground = APP_THEME.text.secondary;
  const primary         = APP_THEME.button.primary.background;

  return (
    <View>
      <Text style={[styles.hint, { color: mutedForeground }]}>
        Selecciona todos los que aplican. Mínimo 1.
      </Text>

      <View style={styles.grid}>
        {categoryMap.map((category) => {
          const isActive = formData.economicCategories.includes(category.id);

          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.gridOption,
                { borderColor: border, alignItems: "flex-start", justifyContent: "flex-start" },
                isActive && {
                  backgroundColor: `${primary}20`,
                  borderColor:     primary,
                  borderWidth:     2,
                },
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
              {category.description && (
                <Text style={[styles.gridSubText, { color: mutedForeground }]}>
                  {category.description}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize:     Typography.md,
    marginBottom: 4,
  },
  grid: {
    flexDirection:  "row",
    flexWrap:       "wrap",
    justifyContent: "space-between",
    gap:            12,
    marginTop:      8,
  },
  gridOption: {
    width:           "48%",
    paddingVertical:  16,
    paddingHorizontal: 12,
    borderRadius:    12,
    borderWidth:     1,
  },
  gridText: {
    fontWeight: "600",
    fontSize:   Typography.md,
    textAlign:  "left",
  },
  gridSubText: {
    fontSize:  Typography.sm,
    textAlign: "left",
    marginTop: 4,
  },
});