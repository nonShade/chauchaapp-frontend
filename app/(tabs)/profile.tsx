import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { APP_THEME } from '@/constants/themes';
import { useAuth } from '@/contexts/AuthContext';
import { getIncomeTypes, getUserProfile, updateUserProfile, getNewsTopics, logoutUser, calculateAge, formatCLP, IncomeTypeOption, TopicOption, UserProfile as ApiUserProfile } from '@/services/api/userProfile';

const INCOME_TYPE_CHOICES = [
  { label: 'sueldo fijo', searchTerms: ['sueldo fijo', 'sueldo fijo'] },
  { label: 'frelance', searchTerms: ['frelance', 'freelance'] },
];

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const getTopicIcon = (name: string) => {
  const n = normalizeText(name);
  if (n.includes('sueldo')) return 'hand-holding-usd';
  if (n.includes('combust')) return 'gas-pump';
  if (n.includes('aliment') || n.includes('alimento')) return 'utensils';
  if (n.includes('viviend')) return 'home';
  if (n.includes('transport')) return 'car';
  if (n.includes('servici') || n.includes('basic')) return 'plug';
  if (n.includes('impu')) return 'file-invoice-dollar';
  if (n.includes('credit') || n.includes('credito') || n.includes('cr?dit')) return 'credit-card';
  if (n.includes('ahorr')) return 'wallet';
  if (n.includes('inversion')) return 'chart-line';
  return 'tag';
};

export default function PerfilScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [userProfile, setUserProfile] = useState<ApiUserProfile | null>(null);
  const [incomeTypes, setIncomeTypes] = useState<IncomeTypeOption[]>([]);
  const [newsTopics, setNewsTopics] = useState<TopicOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftIncomeTypeId, setDraftIncomeTypeId] = useState('');
  const [draftMonthlyIncome, setDraftMonthlyIncome] = useState('');

  const [selectedTopics, setSelectedTopics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const token = accessToken;

    async function loadProfile() {
      try {
        const [profile, incomeTypesData, newsTopicsData] = await Promise.all([
          getUserProfile(token),
          getIncomeTypes(),
          getNewsTopics(),
        ]);

        setIncomeTypes(incomeTypesData);
        setNewsTopics(newsTopicsData);

        if (profile) {
          setUserProfile(profile);
          setDraftName(`${profile.first_name} ${profile.last_name}`.trim());
          setDraftEmail(profile.email);
          setDraftIncomeTypeId(profile.income_type_id);
          setDraftMonthlyIncome(String(Math.round(Number(profile.monthly_income || '0'))));

          const topicsMap: Record<string, boolean> = {};
          newsTopicsData.forEach((topic) => {
            topicsMap[topic.id] = profile.topics.includes(topic.id);
          });
          setSelectedTopics(topicsMap);
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [accessToken]);

  const syncDraftFromProfile = () => {
    if (!userProfile) return;

    setDraftName(`${userProfile.first_name} ${userProfile.last_name}`.trim());
    setDraftEmail(userProfile.email);
    setDraftIncomeTypeId(userProfile.income_type_id);
    setDraftMonthlyIncome(String(Math.round(Number(userProfile.monthly_income || '0'))));
  };

  const parseName = (fullName: string) => {
    const trimmedName = fullName.trim().replace(/\s+/g, ' ');
    const parts = trimmedName.split(' ');

    if (parts.length <= 1) {
      return {
        firstName: trimmedName,
        lastName: userProfile?.last_name || '',
      };
    }

    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  };

  const resolveIncomeTypeId = (label: string) => {
    const normalizedLabel = normalizeText(label);
    const matchedApiOption = incomeTypes.find((option) => {
      const normalizedOption = normalizeText(option.name);
      return INCOME_TYPE_CHOICES.find((choice) =>
        choice.searchTerms.some((term) => normalizeText(term) === normalizedOption || normalizeText(term) === normalizedLabel)
      )?.label === label || normalizedOption === normalizedLabel;
    });

    return matchedApiOption?.id || draftIncomeTypeId;
  };

  const resolveIncomeTypeLabel = (incomeTypeId: string) => {
    const matched = incomeTypes.find((option) => option.id === incomeTypeId);
    const normalizedName = matched ? normalizeText(matched.name) : '';
    const choice = INCOME_TYPE_CHOICES.find((option) =>
      option.searchTerms.some((term) => normalizeText(term) === normalizedName)
    );

    return choice?.label || matched?.name || 'No especificado';
  };

  const handleSaveProfile = async () => {
    if (!accessToken || !userProfile || saving) return;

    const { firstName, lastName } = parseName(draftName);
    const monthlyIncome = Number.parseFloat(draftMonthlyIncome || '0');
    const monthlyExpenses = Number.parseFloat(userProfile.monthly_expenses || '0');

    setSaving(true);
    try {
      const updatedProfile = await updateUserProfile(accessToken, {
        first_name: firstName,
        last_name: lastName,
        email: draftEmail.trim(),
        birth_date: userProfile.birth_date,
        income_type_id: resolveIncomeTypeId(draftIncomeTypeId),
        monthly_income: Number.isFinite(monthlyIncome) ? monthlyIncome : 0,
        monthly_expenses: Number.isFinite(monthlyExpenses) ? monthlyExpenses : 0,
        topics: Object.entries(selectedTopics)
          .filter(([, value]) => value)
          .map(([topicId]) => topicId),
      });

      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setDraftName(`${updatedProfile.first_name} ${updatedProfile.last_name}`.trim());
        setDraftEmail(updatedProfile.email);
        setDraftIncomeTypeId(updatedProfile.income_type_id);
        setDraftMonthlyIncome(String(Math.round(Number(updatedProfile.monthly_income || '0'))));

        const nextSelectedTopics: Record<string, boolean> = {};
        newsTopics.forEach((topic) => {
          nextSelectedTopics[topic.id] = updatedProfile.topics.includes(topic.id);
        });
        setSelectedTopics(nextSelectedTopics);

        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = () => {
    if (saving) return;

    syncDraftFromProfile();
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    if (saving) return;

    syncDraftFromProfile();
    setIsEditMode(false);
  };

  const handleSaveButtonPress = () => {
    if (saving) return;

    handleSaveProfile();
  };

  const handleLogout = async () => {
    if (!accessToken) {
      // If no token, still clear and redirect
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        await SecureStore.deleteItemAsync('user').catch(() => {});
        await SecureStore.deleteItemAsync('token').catch(() => {});
      } finally {
        router.replace('/login');
      }
      return;
    }

    try {
      const ok = await logoutUser(accessToken);
      if (!ok) {
        console.warn('Logout endpoint returned non-OK status; proceeding to clear local tokens.');
      }

      // Clear local storage and secure store regardless of endpoint result
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      await SecureStore.deleteItemAsync('user').catch(() => {});
      await SecureStore.deleteItemAsync('token').catch(() => {});

      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Best-effort: clear local tokens and redirect
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        await SecureStore.deleteItemAsync('user').catch(() => {});
        await SecureStore.deleteItemAsync('token').catch(() => {});
      } finally {
        router.replace('/login');
      }
    }
  };

  const handleTopicChange = (topicId: string, value: boolean) => {
    if (!isEditMode || saving) return;
    
    setSelectedTopics(prev => ({
      ...prev,
      [topicId]: value
    }));
    // TODO: Aquí se podría hacer una llamada a un endpoint para actualizar los topics
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const initials = userProfile
    ? (userProfile.first_name.substring(0, 1) + (userProfile.last_name?.substring(0, 1) || '')).toUpperCase()
    : 'UD';
  
  const age = userProfile ? calculateAge(userProfile.birth_date) : 0;
  const monthlyIncome = userProfile ? formatCLP(userProfile.monthly_income) : '$0';
  const selectedIncomeTypeLabel = isEditMode
    ? resolveIncomeTypeLabel(draftIncomeTypeId)
    : resolveIncomeTypeLabel(userProfile?.income_type_id || '');

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Mi Perfil</Text>
          {isEditMode ? (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.headerCancelBtn, saving && styles.headerButtonDisabled]}
                onPress={handleCancelEdit}
                disabled={saving}
              >
                <Text style={styles.headerCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerSaveBtn, saving && styles.headerButtonDisabled]}
                onPress={handleSaveButtonPress}
                disabled={saving}
              >
                <Ionicons name="save-outline" size={18} color={APP_THEME.button.primary.text} />
                <Text style={styles.headerSaveBtnText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.headerEditBtn} onPress={handleStartEdit} disabled={saving}>
              <Ionicons name="settings-outline" size={20} color={APP_THEME.text.primary} />
              <Text style={styles.headerEditBtnText}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            {isEditMode ? (
              <TextInput
                style={styles.profileNameInput}
                value={draftName}
                onChangeText={setDraftName}
                placeholder="Nombre"
                placeholderTextColor={APP_THEME.text.secondary}
                editable={!saving}
              />
            ) : (
              <Text style={styles.profileName}>
                {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Usuario'}
              </Text>
            )}
            <Text style={styles.profileEmail}>{draftEmail || userProfile?.email || 'email@example.com'}</Text>
          </View>
        </View>

        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Correo electrónico</Text>
              {isEditMode ? (
                <TextInput
                  style={styles.infoInput}
                  value={draftEmail}
                  onChangeText={setDraftEmail}
                  placeholder="Correo electrónico"
                  placeholderTextColor={APP_THEME.text.secondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!saving}
                />
              ) : (
                <Text style={styles.infoValue}>{userProfile?.email || 'email@example.com'}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Edad</Text>
              <Text style={styles.infoValue}>{age} años</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="briefcase-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tipo de ingreso</Text>
              {isEditMode ? (
                <View style={styles.incomeTypeGrid}>
                  {INCOME_TYPE_CHOICES.map((option) => {
                    const optionId = resolveIncomeTypeId(option.label);
                    const isSelected = draftIncomeTypeId === optionId || selectedIncomeTypeLabel === option.label;

                    return (
                      <TouchableOpacity
                        key={option.label}
                        style={[
                          styles.incomeTypeOption,
                          isSelected && styles.incomeTypeOptionActive,
                        ]}
                        onPress={() => setDraftIncomeTypeId(optionId)}
                        disabled={saving}
                      >
                        <Text
                          style={[
                            styles.incomeTypeOptionText,
                            isSelected && styles.incomeTypeOptionTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.infoValue}>{selectedIncomeTypeLabel}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="cash-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ingreso mensual</Text>
              {isEditMode ? (
                <TextInput
                  style={styles.infoInput}
                  value={draftMonthlyIncome}
                  onChangeText={(text) => setDraftMonthlyIncome(text.replace(/[^0-9]/g, ''))}
                  placeholder="800000"
                  placeholderTextColor={APP_THEME.text.secondary}
                  keyboardType="numeric"
                  editable={!saving}
                />
              ) : (
                <Text style={styles.infoValue}>${monthlyIncome}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Tu perfil financiero */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tu perfil financiero</Text>
          <Text style={styles.sectionDescription}>
            Estos datos ayudan a personalizar las noticias y recomendaciones.
          </Text>

          {newsTopics.map((category, index) => (
            <View key={category.id} style={[styles.toggleRow, index === newsTopics.length - 1 && styles.toggleRow__last, !isEditMode && styles.toggleRowDisabled]}>
              <View style={styles.toggleContent}>
                <FontAwesome5 name={getTopicIcon(category.name)} size={18} color="#6B7280" />
                <Text style={styles.toggleLabel}>{category.name}</Text>
              </View>
              <Switch
                value={selectedTopics[category.id] ?? false}
                onValueChange={(value) => handleTopicChange(category.id, value)}
                disabled={!isEditMode || saving}
                trackColor={{ false: '#333', true: '#00a452' }}
                thumbColor={selectedTopics[category.id] ? '#FFFFFF' : '#999'}
              />
            </View>
          ))}
        </View>

        {/* Apariencia */}
        <View style={styles.section}>
          <View style={styles.appearanceHeader}>
            <FontAwesome5 name="moon" size={18} color="#6B7280" />
            <Text style={styles.sectionTitle}>Apariencia</Text>
          </View>

          <View style={styles.appearanceModeContainer}>
            <View style={styles.appearanceModeRow}>
              <View style={styles.toggleContent}>
                <FontAwesome5 name="moon" size={18} color="#6B7280" />
                <Text style={styles.toggleLabel}>Modo oscuro</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#333', true: '#00a452' }}
                thumbColor={darkMode ? '#FFFFFF' : '#999'}
              />
            </View>
            <Text style={styles.modeText}>Activado</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={APP_THEME.status.error} />
          <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: APP_THEME.text.primary,
  },
  headerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
  },
  headerButtonDisabled: {
    opacity: 0.7,
  },
  headerCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    backgroundColor: APP_THEME.card.background,
  },
  headerCancelBtnText: {
    fontSize: 14,
    color: APP_THEME.text.primary,
    fontWeight: '600',
  },
  headerSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: APP_THEME.button.primary.background,
  },
  headerSaveBtnText: {
    fontSize: 14,
    color: APP_THEME.button.primary.text,
    fontWeight: '700',
  },
  headerEditBtnText: {
    fontSize: 14,
    color: APP_THEME.text.primary,
    fontWeight: '500',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_THEME.card.background,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: APP_THEME.button.primary.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_THEME.button.primary.text,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_THEME.text.primary,
  },
  profileNameInput: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_THEME.text.primary,
    backgroundColor: APP_THEME.card.progressBg,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  profileEmail: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
    marginTop: 4,
  },
  section: {
    backgroundColor: APP_THEME.card.background,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_THEME.text.primary,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
    marginBottom: 12,
  },
  appearanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: APP_THEME.card.progressBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: APP_THEME.text.primary,
  },
  infoInput: {
    fontSize: 14,
    fontWeight: '500',
    color: APP_THEME.text.primary,
    backgroundColor: APP_THEME.card.progressBg,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  incomeTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  incomeTypeOption: {
    minWidth: '48%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    backgroundColor: APP_THEME.card.progressBg,
  },
  incomeTypeOptionActive: {
    borderColor: APP_THEME.button.primary.background,
    backgroundColor: '#0f2d1f',
  },
  incomeTypeOptionText: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  incomeTypeOptionTextActive: {
    color: APP_THEME.button.primary.background,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: APP_THEME.card.border,
  },
  toggleRowDisabled: {
    opacity: 0.5,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleRow__last: {
    borderBottomWidth: 0,
  },
  toggleLabel: {
    fontSize: 14,
    color: APP_THEME.text.primary,
    fontWeight: '500',
  },
  appearanceModeContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: APP_THEME.card.border,
  },
  appearanceModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeText: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
    marginLeft: 28,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: APP_THEME.status.error,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 12,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_THEME.status.error,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_THEME.text.primary,
  },
});
