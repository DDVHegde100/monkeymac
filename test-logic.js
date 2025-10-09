// Test the math problem generation and scoring logic
// This simulates the core functionality without the UI

// Test problem generation for different difficulties
function testProblemGeneration() {
  console.log('🧪 Testing Problem Generation...')
  
  const difficulties = {
    easy: {
      addition: { min: 1, max: 20 },
      subtraction: { min: 1, max: 20 },
      multiplication: { min: 1, max: 5 },
      division: { min: 1, max: 25 }
    },
    medium: {
      addition: { min: 1, max: 99 },
      subtraction: { min: 1, max: 99 },
      multiplication: { min: 1, max: 12 },
      division: { min: 1, max: 144 }
    },
    hard: {
      addition: { min: 10, max: 999 },
      subtraction: { min: 10, max: 999 },
      multiplication: { min: 1, max: 25 },
      division: { min: 1, max: 625 }
    }
  }
  
  for (const [diffName, ranges] of Object.entries(difficulties)) {
    console.log(`\n📊 ${diffName.toUpperCase()} difficulty:`)
    
    // Test addition
    const addRange = ranges.addition
    const addOperand1 = Math.floor(Math.random() * (addRange.max - addRange.min + 1)) + addRange.min
    const addOperand2 = Math.floor(Math.random() * (addRange.max - addRange.min + 1)) + addRange.min
    console.log(`Addition: ${addOperand1} + ${addOperand2} = ${addOperand1 + addOperand2}`)
    
    // Test multiplication  
    const multRange = ranges.multiplication
    const multOperand1 = Math.floor(Math.random() * (multRange.max - multRange.min + 1)) + multRange.min
    const multOperand2 = Math.floor(Math.random() * (multRange.max - multRange.min + 1)) + multRange.min
    console.log(`Multiplication: ${multOperand1} × ${multOperand2} = ${multOperand1 * multOperand2}`)
  }
}

// Test answer validation logic
function testAnswerValidation() {
  console.log('\n🧪 Testing Answer Validation...')
  
  const testCases = [
    { problem: { operand1: 12, operand2: 8, operation: 'addition', answer: 20 }, userInput: '20', expected: true },
    { problem: { operand1: 12, operand2: 8, operation: 'addition', answer: 20 }, userInput: '19', expected: false },
    { problem: { operand1: 12, operand2: 8, operation: 'addition', answer: 20 }, userInput: '  20  ', expected: true },
    { problem: { operand1: 15, operand2: 7, operation: 'subtraction', answer: 8 }, userInput: '8', expected: true },
    { problem: { operand1: 6, operand2: 4, operation: 'multiplication', answer: 24 }, userInput: '24', expected: true },
    { problem: { operand1: 48, operand2: 6, operation: 'division', answer: 8 }, userInput: '8', expected: true },
  ]
  
  testCases.forEach((testCase, index) => {
    const userAnswer = parseInt(testCase.userInput.trim())
    const isCorrect = !isNaN(userAnswer) && userAnswer === testCase.problem.answer
    const passed = isCorrect === testCase.expected
    
    console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`  Problem: ${testCase.problem.operand1} ${getOperationSymbol(testCase.problem.operation)} ${testCase.problem.operand2} = ?`)
    console.log(`  User Input: "${testCase.userInput}" → ${userAnswer}`)
    console.log(`  Expected: ${testCase.expected ? 'correct' : 'incorrect'}, Got: ${isCorrect ? 'correct' : 'incorrect'}`)
    
    if (!passed) {
      console.log(`  ❌ FAILED: Expected ${testCase.expected}, got ${isCorrect}`)
    }
  })
}

function getOperationSymbol(operation) {
  switch (operation) {
    case 'addition': return '+'
    case 'subtraction': return '−'
    case 'multiplication': return '×'
    case 'division': return '÷'
    default: return '?'
  }
}

// Test scoring logic
function testScoringLogic() {
  console.log('\n🧪 Testing Scoring Logic...')
  
  const testSession = []
  
  // Simulate a series of problems and answers
  const sessionData = [
    { correct: true, answer: '20' },
    { correct: false, answer: '19' },
    { correct: true, answer: '15' },
    { correct: true, answer: '42' },
    { correct: false, answer: '10' },
    { correct: true, answer: '8' },
  ]
  
  sessionData.forEach((item, index) => {
    testSession.push({
      id: index,
      userAnswer: item.answer,
      isCorrect: item.correct,
      timeSpent: 2000 + Math.random() * 3000
    })
  })
  
  const correctAnswers = testSession.filter(p => p.isCorrect).length
  const totalProblems = testSession.length
  const accuracy = (correctAnswers / totalProblems) * 100
  
  console.log(`Total Problems: ${totalProblems}`)
  console.log(`Correct Answers: ${correctAnswers}`)
  console.log(`Accuracy: ${accuracy.toFixed(1)}%`)
  console.log(`Expected Score: 4 (should match correctAnswers)`)
  console.log(`Test Result: ${correctAnswers === 4 ? '✅ PASS' : '❌ FAIL'}`)
}

// Run all tests
console.log('🚀 Running MonkeyMac Functionality Tests...\n')
testProblemGeneration()
testAnswerValidation()
testScoringLogic()
console.log('\n✅ All tests completed!')
