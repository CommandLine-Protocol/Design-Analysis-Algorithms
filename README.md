# Design and Analysis of Algorithms
Group Work and Project

## Members
- Matthias Imani ([@CommandLine-Protocol](https://github.com/CommandLine-Protocol))
- Tyra Bangirana ([@Hellen684](https://github.com/Hellen684))
- Alum Susan ([@Alum-Susan](https://github.com/Alum-Susan))
- Shalom Asiimwe ([@print-shalom](https://github.com/print-shalom))
- Emilly Sendikaddiwa ([@emillysendi](https://github.com/emillysendi))

<br>
Experience the interactive Algorithm Explorer live on GitHub Pages:

[![Live Demo](https://img.shields.io/badge/▶_LIVE_DEMO-Launch_Algorithm_Explorer-00E676?style=for-the-badge&logo=googlechrome&logoColor=white)](https://commandline-protocol.github.io/Design-Analysis-Algorithms/algorithms_explorer/)

[https://commandline-protocol.github.io/Design-Analysis-Algorithms/algorithms_explorer/](https://commandline-protocol.github.io/Design-Analysis-Algorithms/algorithms_explorer/)

---

## Prerequisites

Before running the project locally, ensure you have the following installed:

- **Node.js**: Version `16.0.0` or higher (Recommended: Node.js `v18.x` or `v20.x`+ LTS)
  - Download and installation instructions: [https://nodejs.org/](https://nodejs.org/) (Official Node.js Site)
- **Web Browser**: Any modern browser (Google Chrome, Firefox, Microsoft Edge, Safari)
- **Zero External Dependencies**: The project uses native Node.js core modules (`http`, `fs`, `path`, `assert`), so no `npm install` is required.

---

## Architecture Overview

The `algorithms_explorer` application is built with a modular, lightweight architecture split into four core application files and a dedicated automated test suite:

### Core Files

1. **`algorithms_explorer/index.html` (Frontend UI & Visualizer)**
   - **Use Case**: Serves as the interactive single-page dashboard for students and instructors.
   - **Details**: Provides visual interfaces for exploring Recursion (Fibonacci, Factorial, Tower of Hanoi), Data Structures (Stacks, Queues, Linked Lists, Bracket Validation), Sorting algorithms, and Benchmark comparisons. It includes step-by-step playback controls, live metrics, and real-time execution toggles between browser-client mode and Node.js server mode.

2. **`algorithms_explorer/server.js` (HTTP & API Backend Server)**
   - **Use Case**: Delivers local web hosting and server-side algorithm benchmarking.
   - **Details**: Implemented with native Node.js `http` and `fs` modules with zero external dependencies. Serves static files (`.html`, `.js`, `.css`) and exposes the `POST /api/run` REST endpoint to execute algorithmic workloads and performance timings on the Node.js runtime.

3. **`algorithms_explorer/algorithms.js` (Algorithmic Logic & Execution Engine)**
   - **Use Case**: Core logic engine for algorithmic execution, tracing, and timing.
   - **Details**: Contains pure implementations of recursive algorithms (naive, memoized, bottom-up DP), sorting routines (Bubble, Selection, Insertion, Merge, QuickSort variants), high-resolution timing harnesses (`timeIt`), and step-by-step state recording (`Recorder`) for frontend visual replay. Can execute in both Node.js and browser environments.

4. **`algorithms_explorer/ds.js` (Data Structures Implementations)**
   - **Use Case**: Foundation module containing custom implementations of fundamental data structures.
   - **Details**: Implements fixed-capacity Array Stack (`ArrayStack`), Linear Queue with false-full behavior (`ArrayLinearQueue`), Circular Queue with modulo indexing (`ArrayCircularQueue`), Singly Linked List (`SinglyLinkedList`), Doubly Linked List (`DoublyLinkedList`), and a bracket balancing algorithm (`checkBalancedBrackets`).

### Test Suite

- **`algorithms_explorer/test_algorithms.js` (Automated Test Suite)**
  - **Use Case**: Verifies correctness, edge cases, error conditions, and performance across all algorithms and data structures.
  - **Details**: Uses Node.js's built-in `assert` module to test recursive equivalence, stack overflow/underflow, linear vs circular queue full states, linked list head/tail/position insertions and deletions, and sorting algorithm correctness across randomized datasets.

---

## Running Locally

### 1. Launch the Server

Navigate to the `algorithms_explorer` directory and start the server:

```bash
cd algorithms_explorer
node server.js
```

Or from the project root:

```bash
node algorithms_explorer/server.js
```

### 2. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

---

## Running Tests

To run the automated test suite and verify all algorithms and data structure operations:

```bash
node algorithms_explorer/test_algorithms.js
```
