import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { DURATIONS, MODES, RANKED_MODE_IDS, TRAINING_MODE_IDS, type ModeDefinition, type TestDuration } from '@/src/lib/modes'
import { colors, spacing, typography } from '@/src/theme'

export default function TrainScreen() {
  const [duration, setDuration] = useState<TestDuration>(120)

  const start = (mode: ModeDefinition) => {
    router.push({
      pathname: '/test',
      params: {
        mode: mode.id,
        duration: String(mode.id === 'classic' ? 120 : duration),
      },
    })
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>MM</Text>
          </View>
          <Text style={styles.title}>MonkeyMac</Text>
          <Text style={styles.subtitle}>Fast arithmetic drills with real Zetamac ranges.</Text>
        </View>

        <View style={styles.durationCard}>
          <Text style={styles.sectionLabel}>Duration</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((option) => (
              <Pressable
                key={option}
                style={[styles.durationChip, duration === option && styles.durationChipActive]}
                onPress={() => setDuration(option)}
              >
                <Text style={[styles.durationText, duration === option && styles.durationTextActive]}>
                  {option}s
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.durationHint}>Classic always uses 120s. Other modes use your selected time.</Text>
        </View>

        <Text style={styles.sectionLabel}>Ranked Modes</Text>
        {RANKED_MODE_IDS.map((id) => (
          <ModeCard key={id} mode={MODES[id]} onPress={() => start(MODES[id])} />
        ))}

        <Text style={styles.sectionLabel}>Operation Training</Text>
        <View style={styles.trainingGrid}>
          {TRAINING_MODE_IDS.map((id) => (
            <TrainingCard key={id} mode={MODES[id]} onPress={() => start(MODES[id])} />
          ))}
        </View>

        <Text style={styles.footer}>Scores are saved locally and separated by mode.</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

function ModeCard({ mode, onPress }: { mode: ModeDefinition; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.iconCircle, { borderColor: mode.accent }]}>
        <Text style={[styles.iconText, { color: mode.accent }]}>{iconForMode(mode.id)}</Text>
      </View>
      <View style={styles.modeCopy}>
        <Text style={styles.modeLabel}>{mode.title}</Text>
        <Text style={styles.modeDetail}>{mode.detail}</Text>
        <Text style={styles.modeHint}>{mode.description}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  )
}

function TrainingCard({ mode, onPress }: { mode: ModeDefinition; onPress: () => void }) {
  return (
    <Pressable style={styles.trainingCard} onPress={onPress}>
      <Text style={[styles.trainingIcon, { color: mode.accent }]}>{iconForMode(mode.id)}</Text>
      <Text style={styles.trainingTitle}>{mode.shortTitle}</Text>
      <Text style={styles.trainingDetail}>{mode.detail}</Text>
    </Pressable>
  )
}

function iconForMode(modeId: string): string {
  if (modeId.includes('addition')) return '+'
  if (modeId.includes('subtraction')) return '−'
  if (modeId.includes('multiplication')) return '×'
  if (modeId.includes('division')) return '÷'
  if (modeId === 'classic') return '∑'
  if (modeId === 'hard') return '↗'
  if (modeId === 'medium') return '≈'
  return '•'
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  hero: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoText: { color: colors.accent, fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  title: {
    color: colors.accent,
    fontSize: typography.title,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  durationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontSize: typography.caption,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  durationRow: { flexDirection: 'row', gap: spacing.sm },
  durationChip: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  durationChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  durationText: { color: colors.textMuted, fontWeight: '800' },
  durationTextActive: { color: '#111' },
  durationHint: { color: colors.textMuted, marginTop: spacing.sm, fontSize: typography.caption },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: { fontSize: 24, fontWeight: '900' },
  modeCopy: {
    flex: 1,
  },
  modeLabel: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 17,
  },
  modeDetail: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  modeHint: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  chevron: { color: colors.textMuted, fontSize: 26, marginLeft: spacing.sm },
  trainingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  trainingCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trainingIcon: { fontSize: 26, fontWeight: '900', marginBottom: spacing.sm },
  trainingTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  trainingDetail: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontSize: typography.caption,
  },
  startButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 'auto',
  },
  startText: {
    color: '#111',
    fontSize: 18,
    fontWeight: '800',
  },
  footer: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: typography.caption,
  },
})
