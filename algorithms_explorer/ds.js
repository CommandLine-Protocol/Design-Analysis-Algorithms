// ---------- Plain Fixed-Capacity Array Stack ----------
class ArrayStack {
  constructor(capacity = 5) {
    this.capacity = capacity > 0 ? capacity : 5;
    this.data = new Array(this.capacity);
    for (let i = 0; i < this.capacity; i++) this.data[i] = undefined;
    this.top = -1;
  }

  is_empty() {
    return this.top === -1;
  }

  is_full() {
    return this.top >= this.capacity - 1;
  }

  push(v) {
    if (this.is_full()) {
      throw new Error(`Stack Overflow: capacity of ${this.capacity} reached. Cannot push ${v}.`);
    }
    this.top++;
    this.data[this.top] = v;
    return true;
  }

  pop() {
    if (this.is_empty()) {
      throw new Error('Stack Underflow: stack is empty. Cannot pop.');
    }
    const val = this.data[this.top];
    this.data[this.top] = undefined;
    this.top--;
    return val;
  }

  peek() {
    if (this.is_empty()) return undefined;
    return this.data[this.top];
  }

  size() {
    return this.top + 1;
  }

  // Returns elements from bottom to top
  toArray() {
    const out = [];
    for (let i = 0; i <= this.top; i++) out[i] = this.data[i];
    return out;
  }

  // Returns array with all capacity slots (filled or empty)
  getRawSlots() {
    const out = [];
    for (let i = 0; i < this.capacity; i++) {
      out[i] = this.data[i] !== undefined ? this.data[i] : null;
    }
    return out;
  }
}

// ---------- Linear Queue on Fixed-Size Array ----------
// Demonstrates the "false full" problem when rear hits capacity - 1 despite dequeued slots.
class ArrayLinearQueue {
  constructor(capacity = 5) {
    this.capacity = capacity > 0 ? capacity : 5;
    this.data = new Array(this.capacity);
    for (let i = 0; i < this.capacity; i++) this.data[i] = undefined;
    this.front = 0;
    this.rear = -1;
    this.count = 0;
  }

  is_empty() {
    return this.count === 0;
  }

  is_false_full() {
    // Rear has reached the last slot, but dequeue has left empty spaces at the front
    return this.rear >= this.capacity - 1 && this.count < this.capacity;
  }

  is_full() {
    return this.count >= this.capacity || this.rear >= this.capacity - 1;
  }

  enqueue(v) {
    if (this.is_false_full()) {
      throw new Error(
        `False Full Problem: rear is at index ${this.rear} (array end), but only ${this.count}/${this.capacity} slots are used! Unused space at front [0..${this.front - 1}] cannot be used without shifting or circular queue.`
      );
    }
    if (this.rear >= this.capacity - 1) {
      throw new Error(`Linear Queue is full: capacity of ${this.capacity} reached.`);
    }
    this.rear++;
    this.data[this.rear] = v;
    this.count++;
    return true;
  }

  dequeue() {
    if (this.is_empty()) {
      throw new Error('Queue Underflow: queue is empty. Cannot dequeue.');
    }
    const val = this.data[this.front];
    this.data[this.front] = undefined;
    this.front++;
    this.count--;
    return val;
  }

  front_val() {
    if (this.is_empty()) return undefined;
    return this.data[this.front];
  }

  size() {
    return this.count;
  }

  toArray() {
    const out = [];
    if (this.is_empty()) return out;
    let idx = 0;
    for (let i = this.front; i <= this.rear; i++) {
      if (this.data[i] !== undefined) out[idx++] = this.data[i];
    }
    return out;
  }

  getRawSlots() {
    const out = [];
    for (let i = 0; i < this.capacity; i++) {
      out[i] = this.data[i] !== undefined ? this.data[i] : null;
    }
    return out;
  }
}

// ---------- Circular Queue on Fixed-Size Array ----------
// Solves false-full by wrapping front and rear pointers using modulo arithmetic.
class ArrayCircularQueue {
  constructor(capacity = 5) {
    this.capacity = capacity > 0 ? capacity : 5;
    this.data = new Array(this.capacity);
    for (let i = 0; i < this.capacity; i++) this.data[i] = undefined;
    this.front = 0;
    this.rear = -1;
    this.count = 0;
  }

  is_empty() {
    return this.count === 0;
  }

  is_full() {
    return this.count === this.capacity;
  }

  enqueue(v) {
    if (this.is_full()) {
      throw new Error(`Circular Queue is full: capacity of ${this.capacity} reached.`);
    }
    this.rear = (this.rear + 1) % this.capacity;
    this.data[this.rear] = v;
    this.count++;
    return true;
  }

  dequeue() {
    if (this.is_empty()) {
      throw new Error('Circular Queue Underflow: queue is empty. Cannot dequeue.');
    }
    const val = this.data[this.front];
    this.data[this.front] = undefined;
    this.front = (this.front + 1) % this.capacity;
    this.count--;
    return val;
  }

  front_val() {
    if (this.is_empty()) return undefined;
    return this.data[this.front];
  }

  size() {
    return this.count;
  }

  toArray() {
    const out = [];
    for (let i = 0; i < this.count; i++) {
      const idx = (this.front + i) % this.capacity;
      out[i] = this.data[idx];
    }
    return out;
  }

  getRawSlots() {
    const out = [];
    for (let i = 0; i < this.capacity; i++) {
      out[i] = this.data[i] !== undefined ? this.data[i] : null;
    }
    return out;
  }
}

// ---------- Singly Linked List ----------
class SinglyNode {
  constructor(v) {
    this.value = v;
    this.next = null;
  }
}

class SinglyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  size() {
    return this.length;
  }

  is_empty() {
    return this.length === 0;
  }

  insertAtBeginning(v) {
    const node = new SinglyNode(v);
    node.next = this.head;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.length++;
  }

  insertAtEnd(v) {
    const node = new SinglyNode(v);
    if (!this.tail) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
  }

  insertBefore(target, v) {
    if (this.is_empty()) throw new Error(`Target ${target} not found: list is empty.`);
    if (this.head.value === target) {
      this.insertAtBeginning(v);
      return;
    }
    let prev = this.head;
    let cur = this.head.next;
    while (cur) {
      if (cur.value === target) {
        const node = new SinglyNode(v);
        node.next = cur;
        prev.next = node;
        this.length++;
        return;
      }
      prev = cur;
      cur = cur.next;
    }
    throw new Error(`Target element ${target} not found in singly linked list.`);
  }

  insertAfter(target, v) {
    if (this.is_empty()) throw new Error(`Target ${target} not found: list is empty.`);
    let cur = this.head;
    while (cur) {
      if (cur.value === target) {
        const node = new SinglyNode(v);
        node.next = cur.next;
        cur.next = node;
        if (cur === this.tail) this.tail = node;
        this.length++;
        return;
      }
      cur = cur.next;
    }
    throw new Error(`Target element ${target} not found in singly linked list.`);
  }

  deleteAtBeginning() {
    if (this.is_empty()) throw new Error('Cannot delete: list is empty.');
    const val = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.length--;
    return val;
  }

  deleteAtEnd() {
    if (this.is_empty()) throw new Error('Cannot delete: list is empty.');
    if (this.head === this.tail) {
      const val = this.head.value;
      this.head = null;
      this.tail = null;
      this.length = 0;
      return val;
    }
    let cur = this.head;
    while (cur.next && cur.next !== this.tail) {
      cur = cur.next;
    }
    const val = this.tail.value;
    cur.next = null;
    this.tail = cur;
    this.length--;
    return val;
  }

  deleteBefore(target) {
    if (this.is_empty() || !this.head.next) {
      throw new Error(`No element exists before ${target}.`);
    }
    if (this.head.next.value === target) {
      return this.deleteAtBeginning();
    }
    let prevPrev = null;
    let prev = this.head;
    let cur = this.head.next;
    while (cur) {
      if (cur.value === target) {
        const val = prev.value;
        prevPrev.next = cur;
        this.length--;
        return val;
      }
      prevPrev = prev;
      prev = cur;
      cur = cur.next;
    }
    throw new Error(`Target element ${target} not found.`);
  }

  deleteAfter(target) {
    if (this.is_empty()) throw new Error(`Target ${target} not found: list is empty.`);
    let cur = this.head;
    while (cur) {
      if (cur.value === target) {
        if (!cur.next) throw new Error(`No element exists after ${target}.`);
        const val = cur.next.value;
        if (cur.next === this.tail) this.tail = cur;
        cur.next = cur.next.next;
        this.length--;
        return val;
      }
      cur = cur.next;
    }
    throw new Error(`Target element ${target} not found.`);
  }

  deleteElement(v) {
    if (this.is_empty()) throw new Error(`Element ${v} not found: list is empty.`);
    if (this.head.value === v) return this.deleteAtBeginning();
    let prev = this.head;
    let cur = this.head.next;
    while (cur) {
      if (cur.value === v) {
        if (cur === this.tail) this.tail = prev;
        prev.next = cur.next;
        this.length--;
        return v;
      }
      prev = cur;
      cur = cur.next;
    }
    throw new Error(`Element ${v} not found in singly linked list.`);
  }

  search(v) {
    let cur = this.head;
    let index = 0;
    let comparisons = 0;
    while (cur) {
      comparisons++;
      if (cur.value === v) return { found: true, index, comparisons };
      cur = cur.next;
      index++;
    }
    return { found: false, index: -1, comparisons };
  }

  toArray() {
    const out = [];
    let cur = this.head;
    let i = 0;
    while (cur) {
      out[i++] = cur.value;
      cur = cur.next;
    }
    return out;
  }
}

// ---------- Doubly Linked List ----------
class DoublyNode {
  constructor(v) {
    this.value = v;
    this.next = null;
    this.prev = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  size() {
    return this.length;
  }

  is_empty() {
    return this.length === 0;
  }

  insertAtBeginning(v) {
    const node = new DoublyNode(v);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this.length++;
  }

  insertAtEnd(v) {
    const node = new DoublyNode(v);
    if (!this.tail) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    this.length++;
  }

  insertBefore(target, v) {
    if (this.is_empty()) throw new Error(`Target ${target} not found: list is empty.`);
    let cur = this.head;
    while (cur) {
      if (cur.value === target) {
        if (cur === this.head) {
          this.insertAtBeginning(v);
        } else {
          const node = new DoublyNode(v);
          node.prev = cur.prev;
          node.next = cur;
          cur.prev.next = node;
          cur.prev = node;
          this.length++;
        }
        return;
      }
      cur = cur.next;
    }
    throw new Error(`Target element ${target} not found in doubly linked list.`);
  }

  insertAfter(target, v) {
    if (this.is_empty()) throw new Error(`Target ${target} not found: list is empty.`);
    let cur = this.head;
    while (cur) {
      if (cur.value === target) {
        if (cur === this.tail) {
          this.insertAtEnd(v);
        } else {
          const node = new DoublyNode(v);
          node.next = cur.next;
          node.prev = cur;
          cur.next.prev = node;
          cur.next = node;
          this.length++;
        }
        return;
      }
      cur = cur.next;
    }
    throw new Error(`Target element ${target} not found in doubly linked list.`);
  }

  deleteAtBeginning() {
    if (this.is_empty()) throw new Error('Cannot delete: list is empty.');
    const val = this.head.value;
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else {
      this.head = this.head.next;
      this.head.prev = null;
    }
    this.length--;
    return val;
  }

  deleteAtEnd() {
    if (this.is_empty()) throw new Error('Cannot delete: list is empty.');
    const val = this.tail.value;
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else {
      this.tail = this.tail.prev;
      this.tail.next = null;
    }
    this.length--;
    return val;
  }

  deleteBefore(target) {
    if (this.is_empty()) throw new Error(`Target ${target} not found: list is empty.`);
    let cur = this.head;
    while (cur) {
      if (cur.value === target) {
        if (!cur.prev) throw new Error(`No element exists before ${target}.`);
        const targetPrev = cur.prev;
        if (targetPrev === this.head) {
          return this.deleteAtBeginning();
        }
        const val = targetPrev.value;
        targetPrev.prev.next = cur;
        cur.prev = targetPrev.prev;
        this.length--;
        return val;
      }
      cur = cur.next;
    }
    throw new Error(`Target element ${target} not found.`);
  }

  deleteAfter(target) {
    if (this.is_empty()) throw new Error(`Target ${target} not found: list is empty.`);
    let cur = this.head;
    while (cur) {
      if (cur.value === target) {
        if (!cur.next) throw new Error(`No element exists after ${target}.`);
        const targetNext = cur.next;
        if (targetNext === this.tail) {
          return this.deleteAtEnd();
        }
        const val = targetNext.value;
        cur.next = targetNext.next;
        targetNext.next.prev = cur;
        this.length--;
        return val;
      }
      cur = cur.next;
    }
    throw new Error(`Target element ${target} not found.`);
  }

  deleteElement(v) {
    if (this.is_empty()) throw new Error(`Element ${v} not found: list is empty.`);
    let cur = this.head;
    while (cur) {
      if (cur.value === v) {
        if (cur === this.head) return this.deleteAtBeginning();
        if (cur === this.tail) return this.deleteAtEnd();
        cur.prev.next = cur.next;
        cur.next.prev = cur.prev;
        this.length--;
        return v;
      }
      cur = cur.next;
    }
    throw new Error(`Element ${v} not found in doubly linked list.`);
  }

  search(v) {
    let cur = this.head;
    let index = 0;
    let comparisons = 0;
    while (cur) {
      comparisons++;
      if (cur.value === v) return { found: true, index, comparisons };
      cur = cur.next;
      index++;
    }
    return { found: false, index: -1, comparisons };
  }

  toArray() {
    const out = [];
    let cur = this.head;
    let i = 0;
    while (cur) {
      out[i++] = cur.value;
      cur = cur.next;
    }
    return out;
  }

  toArrayBackward() {
    const out = [];
    let cur = this.tail;
    let i = 0;
    while (cur) {
      out[i++] = cur.value;
      cur = cur.prev;
    }
    return out;
  }
}

// ---------- Stack Application: Balanced Brackets Checker ----------
function checkBalancedBrackets(expr) {
  const stack = new ArrayStack(Math.max(10, expr.length));
  const steps = [];
  const matching = { ')': '(', ']': '[', '}': '{' };
  let balanced = true;
  let reason = 'Balanced bracket expression.';

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
      steps.push({
        index: i,
        char: ch,
        action: `Push '${ch}' onto stack`,
        stack: stack.toArray(),
        validSoFar: true
      });
    } else if (ch === ')' || ch === ']' || ch === '}') {
      if (stack.is_empty()) {
        balanced = false;
        reason = `Closing bracket '${ch}' at position ${i} has no matching open bracket (stack underflow).`;
        steps.push({
          index: i,
          char: ch,
          action: reason,
          stack: [],
          validSoFar: false
        });
        break;
      }
      const top = stack.pop();
      if (top !== matching[ch]) {
        balanced = false;
        reason = `Mismatched bracket at position ${i}: expected match for '${top}', but found '${ch}'.`;
        steps.push({
          index: i,
          char: ch,
          action: reason,
          stack: stack.toArray(),
          validSoFar: false
        });
        break;
      }
      steps.push({
        index: i,
        char: ch,
        action: `Matched '${top}' with '${ch}', popped from stack`,
        stack: stack.toArray(),
        validSoFar: true
      });
    } else {
      // Non-bracket characters ignored or noted
      steps.push({
        index: i,
        char: ch,
        action: `Ignore non-bracket character '${ch}'`,
        stack: stack.toArray(),
        validSoFar: true
      });
    }
  }

  if (balanced && !stack.is_empty()) {
    balanced = false;
    reason = `Unclosed opening bracket(s) remaining on stack: [${stack.toArray().join(', ')}].`;
    steps.push({
      index: expr.length,
      char: 'EOF',
      action: reason,
      stack: stack.toArray(),
      validSoFar: false
    });
  }

  return { balanced, steps, message: reason };
}

// ---------- Legacy/Internal MyArray Helper for recorder ----------
class MyArray {
  constructor() { this.data = {}; this.length = 0; }
  push(v) { this.data[this.length] = v; this.length++; }
  get(i) { return this.data[i]; }
  set(i, v) { this.data[i] = v; }
  pop() {
    if (this.length === 0) return undefined;
    this.length--;
    const v = this.data[this.length];
    delete this.data[this.length];
    return v;
  }
  copy() {
    const c = new MyArray();
    for (let i = 0; i < this.length; i++) c.push(this.data[i]);
    return c;
  }
  toArray() {
    const out = [];
    for (let i = 0; i < this.length; i++) out[i] = this.data[i];
    return out;
  }
}

// Exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ArrayStack,
    ArrayLinearQueue,
    ArrayCircularQueue,
    SinglyNode,
    SinglyLinkedList,
    DoublyNode,
    DoublyLinkedList,
    checkBalancedBrackets,
    MyArray
  };
}
if (typeof window !== 'undefined') {
  window.ArrayStack = ArrayStack;
  window.ArrayLinearQueue = ArrayLinearQueue;
  window.ArrayCircularQueue = ArrayCircularQueue;
  window.SinglyNode = SinglyNode;
  window.SinglyLinkedList = SinglyLinkedList;
  window.DoublyNode = DoublyNode;
  window.DoublyLinkedList = DoublyLinkedList;
  window.checkBalancedBrackets = checkBalancedBrackets;
  window.MyArray = MyArray;
}
