import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { APP_THEME } from '@/constants/themes';
import { SkeletonPulse } from '@/components/learn/SkeletonPulse';

export function ProfileSkeleton() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.headerRow}>
        <SkeletonPulse>
          <View style={styles.titleSkeleton} />
        </SkeletonPulse>
        <SkeletonPulse>
          <View style={styles.editBtnSkeleton} />
        </SkeletonPulse>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <SkeletonPulse>
          <View style={styles.avatarSkeleton} />
        </SkeletonPulse>
        <View style={styles.profileInfo}>
          <SkeletonPulse>
            <View style={styles.nameSkeleton} />
          </SkeletonPulse>
          <SkeletonPulse>
            <View style={styles.emailSkeleton} />
          </SkeletonPulse>
        </View>
      </View>

      {/* Secciones genéricas (Información personal, Tu perfil financiero, etc.) */}
      {[1, 2, 3].map((sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <SkeletonPulse>
            <View style={styles.sectionTitleSkeleton} />
          </SkeletonPulse>
          <SkeletonPulse>
            <View style={styles.sectionDescSkeleton} />
          </SkeletonPulse>

          {/* Rows */}
          {[1, 2, 3, 4].map((rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              <SkeletonPulse>
                <View style={styles.iconSkeleton} />
              </SkeletonPulse>
              <View style={styles.rowContent}>
                <SkeletonPulse>
                  <View style={styles.rowLabelSkeleton} />
                </SkeletonPulse>
                <SkeletonPulse>
                  <View style={styles.rowValueSkeleton} />
                </SkeletonPulse>
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
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
  titleSkeleton: {
    width: 150,
    height: 32,
    borderRadius: 8,
    backgroundColor: APP_THEME.card.border,
  },
  editBtnSkeleton: {
    width: 80,
    height: 36,
    borderRadius: 8,
    backgroundColor: APP_THEME.card.border,
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
  avatarSkeleton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: APP_THEME.card.border,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  nameSkeleton: {
    width: '70%',
    height: 20,
    borderRadius: 6,
    backgroundColor: APP_THEME.card.border,
  },
  emailSkeleton: {
    width: '50%',
    height: 14,
    borderRadius: 4,
    backgroundColor: APP_THEME.card.border,
  },
  section: {
    backgroundColor: APP_THEME.card.background,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitleSkeleton: {
    width: '40%',
    height: 20,
    borderRadius: 6,
    backgroundColor: APP_THEME.card.border,
    marginBottom: 8,
  },
  sectionDescSkeleton: {
    width: '80%',
    height: 14,
    borderRadius: 4,
    backgroundColor: APP_THEME.card.border,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: APP_THEME.card.border,
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
    paddingTop: 4,
  },
  rowLabelSkeleton: {
    width: '30%',
    height: 12,
    borderRadius: 4,
    backgroundColor: APP_THEME.card.border,
  },
  rowValueSkeleton: {
    width: '50%',
    height: 16,
    borderRadius: 4,
    backgroundColor: APP_THEME.card.border,
  },
});