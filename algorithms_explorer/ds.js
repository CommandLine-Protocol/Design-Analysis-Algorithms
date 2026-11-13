// Original data structures. No built-in list/stack/queue classes are used.
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
  // Plain array, only used to serialise the result to JSON
  toArray() {
    const out = [];
    for (let i = 0; i < this.length; i++) out[i] = this.data[i];
    return out;
  }
}

class ListNode {
  constructor(v) { this.value = v; this.next = null; }
}

class LinkedList {
  constructor() { this.head = null; this.tail = null; this.size = 0; }
  prepend(v) {
    const n = new ListNode(v);
    n.next = this.head; this.head = n;
    if (!this.tail) this.tail = n;
    this.size++;
  }
  append(v) {
    const n = new ListNode(v);
    if (!this.tail) { this.head = n; this.tail = n; }
    else { this.tail.next = n; this.tail = n; }
    this.size++;
  }
  removeHead() {
    if (!this.head) return undefined;
    const v = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.size--;
    return v;
  }
  find(v, c) {
    let cur = this.head, i = 0;
    while (cur) { c.comparisons++; if (cur.value === v) return i; cur = cur.next; i++; }
    return -1;
  }
  remove(v, c) {
    let prev = null, cur = this.head;
    while (cur) {
      c.comparisons++;
      if (cur.value === v) {
        if (prev) prev.next = cur.next; else this.head = cur.next;
        if (cur === this.tail) this.tail = prev;
        this.size--;
        return true;
      }
      prev = cur; cur = cur.next;
    }
    return false;
  }
  reverse(c) {
    let prev = null, cur = this.head;
    this.tail = this.head;
    while (cur) { const nx = cur.next; cur.next = prev; prev = cur; cur = nx; c.writes++; }
    this.head = prev;
  }
  toArray() {
    const out = []; let cur = this.head, i = 0;
    while (cur) { out[i++] = cur.value; cur = cur.next; }
    return out;
  }
}

class Stack {
  constructor() { this.items = new MyArray(); }
  push(v) { this.items.push(v); }
  pop() { return this.items.pop(); }
  peek() { return this.items.length ? this.items.get(this.items.length - 1) : undefined; }
  get size() { return this.items.length; }
  toArray() { return this.items.toArray(); }
}

class Queue {
  constructor() { this.list = new LinkedList(); }
  enqueue(v) { this.list.append(v); }
  dequeue() { return this.list.removeHead(); }
  front() { return this.list.head ? this.list.head.value : undefined; }
  get size() { return this.list.size; }
  toArray() { return this.list.toArray(); }
}

module.exports = { MyArray, LinkedList, Stack, Queue };