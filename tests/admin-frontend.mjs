/**
 * Frontend logic test for admin/admin.js.
 * Extracts and tests the core auth-handling functions with a minimal DOM stub.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// ─── Minimal DOM stub ─────────────────────────────────────────────────────────

const elements = {};
function makeEl(id) {
  return {
    id,
    textContent: "",
    className: "",
    classList: {
      _classes: new Set(),
      add(c)      { this._classes.add(c); },
      remove(c)   { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
    },
    disabled: false,
  };
}
for (const id of [
  "btn-open-create", "current-user", "create-manager-note", "filter-mine",
  "btn-refresh", "loading", "error", "empty", "list",
  "app-error", "app-error-msg", "app-error-code", "app-error-retry",
]) {
  elements[id] = makeEl(id);
}
elements["loading"].classList.add("visible");  // starts visible

globalThis.document = {
  getElementById: (id) => elements[id] || null,
  addEventListener: () => {},
};
globalThis.window = {
  addEventListener: () => {},
  location: { reload: () => {} },
};
// Suppress console.warn/error from el() and handleAuthError during tests
const warnings = [];
const errors   = [];
const origWarn  = console.warn;
const origError = console.error;
console.warn  = (...a) => warnings.push(a.join(" "));
console.error = (...a) => errors.push(a.join(" "));

// ─── Extract functions from admin.js ─────────────────────────────────────────

const src = await readFile(new URL("../admin/admin.js", import.meta.url), "utf8");

// Replace DOMContentLoaded binding (we don't need it here) and window.addEventListener
// to avoid parse issues, then eval inside a function that returns what we need.
function stripBlock(code, startStr) {
  const idx = code.indexOf(startStr);
  if (idx === -1) return code;
  // Walk forward from startStr to find the matching closing ");"
  let depth = 0, i = idx;
  while (i < code.length) {
    if (code[i] === "(" || code[i] === "{") depth++;
    else if (code[i] === ")" || code[i] === "}") {
      depth--;
      if (depth === 0) {
        // consume the ";" after ")"
        let end = i + 1;
        while (end < code.length && code[end] === ";") end++;
        return code.slice(0, idx) + code.slice(end);
      }
    }
    i++;
  }
  return code;
}

let stripped = src;
stripped = stripBlock(stripped, 'document.addEventListener("DOMContentLoaded"');
stripped = stripBlock(stripped, 'window.addEventListener("error"');
stripped = stripBlock(stripped, 'window.addEventListener("unhandledrejection"');

const extract = new Function(`
  "use strict";
  ${stripped}
  return { loadCurrentUser, showAppError, handleAuthError, el, show, hide };
`);

const fns = extract();

// ─── Reset helper ─────────────────────────────────────────────────────────────

function reset() {
  for (const el of Object.values(elements)) {
    el.textContent = "";
    el.className = "";
    el.classList._classes = new Set();
    el.disabled = false;
  }
  elements["loading"].classList.add("visible");
  elements["app-error"].classList.add("hidden");
  warnings.length = 0;
  errors.length   = 0;
}

function mockFetch(status, body) {
  globalThis.fetch = async () => new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isHidden(id)  { return  elements[id].classList.contains("hidden"); }
function isVisible(id) { return !elements[id].classList.contains("hidden"); }

// ─── Test runner ──────────────────────────────────────────────────────────────

let passed = 0, failed = 0;
async function run(name, fn) {
  reset();
  try {
    await fn();
    console.log = origWarn; // restore for progress output
    origWarn.call(console, "  ✓ " + name);
    passed++;
  } catch (err) {
    origError.call(console, "  ✗ " + name + ": " + err.message);
    failed++;
  } finally {
    console.warn  = (...a) => warnings.push(a.join(" "));
    console.error = (...a) => errors.push(a.join(" "));
  }
}

origWarn.call(console, "Frontend tests starting...");

// ─── Test 1: 200 OK ───────────────────────────────────────────────────────────

await run("200: currentUser set, button re-enabled, #current-user shows name", async () => {
  elements["btn-open-create"].disabled = true;
  mockFetch(200, { ok: true, name: "Анна", email: "anna@serenity.agency" });
  await fns.loadCurrentUser();
  assert.equal(elements["current-user"].textContent, "Вы вошли как: Анна · anna@serenity.agency");
  assert.equal(elements["btn-open-create"].disabled, false);
  assert.ok(isHidden("app-error"), "#app-error должен быть скрыт");
  assert.ok(!errors.some(e => e.includes("[admin]")), "не должно быть ошибок в консоли");
});

// ─── Test 2: 401 session_expired ─────────────────────────────────────────────

await run("401: #app-error показан, текст из API, #loading скрыт, код = session_expired", async () => {
  mockFetch(401, { ok: false, message: "Сессия доступа закончилась. Войдите через Google еще раз." });
  await fns.loadCurrentUser();
  assert.ok(isVisible("app-error"),  "#app-error должен быть виден");
  assert.ok(elements["app-error-msg"].textContent.includes("Сессия"), "сообщение про сессию");
  assert.ok(elements["app-error-code"].textContent.includes("session_expired"), "код ошибки");
  assert.ok(isHidden("loading"), "#loading должен быть скрыт");
  assert.ok(isHidden("app-error") === false, "#app-error не должен быть скрыт");
  assert.ok(errors.some(e => e.includes("session_expired")), "console.error вызван с кодом");
});

// ─── Test 3: 403 access_denied ───────────────────────────────────────────────

await run("403: #app-error с сообщением про вайтлист, код = access_denied", async () => {
  mockFetch(403, { ok: false, message: "Ваш email разрешен в Cloudflare Access, но не добавлен в список менеджеров Serenity." });
  await fns.loadCurrentUser();
  assert.ok(isVisible("app-error"), "#app-error виден");
  assert.ok(elements["app-error-msg"].textContent.includes("не добавлен"), "текст про вайтлист");
  assert.ok(elements["app-error-code"].textContent.includes("access_denied"), "код ошибки");
  assert.ok(isHidden("loading"), "#loading скрыт");
});

// ─── Test 4: 500 server error (non-fatal) ────────────────────────────────────

await run("500: #app-error скрыт, ошибка в #current-user с классом user-error", async () => {
  mockFetch(500, { ok: false, message: "Internal Server Error" });
  await fns.loadCurrentUser();
  assert.ok(isHidden("app-error"), "#app-error скрыт для 5xx");
  assert.ok(elements["current-user"].textContent.includes("Сервис"), "текст о временной недоступности");
  assert.ok(elements["current-user"].classList.contains("user-error"), "класс user-error в заголовке");
});

// ─── Test 5: Network error (non-fatal) ───────────────────────────────────────

await run("Network error: #app-error скрыт, ошибка в #current-user", async () => {
  globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
  await fns.loadCurrentUser();
  assert.ok(isHidden("app-error"), "#app-error скрыт для network_error");
  assert.ok(elements["current-user"].textContent.includes("соединиться"), "текст network error");
  assert.ok(elements["current-user"].classList.contains("user-error"), "класс user-error");
});

// ─── Test 6: showAppError с отсутствующими элементами ───────────────────────

await run("showAppError: не бросает TypeError, когда элементы отсутствуют в DOM", () => {
  const saved = globalThis.document.getElementById;
  globalThis.document.getElementById = () => null;
  try {
    fns.showAppError("Test message", "test_code"); // must not throw
  } finally {
    globalThis.document.getElementById = saved;
  }
});

// ─── Test 7: handleAuthError с отсутствующим #current-user ──────────────────

await run("handleAuthError(non-fatal): не бросает, когда #current-user отсутствует", () => {
  const saved = elements["current-user"];
  delete elements["current-user"];
  try {
    fns.handleAuthError("auth_error", "msg", "detail"); // must not throw
  } finally {
    elements["current-user"] = saved;
  }
  assert.ok(warnings.some(w => w.includes("current-user")), "console.warn про отсутствующий элемент");
});

// ─── Test 8: el() возвращает null без исключения ─────────────────────────────

await run("el(): возвращает null для несуществующего элемента, не бросает", () => {
  const result = fns.el("nonexistent-element-xyz");
  assert.equal(result, null);
  assert.ok(warnings.some(w => w.includes("nonexistent-element-xyz")), "console.warn с именем элемента");
});

// ─── Summary ─────────────────────────────────────────────────────────────────

console.warn = origWarn;
console.error = origError;
console.log(`\nFrontend tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
