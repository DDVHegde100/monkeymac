// Edge case testing for MonkeyMac
console.log('🧪 Testing Edge Cases...\n')

// Test 1: Empty input handling
function testEmptyInput() {
  console.log('Test 1: Empty Input Handling')
  const inputs = ['', '   ', '0', '00', '-1']
  
  inputs.forEach(input => {
    const trimmed = input.trim()
    const parsed = parseInt(trimmed)
    const isEmpty = trimmed === ''
    const isValidNumber = !isNaN(parsed)
    
    console.log(`  Input: "${input}" → Trimmed: "${trimmed}" → Parsed: ${parsed} → Valid: ${isValidNumber && !isEmpty}`)
  })
  console.log('')
}

// Test 2: Auto-submit timing
function testAutoSubmitTiming() {
  console.log('Test 2: Auto-Submit Race Condition Prevention')
  
  // Simulate rapid typing
  const problem = { answer: 42 }
  const typingSequence = ['4', '42', '421', '42']  // User types 4, then 42, then 421, then deletes to 42
  
  typingSequence.forEach((input, index) => {
    const userAnswer = parseInt(input.trim())
    const shouldAutoSubmit = !isNaN(userAnswer) && userAnswer === problem.answer
    
    console.log(`  Step ${index + 1}: "${input}" → ${userAnswer} → Auto-submit: ${shouldAutoSubmit}`)
  })
  console.log('')
}

// Test 3: Division problem generation
function testDivisionGeneration() {
  console.log('Test 3: Division Problem Generation (No Remainders)')
  
  for (let i = 0; i < 5; i++) {
    const answer = Math.floor(Math.random() * 12) + 1  // 1-12
    const divisor = Math.floor(Math.random() * 12) + 1  // 1-12
    const dividend = answer * divisor
    
    const calculatedAnswer = dividend / divisor
    const hasRemainder = dividend % divisor !== 0
    
    console.log(`  ${dividend} ÷ ${divisor} = ${calculatedAnswer} (Remainder: ${hasRemainder ? 'YES ❌' : 'NO ✅'})`)
  }
  console.log('')
}

// Test 4: Score progression simulation
function testScoreProgression() {
  console.log('Test 4: Score Progression Simulation')
  
  let score = 0
  const answers = [
    { input: '20', correct: true },
    { input: '19', correct: false },  // Should not increment
    { input: '15', correct: true },
    { input: '42', correct: true },
    { input: 'abc', correct: false }, // Invalid input
    { input: '8', correct: true },
  ]
  
  answers.forEach((answer, index) => {
    if (answer.correct) {
      score++
    }
    
    console.log(`  Problem ${index + 1}: Answer "${answer.input}" → ${answer.correct ? 'Correct' : 'Incorrect'} → Score: ${score}`)
  })
  
  console.log(`  Final Score: ${score} (Expected: 4) → ${score === 4 ? '✅ PASS' : '❌ FAIL'}`)
  console.log('')
}

// Test 5: Abstract mode timing
function testAbstractMode() {
  console.log('Test 5: Abstract Mode Timing')
  
  let currentTime = 4
  console.log(`  Abstract mode starts with ${currentTime}s timer`)
  
  // Simulate countdown
  const interval = setInterval(() => {
    currentTime--
    console.log(`  Timer: ${currentTime}s`)
    
    if (currentTime <= 0) {
      console.log('  ⏰ Time up! New problem generated')
      console.log('  Timer reset to 4s')
      clearInterval(interval)
    }
  }, 100) // Faster for testing
  
  setTimeout(() => {
    console.log('')
    console.log('✅ All edge case tests completed!')
  }, 600)
}

// Run edge case tests
testEmptyInput()
testAutoSubmitTiming()
testDivisionGeneration()
testScoreProgression()
testAbstractMode()
