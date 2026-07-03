import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { loadSessions, type SessionRecord } from '@/src/lib/storage'
import { colors, spacing, typography } from '@/src/theme'

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<SessionRecord[]>([])

  useFocusEffect(
    useCallback(() => {
      loadSessions().then(setSessions)
    }, [])
  )

  if (sessions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No sessions yet</Text>
        <Text style={styles.emptyText}>Complete a Zetamac Classic run to see your history here.</Text>
      </View>
    )
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={sessions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.mode}>{item.modeTitle}</Text>
              <Text style={styles.meta}>{new Date(item.completedAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.score}>{item.ppm}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detail}>{item.score} solved</Text>
            <Text style={styles.detail}>{item.duration}s</Text>
            <Text style={styles.detail}>{item.category}</Text>
          </View>
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mode: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  score: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: '800',
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  detail: {
    color: colors.textMuted,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: typography.caption,
    textTransform: 'capitalize',
  },
  empty: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
})
