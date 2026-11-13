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

function fibMemo(n, d, c, memo) {
  c.calls++; c.ops++; if (d > c.maxDepth) c.maxDepth = d;
  if (memo.get(n) !== -1) { if (c.rec.on) c.rec.add(() => ind(d) + `fib(${n}) found in memo: ${memo.get(n)}`); return memo.get(n); }
  if (c.rec.on) c.rec.add(() => ind(d) + `fib(${n})`);
  let r;
  if (n < 2) r = n; else { r = fibMemo(n - 1, d + 1, c, memo) + fibMemo(n - 2, d + 1, c, memo); c.ops++; }
  memo.set(n, r);
  return r;
}

function hanoi(n, from, to, via, d, c) {
  c.calls++; if (d > c.maxDepth) c.maxDepth = d;
  if (n === 0) return;
  hanoi(n - 1, from, via, to, d + 1, c);
  c.ops++; c.moves++;
  if (c.rec.on) c.rec.add(() => `Move ${c.moves}: disk ${n} from ${from} to ${to}`);
  hanoi(n - 1, via, to, from, d + 1, c);
}

function binSearch(a, lo, hi, t, d, c) {
  c.calls++; c.ops++; if (d > c.maxDepth) c.maxDepth = d;
  if (lo > hi) { if (c.rec.on) c.rec.add(() => ind(d) + `range [${lo}..${hi}] is empty: not found`); return -1; }
  const mid = Math.floor((lo + hi) / 2); c.ops++;
  if (c.rec.on) c.rec.add(() => ind(d) + `search [${lo}..${hi}], middle index ${mid} holds ${a.get(mid)}`);
  if (a.get(mid) === t) return mid;
  if (a.get(mid) < t) return binSearch(a, mid + 1, hi, t, d + 1, c);
  return binSearch(a, lo, mid - 1, t, d + 1, c);
}

const REC_INFO = {
  factorial: { best: 'O(n)', average: 'O(n)', worst: 'O(n)', space: 'O(n)', note: 'n calls, call stack depth n.' },
  fibonacci: { best: 'O(2^n)', average: 'O(2^n)', worst: 'O(2^n)', space: 'O(n)', note: 'Repeated sub-problems: roughly 1.6^n calls.' },
  fibmemo: { best: 'O(n)', average: 'O(n)', worst: 'O(n)', space: 'O(n)', note: 'Each value computed once, then reused from the memo table.' },
  hanoi: { best: 'O(2^n)', average: 'O(2^n)', worst: 'O(2^n)', space: 'O(n)', note: 'Exactly 2^n - 1 moves are required.' },
  binary: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(log n)', note: 'Search range halves each call. Input is sorted first (merge sort).' }
};

function runRecursion(q) {
  const alg = q.algorithm;
  if (!REC_INFO[alg]) throw new Error('Unknown recursive algorithm');
  const n = Math.floor(Number(q.n));
  let arr = null, target = Number(q.target);

  if (alg === 'binary') {
    arr = parseNumbers(q.input || '');
    if (arr.length === 0) throw new Error('Enter a list of numbers');
    if (target !== target) throw new Error('Enter a numeric target');
    mergeSort(arr, 0, arr.length - 1, { comparisons: 0, writes: 0, rec: new Recorder(false) });
  } else {
    if (n !== n || n < 0) throw new Error('n must be a non-negative integer');
    if (alg === 'factorial' && n > 100) throw new Error('n must be 0..100');
    if (alg === 'fibonacci' && n > 32) throw new Error('n must be 0..32 (naive version is exponential)');
    if (alg === 'fibmemo' && n > 70) throw new Error('n must be 0..70');
    if (alg === 'hanoi' && (n < 1 || n > 20)) throw new Error('n must be 1..20');
  }

  function exec(rec) {
    const c = { calls: 0, ops: 0, maxDepth: 0, moves: 0, rec };
    let result;
    if (alg === 'factorial') result = `${n}! = ${fact(n, 0, c)}`;
    else if (alg === 'fibonacci') result = `fib(${n}) = ${fib(n, 0, c)}`;
    else if (alg === 'fibmemo') {
      const memo = new MyArray(); for (let i = 0; i <= n; i++) memo.push(-1);
      result = `fib(${n}) = ${fibMemo(n, 0, c, memo)}`;
    } else if (alg === 'hanoi') { hanoi(n, 'A', 'C', 'B', 0, c); result = `${c.moves} moves (2^${n} - 1 = ${Math.pow(2, n) - 1})`; }
    else {
      const idx = binSearch(arr, 0, arr.length - 1, target, 0, c);
      result = idx === -1 ? `${target} not found in sorted list [${arr.toArray().join(', ')}]`
        : `${target} found at index ${idx} of sorted list [${arr.toArray().join(', ')}]`;
    }
    return { c, result };
  }

  const timed = timeIt(() => exec(new Recorder(false)));
  const rec = new Recorder(true, 300);
  const shown = exec(rec);
  return {
    view: 'none', result: shown.result,
    steps: rec.steps.toArray(), dropped: rec.dropped,
    stats: {
      'Recursive calls': shown.c.calls, 'Max recursion depth': shown.c.maxDepth,
      'Total operations': shown.c.ops, 'Running time (ms)': Number(timed.ms.toFixed(4))
    },
    complexity: REC_INFO[alg]
  };
}

// ---------- data structures ----------
const DS_INFO = {
  stack: { best: 'O(1)', average: 'O(1)', worst: 'O(1)', space: 'O(n)', note: 'push, pop, peek are all O(1). Backed by MyArray.' },
  queue: { best: 'O(1)', average: 'O(1)', worst: 'O(1)', space: 'O(n)', note: 'enqueue and dequeue are O(1). Backed by a linked list with head and tail pointers.' },
  list: { best: 'O(1)', average: 'O(n)', worst: 'O(n)', space: 'O(n)', note: 'prepend/append O(1); search, delete, reverse O(n).' }
};

function execDS(structure, cmds, rec, c) {
  const ds = structure === 'stack' ? new Stack() : structure === 'queue' ? new Queue() : new LinkedList();
  for (let k = 0; k < cmds.length; k++) {
    const cmd = cmds.get(k);
    const w = splitBy(cmd, ch => ch === ' ' || ch === '\t');
    const name = w.get(0).toLowerCase();
    const hasArg = w.length > 1;
    const v = hasArg ? Number(w.get(1)) : undefined;
    const needNum = () => { if (!hasArg || v !== v) throw new Error('needs a numeric argument'); };
    let msg = '';
    try {
      if (structure === 'stack') {
        if (name === 'push') { needNum(); ds.push(v); c.writes++; msg = `pushed ${v}`; }
        else if (name === 'pop') { const r = ds.pop(); c.writes++; msg = r === undefined ? 'stack is empty' : `popped ${r}`; }
        else if (name === 'peek') { const r = ds.peek(); msg = r === undefined ? 'stack is empty' : `top is ${r}`; }
        else if (name === 'size') msg = `size is ${ds.size}`;
        else throw new Error('unknown command (push, pop, peek, size)');
      } else if (structure === 'queue') {
        if (name === 'enqueue') { needNum(); ds.enqueue(v); c.writes++; msg = `enqueued ${v}`; }
        else if (name === 'dequeue') { const r = ds.dequeue(); c.writes++; msg = r === undefined ? 'queue is empty' : `dequeued ${r}`; }
        else if (name === 'front') { const r = ds.front(); msg = r === undefined ? 'queue is empty' : `front is ${r}`; }
        else if (name === 'size') msg = `size is ${ds.size}`;
        else throw new Error('unknown command (enqueue, dequeue, front, size)');
      } else {
        if (name === 'append') { needNum(); ds.append(v); c.writes++; msg = `appended ${v}`; }
        else if (name === 'prepend') { needNum(); ds.prepend(v); c.writes++; msg = `prepended ${v}`; }
        else if (name === 'delete') { needNum(); const ok = ds.remove(v, c); if (ok) c.writes++; msg = ok ? `deleted ${v}` : `${v} not found`; }
        else if (name === 'search') { needNum(); const i = ds.find(v, c); msg = i === -1 ? `${v} not found` : `${v} found at index ${i}`; }
        else if (name === 'reverse') { ds.reverse(c); msg = 'list reversed'; }
        else if (name === 'size') msg = `size is ${ds.size}`;
        else throw new Error('unknown command (append, prepend, delete, search, reverse, size)');
      }
    } catch (e) { msg = 'Error: ' + e.message; }
    if (rec.on) rec.add(`${cmd} -> ${msg}`, ds);
  }
  return ds;
}

function runDS(structure, text) {
  if (!DS_INFO[structure]) throw new Error('Unknown data structure');
  const cmds = splitBy(text || '', ch => ch === ';' || ch === '\n' || ch === ',');
  if (cmds.length === 0) throw new Error('Enter at least one command');
  if (cmds.length > 500) throw new Error('Maximum 500 commands');

  const c1 = { comparisons: 0, writes: 0 };
  const timed = timeIt(() => execDS(structure, cmds, new Recorder(false), c1));
  const rec = new Recorder(true, 500);
  const c2 = { comparisons: 0, writes: 0 };
  const final = execDS(structure, cmds, rec, c2);
  const label = structure === 'stack' ? ' (bottom to top)' : structure === 'queue' ? ' (front to back)' : ' (head to tail)';
  return {
    view: 'boxes',
    result: 'Final state' + label + ': [' + final.toArray().join(', ') + ']',
    steps: rec.steps.toArray(), dropped: rec.dropped,
    stats: {
      Commands: cmds.length, Comparisons: c2.comparisons, 'Node/array writes': c2.writes,
      'Total operations': c2.comparisons + c2.writes, 'Running time (ms)': Number(timed.ms.toFixed(4))
    },
    complexity: DS_INFO[structure]
  };
}

// ---------- benchmark ----------
function runBenchmark() {
  const sizes = [100, 500, 1000, 2000, 4000];
  const names = ['bubble', 'selection', 'insertion', 'merge', 'quick'];
  const rows = new MyArray();
  let seed = 12345;
  for (let s = 0; s < sizes.length; s++) {
    const base = new MyArray();
    for (let i = 0; i < sizes[s]; i++) { seed = (seed * 48271) % 2147483647; base.push(seed % 10000); }
    for (let k = 0; k < names.length; k++) {
      const c = { comparisons: 0, writes: 0, rec: new Recorder(false) };
      const a = base.copy();
      const t = timeIt(() => SORTS[names[k]](a, c));
      rows.push({ size: sizes[s], algorithm: names[k], operations: c.comparisons + c.writes, timeMs: Number(t.ms.toFixed(3)) });
    }
  }
  return { rows: rows.toArray(), algorithms: names, sizes };
}

function handle(q) {
  if (q.type === 'sort') return runSort(q.algorithm, q.input);
  if (q.type === 'recursion') return runRecursion(q);
  if (q.type === 'ds') return runDS(q.structure, q.commands);
  if (q.type === 'benchmark') return runBenchmark();
  throw new Error('Unknown request type');
}

module.exports = { handle };