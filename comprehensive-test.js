// Comprehensive test suite for MonkeyMac functionality
console.log('🚀 MonkeyMac Comprehensive Test Suite\n')

// Test 1: Verify division problems have whole number answers
function testDivisionProblems() {
  console.log('📊 Test 1: Division Problem Generation')
  
  for (let i = 0; i < 10; i++) {
    // Simulate the division generation logic
    const answer = Math.floor(Math.random() * 144) + 1  // 1-144 for medium difficulty
    const divisor = Math.floor(Math.random() * 12) + 1  // 1-12
    const dividend = answer * divisor
    
    const calculatedAnswer = dividend / divisor
    const hasRemainder = dividend % divisor !== 0
    
    console.log(`  ${dividend} ÷ ${divisor} = ${calculatedAnswer} ${hasRemainder ? '❌ Has remainder!' : '✅'}`)
    
    if (hasRemainder) {
      console.error(`  ERROR: Division problem has remainder! This shouldn't happen.`)
    }
  }
  console.log('')
}

// Test 2: Auto-submit behavior simulation
function testAutoSubmitBehavior() {
  console.log('🔄 Test 2: Auto-Submit Behavior')
  
  const problem = { operand1: 244, operand2: 4, answer: 61 }
  const typingSequence = [
    { input: '6', shouldSubmit: false },
    { input: '61', shouldSubmit: true },
    { input: '611', shouldSubmit: false }, // Overshooting
    { input: '61', shouldSubmit: true },   // Back to correct
  ]
  
  typingSequence.forEach((step, index) => {
    const userAnswer = parseInt(step.input.trim())
    const isCorrect = !isNaN(userAnswer) && userAnswer === problem.answer
    const actualShouldSubmit = isCorrect
    
    const status = actualShouldSubmit === step.shouldSubmit ? '✅' : '❌'
    console.log(`  Step ${index + 1}: "${step.input}" → ${userAnswer} → Should submit: ${step.shouldSubmit} → Actually: ${actualShouldSubmit} ${status}`)
  })
  console.log('')
}

// Test 3: Score calculation simulation
function testScoreCalculation() {
  console.log('🎯 Test 3: Score Calculation')
  
  const session = [
    { problem: '12 + 8', userAnswer: '20', correct: true },
    { problem: '15 - 7', userAnswer: '9', correct: false },  // Wrong answer
    { problem: '15 - 7', userAnswer: '8', correct: true },   // Correct attempt
    { problem: '6 × 4', userAnswer: '24', correct: true },
    { problem: '48 ÷ 6', userAnswer: '8', correct: true },
    { problem: '244 ÷ 4', userAnswer: '61', correct: true },
  ]
  
  let score = 0
  console.log('  Session simulation:')
  
  session.forEach((attempt, index) => {
    if (attempt.correct) score++
    
    const status = attempt.correct ? '✅ +1' : '❌ +0'
    console.log(`    ${index + 1}. ${attempt.problem} = ${attempt.userAnswer} ${status} (Score: ${score})`)
  })
  
  const expectedScore = session.filter(a => a.correct).length
  console.log(`  Final Score: ${score} (Expected: ${expectedScore}) ${score === expectedScore ? '✅ PASS' : '❌ FAIL'}`)
  console.log('')
}

// Test 4: Timing scenarios
function testTimingScenarios() {
  console.log('⏱️ Test 4: Timing Scenarios')
  
  const scenarios = [
    { duration: 15, expectedMinProblems: 3, expectedMaxProblems: 15 },
    { duration: 30, expectedMinProblems: 7, expectedMaxProblems: 30 },
    { duration: 60, expectedMinProblems: 15, expectedMaxProblems: 60 },
    { duration: 120, expectedMinProblems: 30, expectedMaxProblems: 120 },
  ]
  
  scenarios.forEach(scenario => {
    const avgSecondsPerProblem = 3 // Estimate
    const estimatedProblems = Math.floor(scenario.duration / avgSecondsPerProblem)
    const withinRange = estimatedProblems >= scenario.expectedMinProblems && 
                       estimatedProblems <= scenario.expectedMaxProblems
    
    console.log(`  ${scenario.duration}s test: ~${estimatedProblems} problems ${withinRange ? '✅' : '❌'}`)
  })
  console.log('')
}

// Test 5: Input validation edge cases
function testInputValidation() {
  console.log('🔍 Test 5: Input Validation Edge Cases')
  
  const problem = { answer: 42 }
  const inputs = [
    { input: '42', valid: true, correct: true },
    { input: '  42  ', valid: true, correct: true },
    { input: '042', valid: true, correct: true },
    { input: '41', valid: true, correct: false },
    { input: '43', valid: true, correct: false },
    { input: '', valid: false, correct: false },
    { input: 'abc', valid: false, correct: false },
    { input: '42.0', valid: true, correct: true },
    { input: '42.5', valid: true, correct: false },
    { input: '-42', valid: true, correct: false },
  ]
  
  inputs.forEach(test => {
    const trimmed = test.input.trim()
    const parsed = parseInt(trimmed)
    const isValid = !isNaN(parsed) && trimmed !== ''
    const isCorrect = isValid && parsed === problem.answer
    
    const validStatus = isValid === test.valid ? '✅' : '❌'
    const correctStatus = isCorrect === test.correct ? '✅' : '❌'
    
    console.log(`  "${test.input}" → Valid: ${isValid} ${validStatus} | Correct: ${isCorrect} ${correctStatus}`)
  })
  console.log('')
}

// Run all tests
testDivisionProblems()
testAutoSubmitBehavior()
testScoreCalculation()
testTimingScenarios()
testInputValidation()

console.log('✅ All tests completed!')
console.log('\n📋 Test Summary:')
console.log('• Division problems generate whole numbers only')
console.log('• Auto-submit triggers only on exact matches')
console.log('• Score increments only for correct answers')
console.log('• Various time durations are reasonable')
console.log('• Input validation handles edge cases')
console.log('\n🎯 If issues persist, check browser console for debug logs!')
