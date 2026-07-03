import * as Haptics from 'expo-haptics'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  generateProblem,
  getOperationSymbol,
  type GeneratedProblem,
} from '@/src/lib/problemGenerator'
import { getMode, normalizeDuration } from '@/src/lib/modes'
import {
  createProblemHistory,
  recordProblemHistory,
  type ProblemHistory,
} from '@/src/lib/zetamacEngine'
import { saveSession } from '@/src/lib/storage'
import { colors, spacing, typography } from '@/src/theme'

export default function TestScreen() {
  const params = useLocalSearchParams<{ mode?: string; duration?: string }>()
  const mode = getMode(params.mode)
  const duration = normalizeDuration(params.duration, mode.defaultDuration)
  const [timeLeft, setTimeLeft] = useState<number>(duration)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [input, setInput] = useState('')
  const [current, setCurrent] = useState<GeneratedProblem | null>(null)
  const [finished, setFinished] = useState(false)
  const historyRef = useRef<ProblemHistory>(createProblemHistory())
  const inputRef = useRef<TextInput>(null)

  const nextProblem = useCallback(() => {
    const problem = generateProblem({
      operations: mode.operations,
      ranges: mode.ranges,
      divisionStyle: mode.divisionStyle,
      zetamacWeighted: mode.zetamacWeighted,
      history: historyRef.current,
    })
    recordProblemHistory(historyRef.current, problem)
    setCurrent(problem)
    setInput('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [mode])

  const finish = useCallback(async () => {
    if (finished) return
    setFinished(true)
    const ppm = Math.round((score / duration) * 60)
    await saveSession({
      id: `${Date.now()}`,
      modeId: mode.id,
      modeTitle: mode.title,
      category: mode.category,
      score,
      totalProblems: attempts,
      correctAnswers: score,
      duration,
      ppm,
      completedAt: new Date().toISOString(),
    })
  }, [attempts, duration, finished, mode, score])

  useEffect(() => {
    historyRef.current = createProblemHistory()
    setTimeLeft(duration)
    setScore(0)
    setAttempts(0)
    setFinished(false)
    nextProblem()
  }, [duration, nextProblem])

  const restart = useCallback(() => {
    historyRef.current = createProblemHistory()
    setTimeLeft(duration)
    setScore(0)
    setAttempts(0)
    setInput('')
    setFinished(false)
    nextProblem()
  }, [duration, nextProblem])

  useEffect(() => {
    if (finished) return
    if (timeLeft <= 0) {
      finish()
      return
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, finished, finish])

  const handleChange = (value: string) => {
    const cleaned = value.replace(/[^0-9-]/g, '')
    setInput(cleaned)
    if (!current || finished) return
    const parsed = parseInt(cleaned, 10)
    if (!Number.isNaN(parsed) && parsed === current.answer) {
      setScore((s) => s + 1)
      setAttempts((a) => a + 1)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      nextProblem()
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, '0')

  if (finished) {
    const ppm = Math.round((score / duration) * 60)
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.results}>
          <Text style={styles.doneLabel}>Time&apos;s up</Text>
          <Text style={styles.resultMode}>{mode.title}</Text>
          <Text style={styles.finalScore}>{score}</Text>
          <Text style={styles.resultsMeta}>
            {ppm} problems/min · {duration}s
          </Text>
          <Pressable style={styles.primaryBtn} onPress={restart}>
            <Text style={styles.primaryBtnText}>Run again</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
            <Text style={styles.secondaryBtnText}>Back home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>← Exit</Text>
          </Pressable>
          <View style={styles.centerMeta}>
            <Text style={styles.modeName}>{mode.shortTitle}</Text>
            <Text style={[styles.timer, timeLeft <= 10 && styles.timerUrgent]}>
              {minutes}:{seconds}
            </Text>
          </View>
          <Text style={[styles.score, { color: mode.accent }]}>{score}</Text>
        </View>

        <View style={styles.stage}>
          {current && (
            <Text style={styles.problem}>
              {current.operand1} {getOperationSymbol(current.operation)} {current.operand2} = ?
            </Text>
          )}
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={handleChange}
            keyboardType="number-pad"
            inputMode="numeric"
            autoFocus
            caretHidden={false}
            placeholder="answer"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  back: { color: colors.textMuted, fontSize: typography.body },
  timer: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timerUrgent: { color: colors.incorrect },
  centerMeta: { alignItems: 'center' },
  modeName: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  score: { color: colors.correct, fontSize: 24, fontWeight: '800', minWidth: 40, textAlign: 'right' },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  problem: {
    color: colors.text,
    fontSize: typography.problem,
    fontWeight: '700',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  input: {
    color: colors.accent,
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
    minWidth: 200,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  results: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  doneLabel: { color: colors.textMuted, fontSize: typography.body },
  resultMode: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  finalScore: {
    color: colors.accent,
    fontSize: 72,
    fontWeight: '900',
    marginVertical: spacing.md,
  },
  resultsMeta: { color: colors.textMuted, marginBottom: spacing.xl },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: spacing.sm,
  },
  primaryBtnText: { color: '#111', fontWeight: '800', fontSize: 16 },
  secondaryBtn: { padding: spacing.md },
  secondaryBtnText: { color: colors.textMuted },
})
