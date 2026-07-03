import { useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { MODES, RANKED_MODE_IDS, TRAINING_MODE_IDS } from '@/src/lib/modes'
import {
  clearSessions,
  computeProfileStats,
  loadSessions,
  type ContributionDay,
  type ProfileStats,
  type TrendPoint,
} from '@/src/lib/storage'
import { colors, spacing, typography } from '@/src/theme'

export default function ProfileScreen() {
  const [stats, setStats] = useState<ProfileStats>(() => computeProfileStats([]))

  const refresh = useCallback(() => {
    loadSessions().then((sessions) => setStats(computeProfileStats(sessions)))
  }, [])

  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [refresh])
  )

  const trendDelta = useMemo(() => {
    if (stats.ppmTrend.length < 2) return 0
    const first = stats.ppmTrend[0]
    const last = stats.ppmTrend[stats.ppmTrend.length - 1]
    return Math.round((last.trendY - first.trendY) * 10) / 10
  }, [stats.ppmTrend])

  const handleClear = () => {
    Alert.alert('Clear all data?', 'This removes every saved session from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearSessions()
          refresh()
        },
      },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.rankLabel}>LOCAL PROFILE</Text>
        <Text style={styles.bestScore}>{stats.bestPpm}</Text>
        <Text style={styles.bestLabel}>best problems/min</Text>
      </View>

      <View style={styles.grid}>
        <StatTile label="Sessions" value={String(stats.totalSessions)} />
        <StatTile label="Avg score" value={String(stats.averageScore)} />
        <StatTile label="Problems" value={String(stats.totalProblems)} />
        <StatTile
          label="Last played"
          value={stats.lastPlayedAt ? new Date(stats.lastPlayedAt).toLocaleDateString() : '—'}
        />
      </View>

      <SectionTitle title="Mode Records" />
      <View style={styles.records}>
        {RANKED_MODE_IDS.map((id) => (
          <ModeRecord
            key={id}
            label={MODES[id].shortTitle}
            accent={MODES[id].accent}
            score={stats.bestByMode[id] ?? 0}
            ppm={stats.bestPpmByMode[id] ?? 0}
          />
        ))}
      </View>

      <SectionTitle title="Training Averages" />
      <View style={styles.records}>
        {TRAINING_MODE_IDS.map((id) => (
          <ModeRecord
            key={id}
            label={MODES[id].shortTitle}
            accent={MODES[id].accent}
            score={Math.round(stats.trainingAverageByMode[id] ?? 0)}
            ppm={stats.bestPpmByMode[id] ?? 0}
            scoreLabel="avg ppm"
          />
        ))}
      </View>

      <SectionTitle title="Activity" />
      <ContributionGraph days={stats.contributionDays} />

      <SectionTitle title="PPM Trend" />
      <TrendChart points={stats.ppmTrend} delta={trendDelta} />

      <Pressable style={styles.clearButton} onPress={handleClear}>
        <Text style={styles.clearText}>Clear local data</Text>
      </Pressable>
    </ScrollView>
  )
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  )
}

function ModeRecord({
  label,
  accent,
  score,
  ppm,
  scoreLabel = 'best',
}: {
  label: string
  accent: string
  score: number
  ppm: number
  scoreLabel?: string
}) {
  return (
    <View style={styles.record}>
      <View style={[styles.recordAccent, { backgroundColor: accent }]} />
      <View style={styles.recordCopy}>
        <Text style={styles.recordLabel}>{label}</Text>
        <Text style={styles.recordMeta}>{scoreLabel}</Text>
      </View>
      <View style={styles.recordNumbers}>
        <Text style={styles.recordScore}>{score}</Text>
        <Text style={styles.recordPpm}>{ppm} ppm</Text>
      </View>
    </View>
  )
}

function ContributionGraph({ days }: { days: ContributionDay[] }) {
  const max = Math.max(1, ...days.map((day) => day.count))
  return (
    <View style={styles.graphCard}>
      <View style={styles.contributionGrid}>
        {days.map((day) => {
          const level = day.count === 0 ? 0 : Math.ceil((day.count / max) * 4)
          return <View key={day.date} style={[styles.dayCell, contributionStyle(level)]} />
        })}
      </View>
      <Text style={styles.graphCaption}>Last 6 weeks · darker means more sessions</Text>
    </View>
  )
}

function contributionStyle(level: number) {
  switch (level) {
    case 1:
      return { backgroundColor: '#2f3f2f' }
    case 2:
      return { backgroundColor: '#3f6f3f' }
    case 3:
      return { backgroundColor: '#55a85e' }
    case 4:
      return { backgroundColor: colors.correct }
    default:
      return { backgroundColor: colors.surfaceAlt }
  }
}

function TrendChart({ points, delta }: { points: TrendPoint[]; delta: number }) {
  const recent = points.slice(-18)
  const max = Math.max(1, ...recent.map((point) => point.y), ...recent.map((point) => point.trendY))
  const min = Math.min(0, ...recent.map((point) => point.y), ...recent.map((point) => point.trendY))
  const range = Math.max(1, max - min)

  return (
    <View style={styles.graphCard}>
      {recent.length === 0 ? (
        <Text style={styles.emptyChart}>Run a test to start tracking PPM.</Text>
      ) : (
        <>
          <View style={styles.scatter}>
            {recent.map((point, index) => {
              const height = 120
              const y = height - ((point.y - min) / range) * height
              const trendY = height - ((point.trendY - min) / range) * height
              return (
                <View key={`${point.x}-${index}`} style={styles.scatterColumn}>
                  <View style={[styles.trendDot, { bottom: Math.max(0, 120 - trendY) }]} />
                  <View style={[styles.dot, { bottom: Math.max(0, 120 - y) }]} />
                </View>
              )
            })}
          </View>
          <Text style={styles.graphCaption}>
            Trend {delta >= 0 ? '+' : ''}
            {delta} ppm across recent ranked runs
          </Text>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankLabel: {
    color: colors.textMuted,
    letterSpacing: 2,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  bestScore: {
    color: colors.accent,
    fontSize: typography.hero,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  bestLabel: {
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  tileLabel: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontSize: typography.caption,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  records: {
    gap: spacing.sm,
  },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 999,
    marginRight: spacing.md,
  },
  recordCopy: { flex: 1 },
  recordLabel: { color: colors.text, fontWeight: '800', fontSize: 16 },
  recordMeta: { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.xs },
  recordNumbers: { alignItems: 'flex-end' },
  recordScore: { color: colors.accent, fontWeight: '900', fontSize: 22 },
  recordPpm: { color: colors.textMuted, fontSize: typography.caption },
  graphCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contributionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  dayCell: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  graphCaption: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.sm,
  },
  scatter: {
    height: 132,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    paddingVertical: spacing.sm,
  },
  scatterColumn: {
    flex: 1,
    height: 120,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignSelf: 'center',
  },
  trendDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.correct,
    opacity: 0.7,
    alignSelf: 'center',
  },
  emptyChart: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  clearButton: {
    marginTop: spacing.xl,
    padding: spacing.md,
    alignItems: 'center',
  },
  clearText: {
    color: colors.incorrect,
    fontWeight: '600',
  },
})
