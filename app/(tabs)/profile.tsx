import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Modal, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { APP_THEME } from '@/constants/themes';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { getIncomeTypes, getUserProfile, updateUserProfile, getNewsTopics, logoutUser, calculateAge, formatCLP, IncomeTypeOption, TopicOption, UserProfile as ApiUserProfile } from '@/services/api/userProfile';
import { familyGroupService } from '@/services/api/familyGroup';
import { FamilyGroup } from '@/types/family';

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
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null);
  const [familyGroupName, setFamilyGroupName] = useState('');
  const [creatingFamily, setCreatingFamily] = useState(false);
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);
  const [showManageFamilyModal, setShowManageFamilyModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const token = accessToken;
    let isActive = true;

    async function loadProfile() {
      setLoading(true);
      setIncomeTypes([]);
      setNewsTopics([]);
      setFamilyGroup(null);

      void getIncomeTypes()
        .then((incomeTypesData) => {
          if (!isActive) return;
          setIncomeTypes(incomeTypesData);
        })
        .catch((error) => {
          console.error('Error al cargar tipos de ingreso:', error);
        });

      void getNewsTopics()
        .then((newsTopicsData) => {
          if (!isActive) return;
          setNewsTopics(newsTopicsData);
        })
        .catch((error) => {
          console.error('Error al cargar topics de noticias:', error);
        });

      void familyGroupService
        .getFamilyGroup(token)
        .then((familyGroupData) => {
          if (!isActive || !familyGroupData) return;
          setFamilyGroup(familyGroupData);
        })
        .catch(() => {
          console.log('Usuario aún no tiene grupo familiar');
        });

      try {
        const profileData = await getUserProfile(token);
        if (!isActive) return;

        if (profileData) {
          setUserProfile(profileData);
          setDraftName(`${profileData.first_name} ${profileData.last_name}`.trim());
          setDraftEmail(profileData.email);
          setDraftIncomeTypeId(profileData.income_type_id);
          setDraftMonthlyIncome(String(Math.round(Number(profileData.monthly_income || '0'))));
        } else {
          setUserProfile(null);
          setDraftName('');
          setDraftEmail('');
          setDraftIncomeTypeId('');
          setDraftMonthlyIncome('');
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!userProfile) {
      setSelectedTopics({});
      return;
    }

    if (newsTopics.length === 0) return;

    const topicsMap: Record<string, boolean> = {};
    newsTopics.forEach((topic) => {
      topicsMap[topic.id] = userProfile.topics.includes(topic.id);
    });
    setSelectedTopics(topicsMap);
  }, [newsTopics, userProfile]);

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

  const handleCreateFamilyGroup = async () => {
    if (!familyGroupName.trim() || creatingFamily || !accessToken) return;

    setCreatingFamily(true);
    try {
      const newFamilyGroup = await familyGroupService.createFamilyGroup(
        accessToken,
        familyGroupName.trim()
      );
      
      setFamilyGroup(newFamilyGroup);
      setFamilyGroupName('');
      setShowCreateFamilyModal(false);
    } catch (error) {
      console.error('Error al crear grupo familiar:', error);
      alert('Error al crear el grupo familiar. Intenta nuevamente.');
    } finally {
      setCreatingFamily(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || sendingInvite || !accessToken) return;

    setSendingInvite(true);
    try {
      const response = await familyGroupService.sendInvitation(accessToken, inviteEmail.trim());
      console.log('Invitación enviada:', response);
      setInviteEmail('');
      alert('Invitación enviada exitosamente');
    } catch (error) {
      console.error('Error al invitar miembro:', error);
      alert('Error al enviar la invitación. Verifica que el correo sea válido.');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!accessToken) return;
    
    try {
      await familyGroupService.removeMember(accessToken, memberId);
      
      // Actualizar estado local
      if (familyGroup) {
        const updatedMembers = familyGroup.members.filter(m => m.id !== memberId);
        setFamilyGroup({
          ...familyGroup,
          members: updatedMembers,
        });
      }
      alert('Miembro eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar miembro:', error);
      alert('Error al eliminar miembro. Intenta nuevamente.');
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
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

        {/* Grupo Familiar */}
        <View style={styles.section}>
          <View style={styles.familyHeader}>
            <Ionicons name="people-outline" size={20} color="#6B7280" />
            <Text style={styles.sectionTitle}>Grupo Familiar</Text>
          </View>
          
          {familyGroup ? (
            <View>
              <View style={styles.familyGroupCard}>
                <View>
                  <Text style={styles.familyGroupName}>{familyGroup.name}</Text>
                  <Text style={styles.familyGroupMembers}>{familyGroup.members.length} miembro{familyGroup.members.length !== 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.familyAvatarsRow}>
                  {familyGroup.members.slice(0, 3).map((member, index) => {
                    const initials = (member.first_name.substring(0, 1) + (member.last_name?.substring(0, 1) || '')).toUpperCase();
                    return (
                      <View key={member.id} style={[styles.familyAvatar, index > 0 && styles.familyAvatarOverlap]}>
                        <Text style={styles.familyAvatarText}>{initials}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
              <TouchableOpacity 
                style={styles.administrarBtn}
                onPress={() => setShowManageFamilyModal(true)}
              >
                <Text style={styles.administrarBtnText}>Administrar</Text>
                <Ionicons name="chevron-forward" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.sectionDescription}>
                Crea un grupo familiar para gestionar gastos compartidos.
              </Text>
              <TouchableOpacity 
                style={styles.createFamilyBtn}
                onPress={() => setShowCreateFamilyModal(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color={APP_THEME.button.primary.background} />
                <Text style={styles.createFamilyBtnText}>Crear grupo familiar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={APP_THEME.status.error} />
          <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para crear grupo familiar */}
      <Modal 
        visible={showCreateFamilyModal} 
        transparent 
        animationType="fade"
        onRequestClose={() => setShowCreateFamilyModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowCreateFamilyModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear Grupo Familiar</Text>
              <TouchableOpacity onPress={() => setShowCreateFamilyModal(false)}>
                <Ionicons name="close" size={24} color={APP_THEME.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Nombre del grupo</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej: Casa González"
                placeholderTextColor={APP_THEME.text.secondary}
                value={familyGroupName}
                onChangeText={setFamilyGroupName}
                editable={!creatingFamily}
              />
              <Text style={styles.modalHint}>Este nombre identificará a tu grupo familiar</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn}
                onPress={() => setShowCreateFamilyModal(false)}
                disabled={creatingFamily}
              >
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalCreateBtn, (!familyGroupName.trim() || creatingFamily) && styles.modalCreateBtnDisabled]}
                onPress={handleCreateFamilyGroup}
                disabled={!familyGroupName.trim() || creatingFamily}
              >
                <Text style={styles.modalCreateBtnText}>{creatingFamily ? 'Creando...' : 'Crear'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal para administrar grupo familiar */}
      <Modal 
        visible={showManageFamilyModal} 
        transparent 
        animationType="fade"
        onRequestClose={() => setShowManageFamilyModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowManageFamilyModal(false)}
        >
          <Pressable style={styles.manageFamilyModalContent} onPress={() => {}}>
            <View style={styles.manageFamilyHeader}>
              <Text style={styles.manageFamilyTitle}>{familyGroup?.name}</Text>
              <TouchableOpacity onPress={() => setShowManageFamilyModal(false)}>
                <Ionicons name="close" size={24} color={APP_THEME.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.manageFamilyBody} showsVerticalScrollIndicator={false}>
              {/* Miembros */}
              <View style={styles.manageFamilySection}>
                <Text style={styles.manageFamilySectionTitle}>Miembros</Text>
                {familyGroup?.members.map((member, index) => {
                  const initials = (member.first_name.substring(0, 1) + (member.last_name?.substring(0, 1) || '')).toUpperCase();
                  const isAdmin = index === 0;
                  const contribution = `${member.income_contribution_percentage}%`;
                  
                  return (
                    <View key={member.id} style={styles.memberRow}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberAvatarText}>{initials}</Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <View style={styles.memberNameRow}>
                          <Text style={styles.memberName}>{member.first_name} {member.last_name}</Text>
                          {isAdmin && <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Admin</Text></View>}
                        </View>
                        <Text style={styles.memberContribution}>Contribución: {contribution}</Text>
                      </View>
                      {!isAdmin && (
                        <TouchableOpacity onPress={() => handleRemoveMember(member.id)}>
                          <Ionicons name="trash-outline" size={20} color={APP_THEME.status.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Invitar por correo */}
              <View style={styles.manageFamilySection}>
                <Text style={styles.manageFamilySectionTitle}>Invitar por correo</Text>
                <View style={styles.inviteContainer}>
                  <TextInput
                    style={styles.inviteInput}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor={APP_THEME.text.secondary}
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!sendingInvite}
                  />
                  <TouchableOpacity 
                    style={styles.inviteSendBtn}
                    onPress={handleInviteMember}
                    disabled={!inviteEmail.trim() || sendingInvite}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.inviteHint}>El usuario recibirá una notificación para unirse al grupo.</Text>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.doneBtn}
              onPress={() => setShowManageFamilyModal(false)}
            >
              <Text style={styles.doneBtnText}>Listo</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
  familyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  familyGroupCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  familyGroupName: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_THEME.text.primary,
    marginBottom: 4,
  },
  familyGroupMembers: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
  },
  familyAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  familyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: APP_THEME.button.primary.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: APP_THEME.card.background,
  },
  familyAvatarOverlap: {
    marginLeft: -12,
  },
  familyAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: APP_THEME.button.primary.text,
  },
  administrarBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    borderRadius: 10,
    backgroundColor: APP_THEME.card.progressBg,
  },
  administrarBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_THEME.text.primary,
  },
  createFamilyBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: APP_THEME.button.primary.background,
    borderRadius: 10,
    backgroundColor: 'transparent',
    gap: 8,
  },
  createFamilyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_THEME.button.primary.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: APP_THEME.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: APP_THEME.card.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_THEME.text.primary,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: APP_THEME.text.primary,
    backgroundColor: APP_THEME.card.progressBg,
    marginBottom: 8,
  },
  modalHint: {
    fontSize: 11,
    color: APP_THEME.text.secondary,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    backgroundColor: APP_THEME.card.progressBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_THEME.text.primary,
  },
  modalCreateBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: APP_THEME.button.primary.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCreateBtnDisabled: {
    opacity: 0.6,
  },
  modalCreateBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_THEME.button.primary.text,
  },
  manageFamilyModalContent: {
    backgroundColor: APP_THEME.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: APP_THEME.card.border,
    maxHeight: '90%',
  },
  manageFamilyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  manageFamilyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: APP_THEME.text.primary,
  },
  manageFamilyBody: {
    marginBottom: 16,
    maxHeight: '70%',
  },
  manageFamilySection: {
    marginBottom: 24,
  },
  manageFamilySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_THEME.text.primary,
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: APP_THEME.card.border,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: APP_THEME.button.primary.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_THEME.button.primary.text,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_THEME.text.primary,
  },
  adminBadge: {
    backgroundColor: APP_THEME.button.primary.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: APP_THEME.button.primary.text,
  },
  memberContribution: {
    fontSize: 12,
    color: APP_THEME.text.secondary,
  },
  inviteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inviteInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: APP_THEME.text.primary,
    backgroundColor: APP_THEME.card.progressBg,
  },
  inviteSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: APP_THEME.button.primary.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteHint: {
    fontSize: 11,
    color: APP_THEME.text.secondary,
    fontStyle: 'italic',
  },
  doneBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: APP_THEME.button.primary.background,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_THEME.button.primary.text,
  },
});
