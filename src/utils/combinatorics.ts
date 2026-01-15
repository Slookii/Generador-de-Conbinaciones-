// combinatorics.ts

// N = 46, K = 6
// Total combinations: 9,366,819
// We use the combinatorial number system to map an index I < binom(46,6)
// to a unique combination {c1, c2, c3, c4, c5, c6}.
// 
// We want the combinations to be lexicographically ordered.
// The standard dual representation (where c_k > ... > c_1) is often used.
// However, specific lotteries often sort as c1 < c2 < ... < c6.
// Let's stick to the standard algorithm for "Algorithm L" or similar, 
// but since we just need A mapping, the "Combinatorial Number System" is best.
// 
// Index = binom(c_6, 6) + binom(c_5, 5) + ... + binom(c_1, 1)
// where c_6 > c_5 > ... > c_1 >= 0.
// This indexes 0 to binom(N, K) - 1.

const N = 46;
const K = 6;
export const TOTAL_COMBINATIONS = 9366819; // binom(46, 6)

// Precompute binomial coefficients for speed
const BINOM: number[][] = [];

function initBinomials() {
    for (let i = 0; i <= N; i++) {
        BINOM[i] = [];
        BINOM[i][0] = 1;
        for (let j = 1; j <= K && j <= i; j++) {
            if (j === i) {
                BINOM[i][j] = 1;
            } else {
                // Pascal's triangle
                BINOM[i][j] = (BINOM[i - 1][j - 1] || 0) + (BINOM[i - 1][j] || 0);
            }
        }
    }
}

initBinomials();

function getBinom(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    return BINOM[n][k];
}

/**
 * Maps an integer index [0, TOTAL - 1] to a combination [c1, c2, c3, c4, c5, c6]
 * where 0 <= c1 < c2 < ... < c6 < 46.
 * 
 * NOTE: The standard Combinatorial Number System produces c_k > ... > c_1.
 * We will return them sorted ascendingly for familiar reading (00-05 rather than 05-00).
 */
export function indexToCombination(index: number): number[] {
    let remainder = index;
    const result: number[] = [];

    // We find c_k such that binom(c_k, k) <= remainder
    // Iterate from N-1 down to k-1
    let candidate = N - 1;

    for (let k = K; k > 0; k--) {
        while (getBinom(candidate, k) > remainder) {
            candidate--;
        }
        // Found the largest candidate
        result.push(candidate);
        remainder -= getBinom(candidate, k);
        candidate--; // Next candidate must be strictly less
    }

    // The result here is descending: c_6 > c_5 > ... > c_1
    // We want to verify format.
    // Standard lottery: 00 01 02 03 04 05
    // Let's just reverse it.
    return result.reverse();
}

/**
 * Inverse operation.
 * combination must be sorted ascending: c1 < c2 < ... < c6
 */
export function combinationToIndex(combination: number[]): number {
    // We need c_6 > ... > c_1
    // So we take the input (ascending) and process it from end to start, or reverse it.
    // Formula: Sum_{i=1 to k} binom(c_i, i)
    // where c values are the 0-based integers.

    let index = 0;
    // combination is [c1, c2, c3, c4, c5, c6] e.g. [0, 1, 2, 3, 4, 5]
    // In the formula, we need the standard strictly decreasing sequence.
    // Let's sort just in case, though input should be valid.
    const sorted = [...combination].sort((a, b) => a - b);

    for (let i = 0; i < K; i++) {
        // i=0 -> k=1 (c1)
        // ...
        // i=5 -> k=6 (c6)
        // The formula relies on c_i matching the `choose i` part.
        // Index = binom(c6, 6) + binom(c5, 5) ...

        // In our loop i goes 0..5, we want k goes 1..6
        const k = i + 1;
        const val = sorted[i]; // c_1 is at index 0
        index += getBinom(val, k);
    }

    return index;
}

// 3D Mapping Helpers

// Simple cubic mapping
// 9,366,819 points.
// Cube root is approx 210.7
// 
export const GRID_SIZE = Math.ceil(Math.pow(TOTAL_COMBINATIONS, 1 / 3)); // likely 211

export function indexToPosition(index: number): [number, number, number] {
    // z changes fastest, then y, then x
    const z = index % GRID_SIZE;
    const y = Math.floor(index / GRID_SIZE) % GRID_SIZE;
    const x = Math.floor(index / (GRID_SIZE * GRID_SIZE));

    // Center it roughly
    const offset = GRID_SIZE / 2;
    return [x - offset, y - offset, z - offset];
}
