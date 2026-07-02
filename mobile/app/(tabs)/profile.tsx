import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { clearSessions, computeProfileStats, loadSessions, type ProfileStats } from '@/src/lib/storage'
import { colors, spacing, typography } from '@/src/theme'

export default function ProfileScreen() {
  const [stats, setStats] = useState<ProfileStats>({
    totalSessions: 0,
    bestScore: 0,
    averageScore: 0,
    totalProblems: 0,
    averageAccuracy: 0,
    bestPpm: 0,
    lastPlayedAt: null,
  })

  const refresh = useCallback(() => {
    loadSessions().then((sessions) => setStats(computeProfileStats(sessions)))
  }, [])

  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [refresh])
  )

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
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.rankLabel}>LOCAL PROFILE</Text>
        <Text style={styles.bestScore}>{stats.bestScore}</Text>
        <Text style={styles.bestLabel}>personal best</Text>
      </View>

      <View style={styles.grid}>
        <StatTile label="Sessions" value={String(stats.totalSessions)} />
        <StatTile label="Avg score" value={String(stats.averageScore)} />
        <StatTile label="Accuracy" value={`${stats.averageAccuracy}%`} />
        <StatTile label="Best ppm" value={String(stats.bestPpm)} />
        <StatTile label="Problems" value={String(stats.totalProblems)} />
        <StatTile
          label="Last played"
          value={stats.lastPlayedAt ? new Date(stats.lastPlayedAt).toLocaleDateString() : '—'}
        />
      </View>

      <Pressable style={styles.clearButton} onPress={handleClear}>
        <Text style={styles.clearText}>Clear local data</Text>
      </Pressable>
    </View>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.md,
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
  clearButton: {
    marginTop: 'auto',
    padding: spacing.md,
    alignItems: 'center',
  },
  clearText: {
    color: colors.incorrect,
    fontWeight: '600',
  },
})
