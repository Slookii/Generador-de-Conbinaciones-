import { indexToCombination, combinationToIndex, TOTAL_COMBINATIONS } from './src/utils/combinatorics';

// Simple test suite
console.log("Testing Combinatorics Logic...");
console.log(`Total Combinations: ${TOTAL_COMBINATIONS}`);

const failures = [];

// Test 1: First Combination
const firstIdx = 0;
const firstComb = indexToCombination(firstIdx);
const firstRecalc = combinationToIndex(firstComb);
console.log(`[0] -> ${firstComb.join(',')} -> ${firstRecalc}`);
if (firstRecalc !== firstIdx) failures.push('First index mismatch');

// Test 2: Last Combination
const lastIdx = TOTAL_COMBINATIONS - 1;
const lastComb = indexToCombination(lastIdx);
const lastRecalc = combinationToIndex(lastComb);
console.log(`[${lastIdx}] -> ${lastComb.join(',')} -> ${lastRecalc}`);
if (lastRecalc !== lastIdx) failures.push('Last index mismatch');

// Test 3: Random Sampling
for (let i = 0; i < 10; i++) {
    const randIdx = Math.floor(Math.random() * TOTAL_COMBINATIONS);
    const c = indexToCombination(randIdx);
    const r = combinationToIndex(c);
    if (r !== randIdx) {
        console.error(`Mismatch: ${randIdx} -> ${c} -> ${r}`);
        failures.push(`Mismatch at ${randIdx}`);
    }
}

if (failures.length === 0) {
    console.log("✅ All tests passed!");
} else {
    console.error("❌ Validations failed:", failures);
    process.exit(1);
}
