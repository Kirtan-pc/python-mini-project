/**
 * playground.js  –  Python Playground powered by Pyodide
 *
 * Architecture
 * ─────────────────────────────────────────────────────────────────
 *  • window.PYODIDE          – global singleton (instance/ready/loading)
 *  • window.playgroundAPI    – consumed by main.js for tab show/hide
 *  • initPyodide()           – idempotent; never called more than once
 *  • runCode()               – always async; waits without freezing UI
 *
 * Zero conflicts with the modal system or existing project scripts.
 */
(function () {
    'use strict';

    /* ================================================================
       1.  GLOBAL PYODIDE SINGLETON
       Exposed on window so any external script can read readiness.
    ================================================================ */
    window.PYODIDE = {
        instance : null,   // the loaded Pyodide runtime object
        ready    : false,  // true once stdlib buffers are wired up
        loading  : false   // true while boot sequence is in progress
    };

    /* ================================================================
       2.  CONSTANTS
    ================================================================ */
    var PYODIDE_VERSION = '0.26.2';
    var PYODIDE_CDN     = 'https://cdn.jsdelivr.net/pyodide/v' + PYODIDE_VERSION + '/full/';
    var PYODIDE_SCRIPT  = PYODIDE_CDN + 'pyodide.js';

    /* ================================================================
       3.  EXAMPLE CODE SNIPPETS
    ================================================================ */
    var EXAMPLES = [
        /* 0 – Hello World */
        '# \uD83D\uDC4B Hello, Python Playground!\n' +
        'name = "World"\n' +
        'greeting = f"Hello, {name}!"\n' +
        'print(greeting)\n\n' +
        'for i in range(1, 6):\n' +
        '    print("  " + "\u2B50" * i)',

        /* 1 – Fibonacci */
        '# \uD83D\uDD22 Fibonacci Sequence\n' +
        'def fibonacci(n):\n' +
        '    a, b = 0, 1\n' +
        '    result = []\n' +
        '    for _ in range(n):\n' +
        '        result.append(a)\n' +
        '        a, b = b, a + b\n' +
        '    return result\n\n' +
        'fibs = fibonacci(15)\n' +
        'print("Fibonacci (first 15):", fibs)\n' +
        'print("Sum:", sum(fibs))',

        /* 2 – Sieve of Eratosthenes */
        '# \uD83D\uDD0D Sieve of Eratosthenes\n' +
        'def sieve(limit):\n' +
        '    is_prime = [True] * (limit + 1)\n' +
        '    is_prime[0] = is_prime[1] = False\n' +
        '    for i in range(2, int(limit ** 0.5) + 1):\n' +
        '        if is_prime[i]:\n' +
        '            for j in range(i * i, limit + 1, i):\n' +
        '                is_prime[j] = False\n' +
        '    return [n for n in range(2, limit + 1) if is_prime[n]]\n\n' +
        'primes = sieve(50)\n' +
        'print(f"Primes up to 50 ({len(primes)} found):")\n' +
        'print(primes)',

        /* 3 – Statistics (stdlib) */
        '# \uD83D\uDCCA Basic Statistics (stdlib only)\n' +
        'import statistics\n\n' +
        'data = [23, 45, 12, 67, 34, 89, 56, 11, 78, 42]\n' +
        'print(f"Data   : {sorted(data)}")\n' +
        'print(f"Mean   : {statistics.mean(data):.2f}")\n' +
        'print(f"Median : {statistics.median(data)}")\n' +
        'print(f"Stdev  : {statistics.stdev(data):.2f}")\n' +
        'print(f"Min/Max: {min(data)} / {max(data)}")',

        /* 4 – Recursion */
        '# \uD83D\uDD04 Recursion: Factorial\n' +
        'def factorial(n):\n' +
        '    if n <= 1:\n' +
        '        return 1\n' +
        '    return n * factorial(n - 1)\n\n' +
        'for n in range(1, 11):\n' +
        '    print(f"  {n:2d}! = {factorial(n):10,}")',

        /* 5 – List comprehensions */
        '# \uD83E\uDDE9 List Comprehensions\n' +
        'words = ["banana", "apple", "cherry", "date", "elderberry", "fig"]\n\n' +
        'by_length = sorted(words, key=len)\n' +
        'print("Sorted by length:")\n' +
        'for w in by_length:\n' +
        '    bar = chr(9608) * len(w)\n' +
        '    print(f"  {bar}  {w} ({len(w)})")\n\n' +
        'palindromes = [w for w in words if w == w[::-1]]\n' +
        'print("\\nPalindromes:", palindromes or "none found")'
    ];

    var exampleIdx = 0;

    /* ================================================================
       4.  DOM REFERENCES
    ================================================================ */
    function $id(id) { return document.getElementById(id); }

    var playgroundSection = $id('playgroundSection');
    var runBtn            = $id('runCode');
    var editor            = $id('pythonEditor');
    var consoleEl         = $id('consoleOutput');
    var statusDot         = $id('statusDot');
    var statusText        = $id('statusText');
    var clearConsoleBtn   = $id('clearConsole');
    var clearEditorBtn    = $id('clearEditor');
    var loadExampleBtn    = $id('loadExample');

    /* Guard – abort gracefully if playground HTML is absent */
    if (!playgroundSection || !runBtn || !editor || !consoleEl) {
        console.warn('[playground.js] Required DOM elements not found — playground disabled.');
        return;
    }

    /* ================================================================
       5.  UI HELPER FUNCTIONS
    ================================================================ */

    /**
     * Update the status badge.
     * @param {'idle'|'loading'|'ready'|'error'} state
     * @param {string} label
     */
    function setStatus(state, label) {
        if (statusDot)  statusDot.className    = 'status-dot ' + state;
        if (statusText) statusText.textContent = label;
    }

    /** Reset the console to its initial placeholder state. */
    function resetConsole() {
        consoleEl.innerHTML =
            '<span class="pg-placeholder">' +
            '&gt;&gt;&gt; Console output will appear here\u2026' +
            '</span>';
    }

    /**
     * Append a single output line to the console.
     * @param {string} text
     * @param {'out'|'err'|'info'} type
     */
    function printLine(text, type) {
        /* Remove placeholder on first real output */
        var ph = consoleEl.querySelector('.pg-placeholder');
        if (ph) ph.remove();

        var colorMap = {
            out  : '#c9d1d9',   /* near-white  – normal stdout   */
            err  : '#ff7b72',   /* red         – exceptions/stderr */
            info : '#79c0ff'    /* blue        – meta messages    */
        };
        var span          = document.createElement('span');
        span.style.color      = colorMap[type] || colorMap.out;
        span.style.display    = 'block';
        span.style.whiteSpace = 'pre-wrap';
        span.style.wordBreak  = 'break-word';
        span.textContent      = text;

        consoleEl.appendChild(span);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    /**
     * Update the Run button visual state.
     * @param {boolean} busy – true while Python is executing
     */
    function setRunBtnState(busy) {
        /*
         * When not busy: disabled only if Pyodide is not ready yet.
         * Once Pyodide is ready the button stays enabled between runs.
         */
        runBtn.disabled = busy;
        runBtn.innerHTML = busy
            ? '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Running\u2026'
            : '<i class="fas fa-play" aria-hidden="true"></i> Run Code';
    }

    /* ================================================================
       6.  PYODIDE SCRIPT INJECTION  (one-time, non-blocking)
    ================================================================ */

    /**
     * Dynamically inject the Pyodide CDN script.
     * Resolves immediately if window.loadPyodide already exists.
     */
    function injectPyodideScript() {
        return new Promise(function (resolve, reject) {
            if (typeof window.loadPyodide === 'function') { resolve(); return; }
            var script    = document.createElement('script');
            script.src    = PYODIDE_SCRIPT;
            script.async  = true;
            script.onload = resolve;
            script.onerror = function () {
                reject(new Error(
                    'Failed to download the Pyodide script. ' +
                    'Please check your internet connection and reload.'
                ));
            };
            document.head.appendChild(script);
        });
    }

    /* ================================================================
       7.  PYODIDE INITIALISATION  (idempotent singleton)

       • Safe to call multiple times – only the first call does work.
       • Runs entirely in async microtasks; never blocks the event loop.
       • Sets window.PYODIDE.loading = true BEFORE any await so a second
         call sees the flag and returns immediately.
    ================================================================ */

    async function initPyodide() {
        /* Already done or already in progress → no-op */
        if (window.PYODIDE.ready || window.PYODIDE.loading) return;

        window.PYODIDE.loading = true;
        setStatus('loading', 'Downloading Pyodide\u2026');
        printLine(
            '\u23F3 Loading Python runtime (first load ~8 MB). ' +
            'This may take a moment on slow connections\u2026',
            'info'
        );

        try {
            /* ── Step 1: inject the CDN <script> ── */
            await injectPyodideScript();
            setStatus('loading', 'Initialising Python\u2026');

            /* ── Step 2: boot the WASM runtime ── */
            window.PYODIDE.instance = await window.loadPyodide({ indexURL: PYODIDE_CDN });

            /* ── Step 3: wire stdout / stderr to StringIO buffers ── */
            window.PYODIDE.instance.runPython(
                'import sys, io\n' +
                'sys.stdout = io.StringIO()\n' +
                'sys.stderr = io.StringIO()\n'
            );

            /* ── Mark ready ── */
            window.PYODIDE.ready   = true;
            window.PYODIDE.loading = false;

            setStatus('ready', 'Pyodide Ready \u2713');
            printLine('\u2705 Python is ready \u2014 write some code and press Run Code!', 'info');

            /* Enable the Run button only after Pyodide is confirmed ready */
            runBtn.disabled = false;

        } catch (err) {
            window.PYODIDE.loading = false;
            setStatus('error', 'Load failed \u2717');
            printLine(
                '\u274C Pyodide failed to load: ' + (err.message || String(err)),
                'err'
            );
        }
    }

    /* ================================================================
       8.  NON-BLOCKING WAIT FOR PYODIDE

       Polls window.PYODIDE.ready every 250 ms.
       Rejects after timeoutMs (default 120 s).
       Uses setTimeout so the event loop remains free.
    ================================================================ */

    function waitForPyodide(timeoutMs) {
        timeoutMs = timeoutMs || 120000;
        return new Promise(function (resolve, reject) {
            if (window.PYODIDE.ready) { resolve(); return; }
            var deadline = Date.now() + timeoutMs;
            (function poll() {
                if (window.PYODIDE.ready) { resolve(); return; }
                if (Date.now() > deadline) {
                    reject(new Error(
                        'Timed out waiting for Pyodide (' +
                        Math.round(timeoutMs / 1000) + ' s). ' +
                        'Reload the page and try again.'
                    ));
                    return;
                }
                setTimeout(poll, 250);
            }());
        });
    }

    /* ================================================================
       9.  SAFE BUFFER RESET

       Truncates stdout/stderr before each run.
       Falls back to fresh StringIO objects if the buffers were replaced
       by user code (e.g., someone did sys.stdout = something_else).
    ================================================================ */

    function resetBuffers() {
        if (!window.PYODIDE || !window.PYODIDE.instance) return;
        try {
            window.PYODIDE.instance.runPython(
                'try:\n' +
                '    sys.stdout.seek(0); sys.stdout.truncate(0)\n' +
                '    sys.stderr.seek(0); sys.stderr.truncate(0)\n' +
                'except Exception:\n' +
                '    import io\n' +
                '    sys.stdout = io.StringIO()\n' +
                '    sys.stderr = io.StringIO()\n'
            );
        } catch (_) {
            /* Swallow: even if this fails the output will still be captured */
        }
    }

    /* ================================================================
       10.  RUN CODE

       CONTRACT:
       • Never freezes the UI.
       • If Pyodide is still loading, waits asynchronously and then runs.
       • If Pyodide failed to load, reports the error without crashing.
       • Captures stdout, stderr, and Python runtime exceptions.
    ================================================================ */

    async function runCode() {
        var code = editor.value;
        if (!code.trim()) {
            printLine('\u2139 Nothing to run \u2014 write some Python first!', 'info');
            return;
        }

        /* Lock UI immediately so the user has visual feedback */
        setRunBtnState(true);

        try {
            /* ── If not ready: ensure init is running, then wait ── */
            if (!window.PYODIDE.ready) {
                printLine('\u23F3 Python runtime is loading \u2014 please wait\u2026', 'info');
                /*
                 * Kick off initialisation if nothing has started yet.
                 * (playgroundAPI.activate() should already have done this,
                 *  but we guard here too for direct "Run" clicks.)
                 */
                if (!window.PYODIDE.loading) initPyodide();
                await waitForPyodide();
            }

            var py = window.PYODIDE.instance;

            /* ── Clear output buffers before this run ── */
            resetBuffers();
            printLine('&gt;&gt;&gt; Running\u2026', 'info');

            /* ── Execute (async: yields control; modal / UI stays responsive) ── */
            await py.runPythonAsync(code);

            /* ── Harvest captured output ── */
            var stdout = py.runPython('sys.stdout.getvalue()');
            var stderr = py.runPython('sys.stderr.getvalue()');

            if (stdout) printLine(stdout.trimEnd(), 'out');
            if (stderr) printLine(stderr.trimEnd(), 'err');
            if (!stdout && !stderr) printLine('(no output)', 'info');

        } catch (err) {
            /*
             * Pyodide wraps Python tracebacks inside the JS Error message.
             * Print the raw message so the user sees the full traceback.
             */
            printLine(err.message || String(err), 'err');
        } finally {
            /* Always re-enable the Run button after execution ends */
            setRunBtnState(false);
            /* Keep button disabled only if Pyodide never loaded */
            if (!window.PYODIDE.ready) runBtn.disabled = true;
        }
    }

    /* ================================================================
       11.  PUBLIC API
       Called by main.js when the user switches tabs.
       Keeps tab logic centralised in main.js; playground.js owns Pyodide.
    ================================================================ */

    window.playgroundAPI = {
        /**
         * Show the playground section.
         * Triggers Pyodide initialisation the first time.
         */
        activate: function () {
            playgroundSection.style.display = 'block';
            /* Start loading Pyodide lazily on first visit */
            if (!window.PYODIDE.ready && !window.PYODIDE.loading) {
                initPyodide();
            }
        },

        /** Hide the playground section. */
        deactivate: function () {
            playgroundSection.style.display = 'none';
        }
    };

    /* ================================================================
       12.  EVENT WIRING
    ================================================================ */

    /* Run button click */
    runBtn.addEventListener('click', runCode);

    /* Editor keyboard shortcuts */
    editor.addEventListener('keydown', function (e) {
        /* Ctrl/Cmd + Enter → run */
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runCode();
            return;
        }
        /* Tab key → insert 4 spaces (no focus change) */
        if (e.key === 'Tab') {
            e.preventDefault();
            var start  = editor.selectionStart;
            var end    = editor.selectionEnd;
            var spaces = '    ';
            editor.value =
                editor.value.substring(0, start) +
                spaces +
                editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + spaces.length;
        }
    });

    /* Clear console */
    if (clearConsoleBtn) {
        clearConsoleBtn.addEventListener('click', resetConsole);
    }

    /* Clear editor */
    if (clearEditorBtn) {
        clearEditorBtn.addEventListener('click', function () {
            editor.value = '';
            editor.focus();
        });
    }

    /* Cycle through built-in example snippets */
    if (loadExampleBtn) {
        loadExampleBtn.addEventListener('click', function () {
            editor.value = EXAMPLES[exampleIdx % EXAMPLES.length];
            exampleIdx++;
            editor.focus();
        });
    }

    /* ================================================================
       13.  BOOT  –  set initial state
    ================================================================ */

    playgroundSection.style.display = 'none';   /* hidden until tab click  */
    runBtn.disabled                 = true;       /* enabled after Pyodide   */
    resetConsole();
    setStatus('idle', 'Open the tab to load Python');

}());







