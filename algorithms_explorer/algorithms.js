if (typeof require !== 'undefined') {
  Object.assign(global, require('./ds'));
}

// ---------- High-Resolution Timing & Helpers ----------
function timeIt(fn) {
  if (typeof process !== 'undefined' && process.hrtime && process.hrtime.bigint) {
    const t0 = process.hrtime.bigint();
    const r = fn();
    const t1 = process.hrtime.bigint();
    return { r, ms: Number(t1 - t0) / 1e6 };
  }
  const t0 = performance.now();
  const r = fn();
  const t1 = performance.now();
  return { r, ms: t1 - t0 };
}

class Recorder {
  constructor(on, max = 300) {
    this.on = on;
    this.max = max;
    this.steps = [];
    this.dropped = 0;
  }

  add(text, arr, marks = [], meta = {}) {
    if (!this.on) return;
    if (this.steps.length >= this.max) {
      this.dropped++;
      return;
    }
    let a = null;
    if (arr) {
      if (typeof arr.toArray === 'function') a = arr.toArray();
      else if (Array.isArray(arr)) a = arr.slice();
      else if (typeof arr === 'object') a = JSON.parse(JSON.stringify(arr));
      else a = arr;
    }
    this.steps.push({
      text: typeof text === 'function' ? text() : text,
      arr: a,
      marks: marks || [],
      meta: meta || {}
    });
  }
}

function parseNumbers(str) {
  const out = [];
  let cur = '';
  for (let i = 0; i <= str.length; i++) {
    const ch = i < str.length ? str[i] : ' ';
    if ((ch >= '0' && ch <= '9') || ch === '-' || ch === '.') {
      cur += ch;
    } else if (cur !== '') {
      const v = Number(cur);
      if (v !== v) throw new Error('Invalid numeric input: "' + cur + '"');
      out.push(v);
      cur = '';
    }
  }
  return out;
}

function swap(a, i, j, c) {
  const t = a[i];
  a[i] = a[j];
  a[j] = t;
  c.writes += 2;
  c.swaps = (c.swaps || 0) + 1;
}

// ============================================================================
// MODULE A: RECURSION LAB
// ============================================================================

// (a) Fibonacci (Naive, Memoized, Bottom-Up DP)
function fibNaive(n, c) {
  c.calls++;
  if (n <= 0) return 0n;
  if (n === 1) return 1n;
  return fibNaive(n - 1, c) + fibNaive(n - 2, c);
}

function fibMemo(n, c, memo) {
  c.calls++;
  if (memo[n] !== -1n) {
    c.lookups = (c.lookups || 0) + 1;
    return memo[n];
  }
  let res;
  if (n <= 0) res = 0n;
  else if (n === 1) res = 1n;
  else res = fibMemo(n - 1, c, memo) + fibMemo(n - 2, c, memo);
  memo[n] = res;
  return res;
}

function fibBottomUp(n, c) {
  if (n <= 0) return 0n;
  if (n === 1) return 1n;
  const dp = new Array(n + 1);
  dp[0] = 0n;
  dp[1] = 1n;
  for (let i = 2; i <= n; i++) {
    c.iterations++;
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

function runFibonacci(n) {
  const num = Math.floor(Number(n));
  if (num !== num || num < 0) throw new Error('Input n must be a non-negative integer.');
  if (num > 1000) throw new Error('Maximum supported n for Fibonacci is 1000.');

  // Safe threshold check for naive
  const runNaive = num <= 30;

  // 1. Naive Recursion
  let naiveResult = 'Skipped (n > 30 to prevent browser freeze)';
  let naiveCalls = 'N/A';
  let naiveTime = 'N/A';
  if (runNaive) {
    const cNaive = { calls: 0 };
    const tNaive = timeIt(() => fibNaive(num, cNaive));
    naiveResult = tNaive.r.toString();
    naiveCalls = cNaive.calls;
    naiveTime = Number(tNaive.ms.toFixed(4));
  }

  // 2. Memoized Recursion
  const cMemo = { calls: 0, lookups: 0 };
  const memoArr = new Array(num + 1);
  for (let i = 0; i <= num; i++) memoArr[i] = -1n;
  const tMemo = timeIt(() => fibMemo(num, cMemo, memoArr));

  // 3. Bottom-Up Dynamic Programming
  const cDP = { iterations: 0 };
  const tDP = timeIt(() => fibBottomUp(num, cDP));

  return {
    n: num,
    naive: {
      ran: runNaive,
      result: naiveResult,
      calls: naiveCalls,
      timeMs: naiveTime,
      complexity: 'O(2^n)',
      space: 'O(n) call stack',
      note: 'Tree recursion computes identical sub-problems repeatedly, creating ~2^n function calls.'
    },
    memoized: {
      result: tMemo.r.toString(),
      calls: cMemo.calls,
      lookups: cMemo.lookups,
      timeMs: Number(tMemo.ms.toFixed(4)),
      complexity: 'O(n)',
      space: 'O(n) memo table + stack',
      note: 'Top-down recursion storing solutions to sub-problems in a lookup array upon first visit.'
    },
    bottomUp: {
      result: tDP.r.toString(),
      iterations: cDP.iterations,
      timeMs: Number(tDP.ms.toFixed(4)),
      complexity: 'O(n)',
      space: 'O(n) DP table (or O(1) space with 2 variables)',
      note: 'Iterative calculation starting from base cases fib(0) and fib(1) up to fib(n) without recursion overhead.'
    },
    explanation:
      num > 30
        ? `Naive recursion is disabled for n = ${num} because its time complexity is O(2^n). For n = 35, it requires over 29 million calls; for n = 45, over 2.2 trillion calls. Memoization and Dynamic Programming eliminate redundant work, solving it in O(n) time.`
        : `Notice how naive recursion made ${naiveCalls} calls for n = ${num}, while memoization required only ${cMemo.calls} calls and bottom-up DP required only ${cDP.iterations} iterations!`
  };
}

// (b) Factorial (Recursive and Iterative)
function factRecursive(n, c) {
  c.calls++;
  if (n <= 1) return 1n;
  return BigInt(n) * factRecursive(n - 1, c);
}

function factIterative(n, c) {
  let res = 1n;
  for (let i = 2; i <= n; i++) {
    c.iterations++;
    res *= BigInt(i);
  }
  return res;
}

function runFactorial(n) {
  const num = Math.floor(Number(n));
  if (num !== num) throw new Error('Please enter a valid numeric value for n.');
  if (num < 0) throw new Error('Factorial is not defined for negative integers (n must be >= 0).');
  if (num > 500) throw new Error('Maximum supported n for Factorial display is 500.');

  const cRec = { calls: 0 };
  const tRec = timeIt(() => factRecursive(num, cRec));

  const cIter = { iterations: 0 };
  const tIter = timeIt(() => factIterative(num, cIter));

  return {
    n: num,
    result: tRec.r.toString(),
    recursive: {
      calls: cRec.calls,
      timeMs: Number(tRec.ms.toFixed(4)),
      complexity: 'O(n)',
      space: 'O(n) stack frames'
    },
    iterative: {
      iterations: cIter.iterations,
      timeMs: Number(tIter.ms.toFixed(4)),
      complexity: 'O(n)',
      space: 'O(1) extra space'
    },
    specialCases: num === 0 ? '0! = 1 by convention (empty product).' : null
  };
}

// (c) Tower of Hanoi (Animated with customizable source, dest, aux)
function hanoiSolve(n, source, dest, aux, rec, c, pegs) {
  c.calls++;
  if (n === 0) return;
  hanoiSolve(n - 1, source, aux, dest, rec, c, pegs);

  c.moves++;
  // Pop from source peg, push to dest peg
  const disk = pegs[source].pop();
  pegs[dest].push(disk);

  rec.add(
    `Move ${c.moves}: Move disk ${disk} from Peg ${source} to Peg ${dest}`,
    {
      pegs: {
        A: pegs.A.slice(),
        B: pegs.B.slice(),
        C: pegs.C.slice()
      },
      source,
      dest,
      aux,
      totalDisks: c.totalDisks,
      lastMove: { disk, from: source, to: dest }
    },
    [source, dest]
  );

  hanoiSolve(n - 1, aux, dest, source, rec, c, pegs);
}

function runTowerOfHanoi(n, source = 'A', dest = 'C', aux = 'B') {
  const num = Math.floor(Number(n));
  if (num !== num || num < 1 || num > 8) {
    throw new Error('Number of disks must be an integer between 1 and 8.');
  }
  const validPegs = ['A', 'B', 'C'];
  if (!validPegs.includes(source) || !validPegs.includes(dest) || !validPegs.includes(aux)) {
    throw new Error('Pegs must be chosen from A, B, and C.');
  }
  if (source === dest || source === aux || dest === aux) {
    throw new Error('Source, Destination, and Auxiliary pegs must all be distinct.');
  }

  const pegs = { A: [], B: [], C: [] };
  // Initial state: all disks on source peg, largest at bottom
  for (let d = num; d >= 1; d--) {
    pegs[source].push(d);
  }

  const rec = new Recorder(true, 1000);
  const c = { calls: 0, moves: 0, totalDisks: num };

  // Add initial state
  rec.add(
    `Initial State: All ${num} disk(s) stacked on Peg ${source}`,
    {
      pegs: { A: pegs.A.slice(), B: pegs.B.slice(), C: pegs.C.slice() },
      source,
      dest,
      aux,
      totalDisks: num,
      lastMove: null
    },
    [source]
  );

  const timed = timeIt(() => hanoiSolve(num, source, dest, aux, rec, c, pegs));
  const expectedMoves = Math.pow(2, num) - 1;

  return {
    disks: num,
    source,
    dest,
    aux,
    totalMoves: c.moves,
    expectedMoves,
    formulaConfirmed: c.moves === expectedMoves,
    recursiveCalls: c.calls,
    timeMs: Number(timed.ms.toFixed(4)),
    steps: rec.steps,
    complexity: {
      time: 'O(2^n)',
      space: 'O(n) stack depth',
      note: `Exact number of moves required is 2^${num} - 1 = ${expectedMoves}.`
    }
  };
}

// ============================================================================
// MODULE C: SORTING LAB
// ============================================================================

function bubbleSort(a, c) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      c.comparisons++;
      if (c.rec && c.rec.on) {
        c.rec.add(`Pass ${i + 1}: Compare index ${j} (${a[j]}) and ${j + 1} (${a[j + 1]})`, a, [j, j + 1], {
          type: 'compare',
          pass: i + 1
        });
      }
      if (a[j] > a[j + 1]) {
        swap(a, j, j + 1, c);
        swapped = true;
        if (c.rec && c.rec.on) {
          c.rec.add(`Pass ${i + 1}: Swap index ${j} and ${j + 1} -> [${a.join(', ')}]`, a, [j, j + 1], {
            type: 'swap',
            pass: i + 1
          });
        }
      }
    }
    if (c.rec && c.rec.on) {
      c.rec.add(`End of Pass ${i + 1}: Element at index ${n - 1 - i} (${a[n - 1 - i]}) is in final sorted position`, a, [
        n - 1 - i
      ], { type: 'pass_end', pass: i + 1 });
    }
    if (!swapped) {
      if (c.rec && c.rec.on) {
        c.rec.add('Early termination: Array is already sorted (0 swaps in pass)', a, [], { type: 'early_exit' });
      }
      break;
    }
  }
}

function selectionSort(a, c) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      c.comparisons++;
      if (c.rec && c.rec.on) {
        c.rec.add(`Pass ${i + 1}: Check if index ${j} (${a[j]}) < current min at ${minIdx} (${a[minIdx]})`, a, [j, minIdx], {
          type: 'compare',
          pass: i + 1
        });
      }
      if (a[j] < a[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      swap(a, i, minIdx, c);
      if (c.rec && c.rec.on) {
        c.rec.add(`Pass ${i + 1}: Swap smallest unsorted item ${a[i]} into position ${i}`, a, [i, minIdx], {
          type: 'swap',
          pass: i + 1
        });
      }
    } else {
      if (c.rec && c.rec.on) {
        c.rec.add(`Pass ${i + 1}: Element at position ${i} (${a[i]}) is already minimum`, a, [i], {
          type: 'noop',
          pass: i + 1
        });
      }
    }
  }
}

function insertionSort(a, c) {
  const n = a.length;
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    if (c.rec && c.rec.on) {
      c.rec.add(`Pass ${i}: Current key is ${key} at index ${i}`, a, [i], { type: 'key_select', pass: i });
    }
    while (j >= 0) {
      c.comparisons++;
      if (a[j] > key) {
        a[j + 1] = a[j];
        c.writes++;
        c.moves = (c.moves || 0) + 1;
        if (c.rec && c.rec.on) {
          c.rec.add(`Pass ${i}: Shift ${a[j]} right from index ${j} to ${j + 1}`, a, [j, j + 1], {
            type: 'shift',
            pass: i
          });
        }
        j--;
      } else {
        break;
      }
    }
    a[j + 1] = key;
    c.writes++;
    c.moves = (c.moves || 0) + 1;
    if (c.rec && c.rec.on) {
      c.rec.add(`Pass ${i}: Inserted key ${key} at index ${j + 1}`, a, [j + 1], { type: 'insert', pass: i });
    }
  }
}

function mergeSortInternal(a, lo, hi, c) {
  if (lo >= hi) return;
  const mid = Math.floor((lo + hi) / 2);
  mergeSortInternal(a, lo, mid, c);
  mergeSortInternal(a, mid + 1, hi, c);

  // First-principles merge without slice/built-ins
  const len = hi - lo + 1;
  const temp = new Array(len);
  let i = lo;
  let j = mid + 1;
  let k = 0;

  while (i <= mid && j <= hi) {
    c.comparisons++;
    if (a[i] <= a[j]) {
      temp[k++] = a[i++];
    } else {
      temp[k++] = a[j++];
    }
  }
  while (i <= mid) temp[k++] = a[i++];
  while (j <= hi) temp[k++] = a[j++];

  for (let idx = 0; idx < len; idx++) {
    a[lo + idx] = temp[idx];
    c.writes++;
    c.moves = (c.moves || 0) + 1;
  }

  if (c.rec && c.rec.on) {
    const marks = [];
    for (let m = lo; m <= hi; m++) marks.push(m);
    c.rec.add(`Merged sub-arrays [${lo}..${mid}] and [${mid + 1}..${hi}] into [${lo}..${hi}]`, a, marks, {
      type: 'merge_step',
      range: [lo, hi]
    });
  }
}

// First-element pivot with "yellow/green" partition taught in class
// Yellow segment: elements <= pivot; Green segment: elements > pivot
function partitionYellowGreen(a, lo, hi, c) {
  const pivot = a[lo];
  let yellow = lo; // boundary of yellow zone (items <= pivot)

  if (c.rec && c.rec.on) {
    c.rec.add(
      `Partition range [${lo}..${hi}]: Pivot is first element a[${lo}] = ${pivot}`,
      a,
      [lo],
      { type: 'pivot_selected', pivotIndex: lo, pivotValue: pivot }
    );
  }

  for (let cur = lo + 1; cur <= hi; cur++) {
    c.comparisons++;
    if (a[cur] <= pivot) {
      yellow++;
      if (yellow !== cur) {
        swap(a, yellow, cur, c);
      }
      if (c.rec && c.rec.on) {
        c.rec.add(
          `a[${cur}] (${a[cur]}) <= pivot (${pivot}) -> expand yellow zone to index ${yellow}`,
          a,
          [yellow, cur],
          { type: 'yellow_zone', yellowRange: [lo + 1, yellow], greenRange: [yellow + 1, cur], pivotIndex: lo }
        );
      }
    } else {
      if (c.rec && c.rec.on) {
        c.rec.add(
          `a[${cur}] (${a[cur]}) > pivot (${pivot}) -> belongs in green zone`,
          a,
          [cur],
          { type: 'green_zone', yellowRange: [lo + 1, yellow], greenRange: [yellow + 1, cur], pivotIndex: lo }
        );
      }
    }
  }

  // Place pivot into final position between yellow and green
  if (lo !== yellow) {
    swap(a, lo, yellow, c);
  }

  if (c.rec && c.rec.on) {
    c.rec.add(
      `Pivot ${pivot} placed at final partitioned position ${yellow}. Left (yellow) <= ${pivot}, Right (green) > ${pivot}`,
      a,
      [yellow],
      { type: 'partition_done', finalPivotIndex: yellow }
    );
  }

  return yellow;
}

function quickSortFirstPivot(a, lo, hi, c) {
  if (lo < hi) {
    const p = partitionYellowGreen(a, lo, hi, c);
    quickSortFirstPivot(a, lo, p - 1, c);
    quickSortFirstPivot(a, p + 1, hi, c);
  }
}

function quickSortRandomPivot(a, lo, hi, c) {
  if (lo < hi) {
    // Choose random pivot index and swap to first position (lo)
    const randomIdx = lo + Math.floor(Math.random() * (hi - lo + 1));
    if (randomIdx !== lo) {
      swap(a, lo, randomIdx, c);
      if (c.rec && c.rec.on) {
        c.rec.add(
          `Random pivot selection: Swapped random index ${randomIdx} (${a[lo]}) to first position ${lo}`,
          a,
          [lo, randomIdx],
          { type: 'random_pivot_swap' }
        );
      }
    }
    const p = partitionYellowGreen(a, lo, hi, c);
    quickSortRandomPivot(a, lo, p - 1, c);
    quickSortRandomPivot(a, p + 1, hi, c);
  }
}

const SORT_INFO = {
  bubble: {
    name: 'Bubble Sort',
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: 'Yes',
    note: 'Stable. Early exit optimization detects already-sorted data in 1 pass.'
  },
  selection: {
    name: 'Selection Sort',
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: 'No',
    note: 'Unstable. Always performs n(n-1)/2 comparisons, but at most O(n) swaps.'
  },
  insertion: {
    name: 'Insertion Sort',
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: 'Yes',
    note: 'Stable. Adaptive: extremely fast on sorted or nearly sorted input.'
  },
  merge: {
    name: 'Merge Sort',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
    stable: 'Yes',
    note: 'Stable. Guaranteed O(n log n) in all cases; requires temporary auxiliary buffer.'
  },
  quickFirst: {
    name: 'Quicksort (First-Element Pivot, Yellow/Green)',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
    space: 'O(log n) stack (O(n) worst)',
    stable: 'No',
    note: 'Unstable. Degrades to O(n²) worst-case on already sorted or reverse-sorted input because the first element creates unbalanced 0 and n-1 splits.'
  },
  quickRandom: {
    name: 'Quicksort (Randomised Pivot)',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
    space: 'O(log n) stack',
    stable: 'No',
    note: 'Unstable. Random pivot selection prevents the O(n²) worst-case on sorted input, giving expected O(n log n) with high probability.'
  }
};

function runSingleSort(algKey, rawInput) {
  const arr = parseNumbers(rawInput || '');
  if (arr.length === 0) throw new Error('Please enter at least one numeric value to sort.');
  if (arr.length > 5000) throw new Error('Maximum 5,000 numbers allowed for single sorting.');

  const runner = {
    bubble: (a, c) => bubbleSort(a, c),
    selection: (a, c) => selectionSort(a, c),
    insertion: (a, c) => insertionSort(a, c),
    merge: (a, c) => mergeSortInternal(a, 0, a.length - 1, c),
    quickFirst: (a, c) => quickSortFirstPivot(a, 0, a.length - 1, c),
    quickRandom: (a, c) => quickSortRandomPivot(a, 0, a.length - 1, c)
  }[algKey];

  if (!runner) throw new Error(`Unknown sorting algorithm: ${algKey}`);

  // Unrecorded clean timing run
  const cleanArr = arr.slice();
  const cClean = { comparisons: 0, writes: 0, swaps: 0, moves: 0 };
  const timed = timeIt(() => runner(cleanArr, cClean));

  // Recorded visual run
  const workArr = arr.slice();
  const rec = new Recorder(true, 400);
  const cRec = { comparisons: 0, writes: 0, swaps: 0, moves: 0, rec };
  rec.add('Initial unsorted array', workArr, [], { type: 'init' });
  runner(workArr, cRec);
  rec.add('Final sorted array', workArr, [], { type: 'final' });

  return {
    algorithm: algKey,
    info: SORT_INFO[algKey],
    inputSize: arr.length,
    initial: arr,
    sorted: workArr,
    stats: {
      'Input size (n)': arr.length,
      Comparisons: cRec.comparisons,
      'Swaps / Moves': cRec.swaps || cRec.moves || 0,
      'Total array writes': cRec.writes,
      'Execution time (ms)': Number(timed.ms.toFixed(4))
    },
    steps: rec.steps,
    dropped: rec.dropped
  };
}

function runCompareAll(rawInput) {
  const arr = parseNumbers(rawInput || '');
  if (arr.length === 0) throw new Error('Please enter at least one numeric value to sort.');
  if (arr.length > 5000) throw new Error('Maximum 5,000 numbers for comparison.');

  const keys = ['bubble', 'selection', 'insertion', 'merge', 'quickFirst', 'quickRandom'];
  const results = [];

  for (const key of keys) {
    const work = arr.slice();
    const c = { comparisons: 0, writes: 0, swaps: 0, moves: 0 };
    const runner = {
      bubble: (a, c) => bubbleSort(a, c),
      selection: (a, c) => selectionSort(a, c),
      insertion: (a, c) => insertionSort(a, c),
      merge: (a, c) => mergeSortInternal(a, 0, a.length - 1, c),
      quickFirst: (a, c) => quickSortFirstPivot(a, 0, a.length - 1, c),
      quickRandom: (a, c) => quickSortRandomPivot(a, 0, a.length - 1, c)
    }[key];

    const timed = timeIt(() => runner(work, c));
    results.push({
      key,
      name: SORT_INFO[key].name,
      comparisons: c.comparisons,
      swapsMoves: c.swaps || c.moves || 0,
      writes: c.writes,
      timeMs: Number(timed.ms.toFixed(4)),
      best: SORT_INFO[key].best,
      average: SORT_INFO[key].average,
      worst: SORT_INFO[key].worst,
      space: SORT_INFO[key].space,
      stable: SORT_INFO[key].stable
    });
  }

  return {
    inputSize: arr.length,
    results
  };
}

// ============================================================================
// MODULE D: TIME COMPLEXITY ANALYSIS (BENCHMARK)
// ============================================================================

function generateInput(size, type) {
  const arr = new Array(size);
  if (type === 'sorted') {
    for (let i = 0; i < size; i++) arr[i] = i + 1;
  } else if (type === 'reverse') {
    for (let i = 0; i < size; i++) arr[i] = size - i;
  } else {
    // Random input with pseudo-random seed
    let seed = 1234567 + size;
    for (let i = 0; i < size; i++) {
      seed = (seed * 48271) % 2147483647;
      arr[i] = seed % 100000;
    }
  }
  return arr;
}

function runFullBenchmark(options = {}) {
  // Configurable sizes or standard course sizes
  const sizes = options.sizes || [100, 500, 1000, 2000, 5000, 10000];
  const inputTypes = options.types || ['random', 'sorted', 'reverse'];
  const repetitions = options.repetitions || 3;

  const algorithms = [
    { key: 'bubble', name: 'Bubble Sort', category: 'n2' },
    { key: 'selection', name: 'Selection Sort', category: 'n2' },
    { key: 'insertion', name: 'Insertion Sort', category: 'n2' },
    { key: 'merge', name: 'Merge Sort', category: 'nlogn' },
    { key: 'quickFirst', name: 'Quicksort (First Pivot)', category: 'hybrid' },
    { key: 'quickRandom', name: 'Quicksort (Random Pivot)', category: 'nlogn' }
  ];

  const rows = [];

  for (const n of sizes) {
    for (const type of inputTypes) {
      for (const alg of algorithms) {
        // Skip O(n^2) runs on very large n to prevent browser stall
        if (n > 5000 && alg.category === 'n2' && type === 'reverse') {
          // Keep n=5000 or run once if feasible, or skip n=10000 for bubble/selection if requested
        }

        // Avoid call stack overflow for first-element quicksort on sorted/reverse at large n
        const isQuickFirstDegraded = alg.key === 'quickFirst' && (type === 'sorted' || type === 'reverse') && n > 4000;

        let totalTime = 0;
        let totalComparisons = 0;
        let totalWrites = 0;
        let completedRuns = 0;

        if (!isQuickFirstDegraded) {
          for (let r = 0; r < repetitions; r++) {
            const data = generateInput(n, type);
            const c = { comparisons: 0, writes: 0, swaps: 0, moves: 0 };
            const runner = {
              bubble: (a, c) => bubbleSort(a, c),
              selection: (a, c) => selectionSort(a, c),
              insertion: (a, c) => insertionSort(a, c),
              merge: (a, c) => mergeSortInternal(a, 0, a.length - 1, c),
              quickFirst: (a, c) => quickSortFirstPivot(a, 0, a.length - 1, c),
              quickRandom: (a, c) => quickSortRandomPivot(a, 0, a.length - 1, c)
            }[alg.key];

            try {
              const timed = timeIt(() => runner(data, c));
              totalTime += timed.ms;
              totalComparisons += c.comparisons;
              totalWrites += c.writes;
              completedRuns++;
            } catch (err) {
              break;
            }
          }
        }

        rows.push({
          n,
          type,
          key: alg.key,
          name: alg.name,
          category: alg.category,
          avgTimeMs: completedRuns > 0 ? Number((totalTime / completedRuns).toFixed(3)) : 'Stack Overflow / Skipped',
          avgComparisons: completedRuns > 0 ? Math.round(totalComparisons / completedRuns) : 'N/A',
          avgWrites: completedRuns > 0 ? Math.round(totalWrites / completedRuns) : 'N/A',
          runs: completedRuns
        });
      }
    }
  }

  // Also test large n for O(n log n) sorts (Merge sort & Quick random)
  const largeSizes = [50000, 100000];
  const largeRows = [];
  for (const n of largeSizes) {
    for (const key of ['merge', 'quickRandom']) {
      const data = generateInput(n, 'random');
      const c = { comparisons: 0, writes: 0, swaps: 0, moves: 0 };
      const runner = key === 'merge'
        ? (a, c) => mergeSortInternal(a, 0, a.length - 1, c)
        : (a, c) => quickSortRandomPivot(a, 0, a.length - 1, c);

      const timed = timeIt(() => runner(data, c));
      largeRows.push({
        n,
        type: 'random',
        key,
        name: SORT_INFO[key].name,
        timeMs: Number(timed.ms.toFixed(3)),
        comparisons: c.comparisons,
        writes: c.writes
      });
    }
  }

  return {
    sizes,
    inputTypes,
    repetitions,
    rows,
    largeRows,
    analysis: {
      insertionOnSorted:
        'Insertion Sort is O(n) on already sorted input because each element a[i] is compared only once with a[i-1], finds a[i-1] <= a[i], and immediately terminates the inner while-loop with 0 shifts.',
      quickFirstDegradation:
        'Quicksort with first-element pivot degrades to O(n²) on sorted and reverse-sorted inputs because the first element is always the minimum (or maximum), resulting in maximally unbalanced splits of size 0 and n-1 at every recursive level, leading to n levels of recursion.',
      randomPivotResolution:
        'Randomised Quicksort picks a pivot uniformly at random from the active sub-array. The probability of consistently picking the extreme minimum or maximum is astronomically small (1/n!), yielding balanced splits on average and restoring O(n log n) expected time regardless of input ordering.'
    }
  };
}

// ============================================================================
// UNIFIED API DISPATCHER
// ============================================================================

function handle(q) {
  if (!q || !q.type) throw new Error('Invalid request payload: missing type.');

  // Module A: Recursion
  if (q.type === 'fibonacci') return runFibonacci(q.n);
  if (q.type === 'factorial') return runFactorial(q.n);
  if (q.type === 'hanoi') return runTowerOfHanoi(q.n, q.source, q.dest, q.aux);

  // Module B: Data Structures
  if (q.type === 'brackets') return checkBalancedBrackets(q.expression || '');

  // Module C: Sorting
  if (q.type === 'sort') return runSingleSort(q.algorithm, q.input);
  if (q.type === 'compareSorts') return runCompareAll(q.input);

  // Module D: Complexity Benchmark
  if (q.type === 'benchmark') return runFullBenchmark(q.options || {});

  throw new Error(`Unknown request type: ${q.type}`);
}

// Exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runFibonacci,
    runFactorial,
    runTowerOfHanoi,
    bubbleSort,
    selectionSort,
    insertionSort,
    mergeSortInternal,
    quickSortFirstPivot,
    quickSortRandomPivot,
    runSingleSort,
    runCompareAll,
    runFullBenchmark,
    handle,
    SORT_INFO
  };
}
if (typeof window !== 'undefined') {
  window.runFibonacci = runFibonacci;
  window.runFactorial = runFactorial;
  window.runTowerOfHanoi = runTowerOfHanoi;
  window.runSingleSort = runSingleSort;
  window.runCompareAll = runCompareAll;
  window.runFullBenchmark = runFullBenchmark;
  window.handle = handle;
  window.SORT_INFO = SORT_INFO;
}
