if (typeof require !== 'undefined') {
  Object.assign(global, require('./ds'));
}

// ---------- helpers ----------
class Recorder {
  constructor(on, max) { this.on = on; this.max = max || 300; this.steps = new MyArray(); this.dropped = 0; }
  add(text, arr, marks) {
    if (!this.on) return;
    if (this.steps.length >= this.max) { this.dropped++; return; }
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
      marks: marks || []
    });
  }
}

function splitBy(str, isSep) {           // tokenizer, drops empty tokens
  const out = new MyArray(); let cur = '';
  for (let i = 0; i <= str.length; i++) {
    if (i === str.length || isSep(str[i])) { if (cur !== '') { out.push(cur); cur = ''; } }
    else cur += str[i];
  }
  return out;
}

function parseNumbers(str) {
  const out = new MyArray(); let cur = '';
  for (let i = 0; i <= str.length; i++) {
    const ch = i < str.length ? str[i] : ' ';
    if ((ch >= '0' && ch <= '9') || ch === '-' || ch === '.') cur += ch;
    else if (cur !== '') {
      const v = Number(cur);
      if (v !== v) throw new Error('Invalid number: ' + cur);
      out.push(v); cur = '';
    }
  }
  return out;
}

function timeIt(fn) {
  if (typeof process !== 'undefined' && process.hrtime && process.hrtime.bigint) {
    const t0 = process.hrtime.bigint();
    const r = fn();
    return { r, ms: Number(process.hrtime.bigint() - t0) / 1e6 };
  }
  const t0 = performance.now();
  const r = fn();
  return { r, ms: performance.now() - t0 };
}

function swap(a, i, j, c) {
  const t = a.get(i); a.set(i, a.get(j)); a.set(j, t); c.writes += 2;
}

// ---------- sorting ----------
function bubbleSort(a, c) {
  const n = a.length, R = c.rec.on;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      c.comparisons++;
      if (a.get(j) > a.get(j + 1)) {
        swap(a, j, j + 1, c); swapped = true;
        if (R) c.rec.add(`Pass ${i + 1}: swapped positions ${j} and ${j + 1}`, a, [j, j + 1]);
      }
    }
    if (R) c.rec.add(`End of pass ${i + 1}: position ${n - 1 - i} is final`, a, [n - 1 - i]);
    if (!swapped) { if (R) c.rec.add('No swaps in this pass, stopping early', a); break; }
  }
}

function selectionSort(a, c) {
  const n = a.length, R = c.rec.on;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) { c.comparisons++; if (a.get(j) < a.get(min)) min = j; }
    if (min !== i) swap(a, i, min, c);
    if (R) c.rec.add(`Smallest of the unsorted part is ${a.get(i)}, placed at position ${i}`, a, [i, min]);
  }
}

function insertionSort(a, c) {
  const n = a.length, R = c.rec.on;
  for (let i = 1; i < n; i++) {
    const key = a.get(i); let j = i - 1;
    while (j >= 0) {
      c.comparisons++;
      if (a.get(j) > key) { a.set(j + 1, a.get(j)); c.writes++; j--; } else break;
    }
    a.set(j + 1, key); c.writes++;
    if (R) c.rec.add(`Inserted ${key} at position ${j + 1}`, a, [j + 1]);
  }
}

function mergeSort(a, lo, hi, c) {
  if (lo >= hi) return;
  const mid = Math.floor((lo + hi) / 2);
  mergeSort(a, lo, mid, c);
  mergeSort(a, mid + 1, hi, c);
  const tmp = new MyArray();
  let i = lo, j = mid + 1;
  while (i <= mid && j <= hi) {
    c.comparisons++;
    if (a.get(i) <= a.get(j)) { tmp.push(a.get(i)); i++; } else { tmp.push(a.get(j)); j++; }
  }
  while (i <= mid) { tmp.push(a.get(i)); i++; }
  while (j <= hi) { tmp.push(a.get(j)); j++; }
  for (let k = 0; k < tmp.length; k++) a.set(lo + k, tmp.get(k));
  c.writes += 2 * tmp.length;
  if (c.rec.on) {
    const marks = []; for (let k = lo; k <= hi; k++) marks[k - lo] = k;
    c.rec.add(`Merged [${lo}..${mid}] and [${mid + 1}..${hi}]`, a, marks);
  }
}

function quickSort(a, lo, hi, c) {
  while (lo < hi) {
    const m = Math.floor((lo + hi) / 2);
    if (m !== hi) swap(a, m, hi, c);        // middle element as pivot
    const pivot = a.get(hi);
    let i = lo;
    for (let j = lo; j < hi; j++) {
      c.comparisons++;
      if (a.get(j) < pivot) { if (i !== j) swap(a, i, j, c); i++; }
    }
    if (i !== hi) swap(a, i, hi, c);
    if (c.rec.on) c.rec.add(`Pivot ${pivot} placed at position ${i} (range ${lo}..${hi})`, a, [i]);
    
    // Recurse on the smaller partition and loop on the larger partition to guarantee max stack depth O(log n)
    if (i - lo < hi - i) {
      quickSort(a, lo, i - 1, c);
      lo = i + 1;
    } else {
      quickSort(a, i + 1, hi, c);
      hi = i - 1;
    }
  }
}

const SORTS = {
  bubble: (a, c) => bubbleSort(a, c),
  selection: (a, c) => selectionSort(a, c),
  insertion: (a, c) => insertionSort(a, c),
  merge: (a, c) => mergeSort(a, 0, a.length - 1, c),
  quick: (a, c) => quickSort(a, 0, a.length - 1, c)
};

const SORT_INFO = {
  bubble: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', note: 'Stable. Early exit makes the sorted case O(n).' },
  selection: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', note: 'Unstable. Always O(n²) comparisons but only O(n) swaps.' },
  insertion: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', note: 'Stable. Very fast on nearly sorted input.' },
  merge: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', note: 'Stable. Recursion depth is log n; needs a temporary buffer.' },
  quick: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', note: 'Unstable. Middle pivot avoids the sorted-input worst case but O(n²) is still possible.' }
};

function runSort(name, input) {
  const fn = SORTS[name];
  if (!fn) throw new Error('Unknown sorting algorithm');
  const arr = parseNumbers(input || '');
  if (arr.length === 0) throw new Error('Enter at least one number');
  if (arr.length > 5000) throw new Error('Maximum 5000 numbers');

  const c1 = { comparisons: 0, writes: 0, rec: new Recorder(false) };
  const timed = timeIt(() => fn(arr.copy(), c1));        // clean timing pass, no recording

  const rec = new Recorder(true, 300);
  const work = arr.copy();
  const c2 = { comparisons: 0, writes: 0, rec };
  rec.add('Initial array', work);
  fn(work, c2);
  rec.add('Sorted result', work);

  return {
    view: 'bars',
    result: 'Sorted: ' + work.toArray().join(', '),
    steps: rec.steps.toArray(), dropped: rec.dropped,
    stats: {
      'Input size': arr.length, Comparisons: c2.comparisons, 'Array writes': c2.writes,
      'Total operations': c2.comparisons + c2.writes, 'Running time (ms)': Number(timed.ms.toFixed(4))
    },
    complexity: SORT_INFO[name]
  };
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

  const runNaive = num <= 30;
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

  const cMemo = { calls: 0, lookups: 0 };
  const memoArr = new Array(num + 1);
  for (let i = 0; i <= num; i++) memoArr[i] = -1n;
  const tMemo = timeIt(() => fibMemo(num, cMemo, memoArr));

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
  for (let d = num; d >= 1; d--) {
    pegs[source].push(d);
  }

  const rec = new Recorder(true, 1000);
  const c = { calls: 0, moves: 0, totalDisks: num };

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

// Dispatcher
function handle(q) {
  if (q.type === 'fibonacci') return runFibonacci(q.n);
  if (q.type === 'factorial') return runFactorial(q.n);
  if (q.type === 'hanoi') return runTowerOfHanoi(q.n, q.source, q.dest, q.aux);
  if (q.type === 'sort') return runSort(q.algorithm, q.input);
  throw new Error('Unknown request type');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runFibonacci,
    runFactorial,
    runTowerOfHanoi,
    bubbleSort,
    selectionSort,
    insertionSort,
    mergeSort,
    quickSort,
    handle
  };
}
if (typeof window !== 'undefined') {
  window.runFibonacci = runFibonacci;
  window.runFactorial = runFactorial;
  window.runTowerOfHanoi = runTowerOfHanoi;
  window.handle = handle;
}
