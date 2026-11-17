const assert = require('assert');
const {
  ArrayStack,
  ArrayLinearQueue,
  ArrayCircularQueue,
  SinglyLinkedList,
  DoublyLinkedList,
  checkBalancedBrackets
} = require('./ds');

const {
  runFibonacci,
  runFactorial,
  runTowerOfHanoi,
  runSingleSort,
  runCompareAll,
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSortInternal,
  quickSortFirstPivot,
  quickSortRandomPivot
} = require('./algorithms');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
  }
}

console.log('\n--- 1. Testing Module A: Recursion Lab ---');

test('Fibonacci: Naive, Memoized, and Bottom-Up DP return identical results', () => {
  const res = runFibonacci(12);
  assert.strictEqual(res.naive.result, '144');
  assert.strictEqual(res.memoized.result, '144');
  assert.strictEqual(res.bottomUp.result, '144');
  assert(res.naive.calls > 400); // 2^n exponential explosion
  assert(res.memoized.calls <= 25);
  assert.strictEqual(res.bottomUp.iterations, 11);
});

test('Fibonacci: Handles edge cases n = 0 and n = 1', () => {
  assert.strictEqual(runFibonacci(0).bottomUp.result, '0');
  assert.strictEqual(runFibonacci(1).bottomUp.result, '1');
});

test('Factorial: Recursive and Iterative produce identical results and handle n = 0', () => {
  const res0 = runFactorial(0);
  assert.strictEqual(res0.result, '1');

  const res5 = runFactorial(5);
  assert.strictEqual(res5.result, '120');
  assert.strictEqual(res5.recursive.calls, 5);
  assert.strictEqual(res5.iterative.iterations, 4);
});

test('Factorial: Rejects negative input', () => {
  assert.throws(() => runFactorial(-3), /negative/);
});

test('Tower of Hanoi: Correct total moves 2^n - 1 and peg customization', () => {
  const res = runTowerOfHanoi(4, 'B', 'A', 'C');
  assert.strictEqual(res.totalMoves, 15);
  assert.strictEqual(res.expectedMoves, 15);
  assert.strictEqual(res.formulaConfirmed, true);
  assert.strictEqual(res.steps[0].arr.source, 'B');
  assert.strictEqual(res.steps[0].arr.dest, 'A');
});

console.log('\n--- 2. Testing Module B: Data Structures Lab ---');

test('ArrayStack: Push, Pop, Peek, Size, Overflow, Underflow', () => {
  const stack = new ArrayStack(3);
  assert.strictEqual(stack.is_empty(), true);
  stack.push(10);
  stack.push(20);
  stack.push(30);
  assert.strictEqual(stack.is_full(), true);
  assert.strictEqual(stack.peek(), 30);
  assert.strictEqual(stack.size(), 3);
  assert.throws(() => stack.push(40), /Stack Overflow/);

  assert.strictEqual(stack.pop(), 30);
  assert.strictEqual(stack.pop(), 20);
  assert.strictEqual(stack.pop(), 10);
  assert.strictEqual(stack.is_empty(), true);
  assert.throws(() => stack.pop(), /Stack Underflow/);
});

test('ArrayLinearQueue: Demonstrates False Full condition', () => {
  const q = new ArrayLinearQueue(3);
  q.enqueue(1);
  q.enqueue(2);
  q.enqueue(3);
  assert.strictEqual(q.is_full(), true);
  assert.strictEqual(q.dequeue(), 1); // slot 0 freed, but rear is at index 2
  assert.strictEqual(q.is_false_full(), true);
  assert.throws(() => q.enqueue(4), /False Full Problem/);
});

test('ArrayCircularQueue: Solves False Full with modulo wrap-around', () => {
  const cq = new ArrayCircularQueue(3);
  cq.enqueue(1);
  cq.enqueue(2);
  cq.enqueue(3);
  assert.strictEqual(cq.is_full(), true);
  assert.strictEqual(cq.dequeue(), 1);
  // Rear wraps around to index 0
  cq.enqueue(4);
  assert.strictEqual(cq.rear, 0);
  assert.deepStrictEqual(cq.toArray(), [2, 3, 4]);
  assert.strictEqual(cq.dequeue(), 2);
  assert.strictEqual(cq.dequeue(), 3);
  assert.strictEqual(cq.dequeue(), 4);
  assert.strictEqual(cq.is_empty(), true);
});

test('SinglyLinkedList: All insertion and deletion variants', () => {
  const list = new SinglyLinkedList();
  list.insertAtBeginning(20);
  list.insertAtBeginning(10); // [10, 20]
  list.insertAtEnd(40);        // [10, 20, 40]
  list.insertBefore(40, 30);  // [10, 20, 30, 40]
  list.insertAfter(20, 25);   // [10, 20, 25, 30, 40]
  assert.deepStrictEqual(list.toArray(), [10, 20, 25, 30, 40]);

  assert.strictEqual(list.deleteAtBeginning(), 10);
  assert.strictEqual(list.deleteAtEnd(), 40);
  assert.strictEqual(list.deleteBefore(30), 25);
  assert.strictEqual(list.deleteAfter(20), 30);
  assert.deepStrictEqual(list.toArray(), [20]);

  list.insertAtEnd(50);
  list.deleteElement(50);
  assert.deepStrictEqual(list.toArray(), [20]);
  assert.strictEqual(list.search(20).found, true);
  assert.strictEqual(list.search(99).found, false);
});

test('DoublyLinkedList: Bidirectional insertion, deletion, and backward display', () => {
  const dlist = new DoublyLinkedList();
  dlist.insertAtBeginning(20);
  dlist.insertAtBeginning(10);
  dlist.insertAtEnd(40);
  dlist.insertBefore(40, 30);
  dlist.insertAfter(10, 15);
  assert.deepStrictEqual(dlist.toArray(), [10, 15, 20, 30, 40]);
  assert.deepStrictEqual(dlist.toArrayBackward(), [40, 30, 20, 15, 10]);

  assert.strictEqual(dlist.deleteAtBeginning(), 10);
  assert.strictEqual(dlist.deleteAtEnd(), 40);
  assert.strictEqual(dlist.deleteBefore(30), 20);
  assert.strictEqual(dlist.deleteAfter(15), 30);
  assert.deepStrictEqual(dlist.toArray(), [15]);
  assert.deepStrictEqual(dlist.toArrayBackward(), [15]);
});

test('Balanced Brackets Checker: Correctly validates various bracket strings', () => {
  assert.strictEqual(checkBalancedBrackets('{ ( [ ] ) }').balanced, true);
  assert.strictEqual(checkBalancedBrackets('( [ ) ]').balanced, false);
  assert.strictEqual(checkBalancedBrackets('((((').balanced, false);
  assert.strictEqual(checkBalancedBrackets(']').balanced, false);
  assert.strictEqual(checkBalancedBrackets('const x = (2 * [a + {b}]);').balanced, true);
});

console.log('\n--- 3. Testing Module C: Sorting Lab ---');

const testCases = [
  [5, 2, 9, 1, 5, 6],
  [1, 2, 3, 4, 5],
  [5, 4, 3, 2, 1],
  [42],
  []
];

test('Quicksort: First-element pivot with Yellow/Green partition', () => {
  for (const input of testCases) {
    const arr = input.slice();
    const c = { comparisons: 0, writes: 0, swaps: 0 };
    quickSortFirstPivot(arr, 0, arr.length - 1, c);
    const expected = input.slice().sort((a, b) => a - b);
    assert.deepStrictEqual(arr, expected);
  }
});

test('Quicksort: Randomised pivot version', () => {
  for (const input of testCases) {
    const arr = input.slice();
    const c = { comparisons: 0, writes: 0, swaps: 0 };
    quickSortRandomPivot(arr, 0, arr.length - 1, c);
    const expected = input.slice().sort((a, b) => a - b);
    assert.deepStrictEqual(arr, expected);
  }
});

test('All 5 sorting algorithms sort identically on random input', () => {
  const input = [64, 34, 25, 12, 22, 11, 90, 5, 38];
  const expected = input.slice().sort((a, b) => a - b);

  const bubbleArr = input.slice();
  bubbleSort(bubbleArr, { comparisons: 0, writes: 0 });
  assert.deepStrictEqual(bubbleArr, expected);

  const selArr = input.slice();
  selectionSort(selArr, { comparisons: 0, writes: 0 });
  assert.deepStrictEqual(selArr, expected);

  const insArr = input.slice();
  insertionSort(insArr, { comparisons: 0, writes: 0 });
  assert.deepStrictEqual(insArr, expected);

  const mergeArr = input.slice();
  mergeSortInternal(mergeArr, 0, mergeArr.length - 1, { comparisons: 0, writes: 0 });
  assert.deepStrictEqual(mergeArr, expected);
});

test('Compare All sorting runner outputs all 6 algorithm entries', () => {
  const res = runCompareAll('45 12 85 32 89 39 69 44 42 1 6 8');
  assert.strictEqual(res.results.length, 6);
  assert(res.results.some(r => r.key === 'quickFirst'));
  assert(res.results.some(r => r.key === 'quickRandom'));
});

console.log(`\n========================================`);
console.log(`Test Results: ${passedTests} / ${totalTests} tests passed`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
