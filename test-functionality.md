# MonkeyMac Functionality Test Cases

## Test Environment
- Local development server: http://localhost:3003
- Test Date: October 9, 2025

## Test Case 1: Auto-Submit with Correct Answers
**Expected Behavior:** 
- User types correct answer
- Problem automatically advances to next
- Score increments by 1
- Input field clears
- New problem appears

**Test Steps:**
1. Start test with default settings (medium difficulty, 2 minutes)
2. Type correct answer for first problem
3. Verify auto-advance happens
4. Verify score shows 1
5. Verify new problem appears
6. Repeat for 5 more problems

**Expected Results:**
- Score should be 6 after 6 correct answers
- Should be on 7th problem
- All previous problems should show as correct (green dots)

## Test Case 2: Incorrect Answers Don't Advance
**Expected Behavior:**
- User types incorrect answer
- Problem stays the same
- Score doesn't increment
- Input field clears
- Same problem remains

**Test Steps:**
1. Start new test
2. Type incorrect answer for first problem
3. Verify problem doesn't advance
4. Verify score stays 0
5. Type correct answer
6. Verify problem advances and score increments

## Test Case 3: Manual Submit (Enter Key)
**Expected Behavior:**
- Works same as auto-submit
- Correct answers advance, incorrect don't

**Test Steps:**
1. Start test with auto-advance OFF
2. Type correct answer and press Enter
3. Verify advancement and score increment
4. Type incorrect answer and press Enter
5. Verify no advancement, no score change

## Test Case 4: Different Difficulty Modes
**Expected Behavior:**
- Easy: Small numbers (1-20 for addition/subtraction)
- Medium: Standard ZetaMac ranges
- Hard: Large numbers 
- Abstract: Hard problems with 4-second timer

**Test Steps:**
1. Test each difficulty mode
2. Verify number ranges are appropriate
3. For abstract mode, verify timer countdown appears
4. For abstract mode, verify problem changes after 4 seconds

## Test Case 5: Time Selection
**Expected Behavior:**
- 15s, 30s, 1m, 2m options work
- Timer counts down correctly
- Test ends when time reaches 0

## Test Case 6: Theme and Font Persistence
**Expected Behavior:**
- Logged-in users: preferences load from database
- Guest users: preferences load from localStorage
- Theme colors apply correctly
- Font family applies correctly

## Test Case 7: Score Calculation
**Expected Behavior:**
- Only correct answers count toward score
- Incorrect attempts don't affect score
- Final results show accurate statistics

---

## Manual Testing Results

### Test Case 1: ✅ PASS / ❌ FAIL
Notes: 

### Test Case 2: ✅ PASS / ❌ FAIL  
Notes:

### Test Case 3: ✅ PASS / ❌ FAIL
Notes:

### Test Case 4: ✅ PASS / ❌ FAIL
Notes:

### Test Case 5: ✅ PASS / ❌ FAIL
Notes:

### Test Case 6: ✅ PASS / ❌ FAIL
Notes:

### Test Case 7: ✅ PASS / ❌ FAIL
Notes:

---

## Issues Found
1. 
2. 
3. 

## Fixes Applied
1. 
2. 
3. 
