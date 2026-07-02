import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, typography } from '@/src/theme'

export default function TrainScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🐵</Text>
        <Text style={styles.title}>MonkeyMac</Text>
        <Text style={styles.subtitle}>Zetamac-style mental math, built for your phone.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.modeLabel}>ZETAMAC CLASSIC</Text>
        <Text style={styles.modeDetail}>120 seconds · all four operations</Text>
        <Text style={styles.modeHint}>Weighted generation tuned to feel like real Zetamac.</Text>
      </View>

      <Pressable style={styles.startButton} onPress={() => router.push('/test')}>
        <Text style={styles.startText}>Start Race</Text>
      </Pressable>

      <Text style={styles.footer}>Scores saved locally on this device.</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  hero: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  modeLabel: {
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 2,
    fontSize: typography.caption,
  },
  modeDetail: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  modeHint: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 20,
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
    marginTop: spacing.md,
    fontSize: typography.caption,
  },
})
