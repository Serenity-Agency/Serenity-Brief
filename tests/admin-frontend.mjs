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
      toggle(c, force) {
        if (force === undefined ? !this._classes.has(c) : force) this._classes.add(c);
        else this._classes.delete(c);
      },
    },
    disabled: false,
    checked: false,
    innerHTML: "",
    querySelectorAll: () => [],
  };
}
for (const id of [
  "btn-open-create", "current-user", "create-manager-note", "filter-mine",
  "btn-refresh", "btn-refresh-sessions", "session-list", "loading", "error", "empty", "list",
  "session-filters", "count-action-required", "count-waiting-client", "count-archive",
  "brief-journal", "journal-body", "btn-toggle-journal", "show-all-briefs", "loaded-at", "stats",
  "create-warning", "btn-open-duplicate", "btn-create-duplicate",
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
  function __setState(next) {
    briefs = next.briefs || [];
    briefSessions = next.briefSessions || [];
    sessionFilter = next.sessionFilter || "action_required";
    journalOpen = Boolean(next.journalOpen);
    showAllBriefs = Boolean(next.showAllBriefs);
    currentFilter = next.currentFilter || "all";
    currentSearch = next.currentSearch || "";
  }
  return { loadCurrentUser, loadBriefs, renderSessions, renderList, showAppError, handleAuthError, el, show, hide, __setState };
`);

const fns = extract();
const { loadBriefs } = fns;

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

// ─── Test 4: 500 от /me — фатальный ─────────────────────────────────────────

await run("/me 500: #app-error показан, текст 'обновить страницу', loading скрыт", async () => {
  mockFetch(500, { ok: false, message: "Internal Server Error" });
  await fns.loadCurrentUser();
  assert.ok(isVisible("app-error"), "#app-error должен быть виден");
  assert.ok(elements["app-error-msg"].textContent.includes("обновить страницу"), "текст с 'обновить страницу'");
  assert.ok(elements["app-error-code"].textContent.includes("auth_error"), "код ошибки auth_error");
  assert.ok(isHidden("loading"), "#loading скрыт");
});

// ─── Test 5: Network error от /me — фатальный ────────────────────────────────

await run("/me network error: #app-error показан, loading скрыт", async () => {
  globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
  await fns.loadCurrentUser();
  assert.ok(isVisible("app-error"), "#app-error должен быть виден");
  assert.ok(elements["app-error-msg"].textContent.includes("соединиться"), "текст network error");
  assert.ok(elements["app-error-code"].textContent.includes("network_error"), "код ошибки");
  assert.ok(isHidden("loading"), "#loading скрыт");
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

// ─── Test 7: handleAuthError всегда показывает #app-error ───────────────────

await run("handleAuthError: всегда вызывает showAppError, не бросает", () => {
  fns.handleAuthError("auth_error", "Тест сообщение", "tech detail");
  assert.ok(isVisible("app-error"), "#app-error показан");
  assert.ok(elements["app-error-msg"].textContent.includes("Тест"), "текст передан в #app-error-msg");
  assert.ok(elements["app-error-code"].textContent.includes("auth_error"), "код ошибки в #app-error-code");
  assert.ok(errors.some(e => e.includes("auth_error")), "console.error вызван с кодом");
});

// ─── Test 8: el() возвращает null без исключения ─────────────────────────────

await run("el(): возвращает null для несуществующего элемента, не бросает", () => {
  const result = fns.el("nonexistent-element-xyz");
  assert.equal(result, null);
  assert.ok(warnings.some(w => w.includes("nonexistent-element-xyz")), "console.warn с именем элемента");
});

// ─── Test 9: /api/admin/briefs 500 — нефатальный (интерфейс остаётся) ────────

await run("/briefs 500: #app-error скрыт, inline #error показан", async () => {
  // Успешная авторизация — me возвращает 200
  mockFetch(200, { ok: true, name: "Анна", email: "anna@serenity.agency" });
  await fns.loadCurrentUser();
  assert.ok(isHidden("app-error"), "#app-error скрыт после успешного /me");

  // Затем briefs возвращает 500
  mockFetch(500, { ok: false, message: "Внутренняя ошибка сервера" });
  await fns.loadBriefs();

  assert.ok(isHidden("app-error"), "#app-error скрыт — ошибка briefs нефатальна");
  assert.ok(isVisible("error"),    "#error виден — inline-ошибка в блоке брифов");
  assert.ok(isHidden("loading"),   "#loading скрыт после завершения запроса");
});

// ─── Test 10: session без submission → одна карточка с рабочим названием ───

await run("request queue: session без submission показывает рабочее название", () => {
  fns.__setState({
    sessionFilter: "waiting_client",
    briefSessions: [{
      token: "s1",
      briefId: "primary",
      clientName: "Запуск MVP",
      status: "created",
      createdBy: "Анна",
      createdAt: "2026-07-16T09:00:00Z",
      url: "https://brief.example/?session=s1"
    }]
  });
  fns.renderSessions();
  assert.ok(elements["session-list"].innerHTML.includes("Запуск MVP"), "рабочее название показано");
  assert.ok(elements["session-list"].innerHTML.includes("Скопировать ссылку"), "главное действие — скопировать ссылку");
});

// ─── Test 11: session со связанным brief → заголовок из брифа ───────────────

await run("request queue: связанный brief заменяет заголовок на компанию", () => {
  fns.__setState({
    briefs: [{ submissionId: "b1", company: "Fashionmart.jp", responsible: "Анна", docUrl: "https://docs.example/doc" }],
    briefSessions: [{
      token: "s1",
      briefId: "primary",
      clientName: "Запуск MVP",
      status: "filled",
      submissionId: "b1",
      createdBy: "Анна",
      createdAt: "2026-07-16T09:00:00Z"
    }]
  });
  fns.renderSessions();
  const html = elements["session-list"].innerHTML;
  assert.ok(html.includes("Fashionmart.jp"), "основное название из брифа");
  assert.ok(html.includes("Рабочее название: Запуск MVP"), "рабочее название вторично");
  assert.ok(html.includes("Проверьте название"), "разные названия требуют мягкой проверки");
  assert.ok(html.includes("Создать Workspace"), "главное действие — создать Workspace");
});

// ─── Test 12: связанный brief не дублируется в журнале по умолчанию ─────────

await run("journal: связанный brief скрыт по умолчанию", () => {
  fns.__setState({
    journalOpen: true,
    briefs: [
      { submissionId: "b1", company: "Fashionmart.jp", status: "Новая" },
      { submissionId: "b2", company: "Новый клиент", status: "Новая" }
    ],
    briefSessions: [{ token: "s1", clientName: "Запуск MVP", submissionId: "b1", status: "filled" }]
  });
  fns.renderList();
  const html = elements["list"].innerHTML;
  assert.ok(!html.includes("Fashionmart.jp"), "связанный brief скрыт");
  assert.ok(html.includes("Новый клиент"), "несвязанный brief остается в журнале");
});

// ─── Test 13: Показать все возвращает полный журнал ─────────────────────────

await run("journal: Показать все возвращает связанные briefs", () => {
  fns.__setState({
    journalOpen: true,
    showAllBriefs: true,
    briefs: [
      { submissionId: "b1", company: "Fashionmart.jp", status: "Новая" },
      { submissionId: "b2", company: "Новый клиент", status: "Новая" }
    ],
    briefSessions: [{ token: "s1", clientName: "Запуск MVP", submissionId: "b1", status: "filled" }]
  });
  fns.renderList();
  const html = elements["list"].innerHTML;
  assert.ok(html.includes("Fashionmart.jp"), "связанный brief вернулся");
  assert.ok(html.includes("Новый клиент"), "несвязанный brief остался");
});

// ─── Test 14: Workspace меняет главное действие ─────────────────────────────

await run("request queue: Workspace меняет главное действие на открыть", () => {
  fns.__setState({
    briefs: [{ submissionId: "b1", company: "Fashionmart.jp" }],
    briefSessions: [{
      token: "s1",
      clientName: "Запуск MVP",
      submissionId: "b1",
      status: "filled",
      portalWorkspace: { workspace_url: "https://portal.example/app/?workspace=w1" }
    }]
  });
  fns.renderSessions();
  const html = elements["session-list"].innerHTML;
  assert.ok(html.includes("Открыть Workspace"), "главное действие — открыть Workspace");
  assert.ok(!html.includes("Создать Workspace"), "создание больше не показывается главным действием");
});

// ─── Test 15: разные названия не создают вторую карточку ────────────────────

await run("request queue: разные названия остаются одной карточкой", () => {
  fns.__setState({
    briefs: [{ submissionId: "b1", company: "crochet.internet" }],
    briefSessions: [{ token: "s1", clientName: "Варвара SMM", submissionId: "b1", status: "filled" }]
  });
  fns.renderSessions();
  const html = elements["session-list"].innerHTML;
  assert.equal((html.match(/session-card/g) || []).length, 1);
  assert.ok(html.includes("crochet.internet"));
  assert.ok(html.includes("Рабочее название: Варвара SMM"));
});

// ─── Test 16: фильтры очереди продолжают работать ───────────────────────────

await run("request queue: фильтры Требуют действий / Ожидают клиента / Архив работают", () => {
  fns.__setState({
    sessionFilter: "waiting_client",
    briefSessions: [
      { token: "wait", clientName: "Ждет клиента", status: "created" },
      { token: "filled", clientName: "Заполнен", status: "filled", submissionId: "b1" },
      { token: "arch", clientName: "Архив", status: "filled", archived: true }
    ]
  });
  fns.renderSessions();
  assert.ok(elements["session-list"].innerHTML.includes("Ждет клиента"));
  assert.ok(!elements["session-list"].innerHTML.includes("Заполнен"));
  assert.ok(!elements["session-list"].innerHTML.includes("Архив"));

  fns.__setState({
    sessionFilter: "action_required",
    briefSessions: [
      { token: "wait", clientName: "Ждет клиента", status: "created" },
      { token: "filled", clientName: "Заполнен", status: "filled", submissionId: "b1" },
      { token: "arch", clientName: "Архив", status: "filled", archived: true }
    ]
  });
  fns.renderSessions();
  assert.ok(!elements["session-list"].innerHTML.includes("Ждет клиента"));
  assert.ok(elements["session-list"].innerHTML.includes("Заполнен"));

  fns.__setState({
    sessionFilter: "archive",
    briefSessions: [
      { token: "wait", clientName: "Ждет клиента", status: "created" },
      { token: "filled", clientName: "Заполнен", status: "filled", submissionId: "b1" },
      { token: "arch", clientName: "Архив", status: "filled", archived: true }
    ]
  });
  fns.renderSessions();
  assert.ok(elements["session-list"].innerHTML.includes("Архив"));
  assert.ok(!elements["session-list"].innerHTML.includes("Заполнен"));
});

// ─── Summary ─────────────────────────────────────────────────────────────────

console.warn = origWarn;
console.error = origError;
console.log(`\nFrontend tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
