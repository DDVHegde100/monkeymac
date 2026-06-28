/**
 * Run with: node scripts/validate-problems.mjs
 * Lightweight validation for difficulty generation bounds.
 */

const ZETAMAC_RANGES = {
  addition: { min: 2, max: 100 },
  subtraction: { min: 2, max: 100 },
  multiplication: { min: 2, max: 12 },
  division: { min: 2, max: 12 },
}

const PRESETS = {
  easy: {
    ranges: {
      addition: { min: 1, max: 20 },
      subtraction: { min: 1, max: 20 },
      multiplication: { min: 1, max: 5 },
      division: { min: 1, max: 25 },
    },
    divisionStyle: 'quotient-first',
  },
  classic: { ranges: ZETAMAC_RANGES, divisionStyle: 'reverse-multiply' },
  medium: { ranges: ZETAMAC_RANGES, divisionStyle: 'reverse-multiply' },
  custom: { ranges: ZETAMAC_RANGES, divisionStyle: 'reverse-multiply' },
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateDivision(range, style) {
  if (style === 'reverse-multiply') {
    const a = randomInt(range.min, range.max)
    const b = randomInt(range.min, range.max)
    const dividend = a * b
    return Math.random() < 0.5
      ? { operand1: dividend, operand2: a, answer: b }
      : { operand1: dividend, operand2: b, answer: a }
  }
  const quotient = randomInt(range.min, range.max)
  const divisor = randomInt(range.min, range.max)
  return { operand1: quotient * divisor, operand2: divisor, answer: quotient }
}

function generateProblem(preset) {
  const ops = ['addition', 'subtraction', 'multiplication', 'division']
  const operation = ops[Math.floor(Math.random() * ops.length)]
  const range = preset.ranges[operation]

  switch (operation) {
    case 'addition': {
      const a = randomInt(range.min, range.max)
      const b = randomInt(range.min, range.max)
      return { operation, operand1: a, operand2: b, answer: a + b }
    }
    case 'subtraction': {
      const a = randomInt(range.min, range.max)
      const b = randomInt(range.min, a)
      return { operation, operand1: a, operand2: b, answer: a - b }
    }
    case 'multiplication': {
      const a = randomInt(range.min, range.max)
      const b = randomInt(range.min, range.max)
      return { operation, operand1: a, operand2: b, answer: a * b }
    }
    default:
      return { operation: 'division', ...generateDivision(range, preset.divisionStyle) }
  }
}

function validate(problem, preset) {
  const range = preset.ranges[problem.operation] || preset.ranges.division
  if (problem.operation === 'division') {
    return (
      problem.operand1 === problem.operand2 * problem.answer &&
      problem.operand2 >= range.min &&
      problem.operand2 <= range.max &&
      problem.answer >= range.min &&
      problem.answer <= range.max
    )
  }
  return (
    problem.operand1 >= range.min &&
    problem.operand1 <= range.max &&
    problem.operand2 >= range.min &&
    problem.operand2 <= range.max
  )
}

let totalFailures = 0

for (const [name, preset] of Object.entries(PRESETS)) {
  let failures = 0
  for (let i = 0; i < 300; i += 1) {
    const problem = generateProblem(preset)
    if (!validate(problem, preset)) failures += 1
  }
  totalFailures += failures
  console.log(`${name}: ${failures === 0 ? 'PASS' : `FAIL (${failures}/300)`}`)
}

if (totalFailures > 0) process.exit(1)
console.log('All gamemode validations passed')
