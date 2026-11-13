const { MyArray, LinkedList, Stack, Queue } = require('./ds');

// ---------- helpers ----------
class Recorder {
  constructor(on, max) { this.on = on; this.max = max || 300; this.steps = new MyArray(); this.dropped = 0; }
  add(text, arr, marks) {
    if (!this.on) return;
    if (this.steps.length >= this.max) { this.dropped++; return; }
    this.steps.push({
      text: typeof text === 'function' ? text() : text,
      arr: arr ? arr.toArray() : null,
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
  const t0 = process.hrtime.bigint();
  const r = fn();
  return { r, ms: Number(process.hrtime.bigint() - t0) / 1e6 };
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
  if (lo >= hi) return;
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
  quickSort(a, lo, i - 1, c);
  quickSort(a, i + 1, hi, c);
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

// ---------- recursion ----------
function ind(d) { let s = ''; for (let i = 0; i < d; i++) s += '  '; return s; }

function fact(n, d, c) {
  c.calls++; c.ops++; if (d > c.maxDepth) c.maxDepth = d;
  if (c.rec.on) c.rec.add(() => ind(d) + `factorial(${n}) called`);
  if (n <= 1) { if (c.rec.on) c.rec.add(() => ind(d) + `factorial(${n}) returns 1 (base case)`); return 1n; }
  const r = BigInt(n) * fact(n - 1, d + 1, c); c.ops++;
  if (c.rec.on) c.rec.add(() => ind(d) + `factorial(${n}) returns ${r}`);
  return r;
}

function fib(n, d, c) {
  c.calls++; c.ops++; if (d > c.maxDepth) c.maxDepth = d;
  if (c.rec.on) c.rec.add(() => ind(d) + `fib(${n})`);
  if (n < 2) return n;
  const x = fib(n - 1, d + 1, c), y = fib(n - 2, d + 1, c); c.ops++;
  if (c.rec.on) c.rec.add(() => ind(d) + `fib(${n}) = ${x + y}`);
  return x + y;
}