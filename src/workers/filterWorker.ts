// src/workers/filterWorker.ts

// We need to redefine these or import them?
// Workers don't share memory space with main thread unless we use SharedArrayBuffer.
// For simplicity, we will copy the logic here or import it if the bundler supports it.
// Vite supports worker imports.

// Re-implementing simplified logic to avoid complex imports if possible, 
// but importing is cleaner. Let's try importing first.
// If it fails, we inline the logic.

self.onmessage = (e: MessageEvent) => {
    const { includedNumbers, totalCombinations } = e.data;

    // Create result arrays
    // We return a Float32Array of visibility (1 or 0) and Colors if needed.
    // Actually, to save transfer time, let's just return indices of MATCHES?
    // No, we need to update the entire attribute array generally, 
    // OR we return a bitset/boolean array.

    // Let's return a Uint8Array for visibility (1 = visible, 0 = hidden)
    const visibility = new Uint8Array(totalCombinations);
    let matchCount = 0;

    // We need the combinatorics logic here.
    // Since we can't easily share the compiled TS module without some setup,
    // let's inline the critical parts for maximum performance and zero dependecy issues in the worker.

    const N = 46;
    const K = 6;

    // Precompute binomials locally in worker
    const BINOM: number[][] = [];
    for (let i = 0; i <= N; i++) {
        BINOM[i] = [];
        BINOM[i][0] = 1;
        for (let j = 1; j <= K && j <= i; j++) {
            if (j === i) BINOM[i][j] = 1;
            else BINOM[i][j] = (BINOM[i - 1][j - 1] || 0) + (BINOM[i - 1][j] || 0);
        }
    }

    function getBinom(n: number, k: number) {
        if (k < 0 || k > n) return 0;
        return BINOM[n][k];
    }

    function indexToCombinationLocal(index: number): number[] {
        let remainder = index;
        const result: number[] = [];
        let candidate = N - 1;

        for (let k = K; k > 0; k--) {
            while (getBinom(candidate, k) > remainder) {
                candidate--;
            }
            result.push(candidate);
            remainder -= getBinom(candidate, k);
            candidate--;
        }
        return result.reverse();
    }

    // Optimize:
    // If includedNumbers is empty, everything is visible.
    if (!includedNumbers || includedNumbers.length === 0) {
        visibility.fill(1);
        matchCount = totalCombinations;
    } else {
        for (let i = 0; i < totalCombinations; i++) {
            // Optimization: checking inclusion without full array alloc?
            // indexToCombination generates an array.
            // Doing this 9M times is heavy. 
            // But inside worker it won't freeze UI.
            const combo = indexToCombinationLocal(i);

            let match = true;
            for (const num of includedNumbers) {
                if (!combo.includes(num)) {
                    match = false;
                    break;
                }
            }

            if (match) {
                visibility[i] = 1;
                matchCount++;
            } else {
                visibility[i] = 0;
            }
        }
    }

    self.postMessage({ visibility, matchCount }, [visibility.buffer] as any);
};
