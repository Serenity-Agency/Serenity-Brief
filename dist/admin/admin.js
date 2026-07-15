window.addEventListener("error", function (event) {
  console.error("[admin] js_error:", event.message, "at", event.filename + ":" + event.lineno);
  try { showAppError("Не удалось загрузить интерфейс. Обновите страницу.", "js_error"); } catch (e) {}
});

window.addEventListener("unhandledrejection", function (event) {
  console.error("[admin] unhandled_rejection:", event.reason);
});

const BRIEFS = [
  ["primary", "Первичный бриф"],
  ["startup", "Стратегия для стартапа"],
  ["strategy", "Маркетинговая стратегия"],
  ["complex", "Комплексное продвижение"],
  ["performance", "Performance-реклама"],
  ["seo", "SEO и органический трафик"],
  ["smm", "SMM и контент"],
  ["website", "Бриф на сайт"],
  ["ecommerce", "Интернет-магазин"],
  ["branding", "Брендинг и фирменный стиль"],
  ["naming", "Нейминг"],
  ["pr", "PR и репутация"]
];

const BRIEF_TITLE_TO_ID = Object.fromEntries(BRIEFS.map(function (item) { return [item[1], item[0]]; }));

let briefs = [];
let currentFilter = "all";
let currentSearch = "";
let currentId = null;
let loadedAt = null;
let savedPanelState = "";
let closeAfterConfirm = null;
let currentUser = null;

document.addEventListener("DOMContentLoaded", async function () {
  try {
    initFilters();
    initSearch();
    initPanel();
    initCreateModal();
    var refreshBtn = el("btn-refresh");
    if (refreshBtn) refreshBtn.addEventListener("click", loadBriefs);
    var retryBtn = document.getElementById("app-error-retry");
    if (retryBtn) retryBtn.addEventListener("click", function () { window.location.reload(); });
    window.addEventListener("beforeunload", function (event) {
      if (!hasUnsavedChanges()) return;
      event.preventDefault();
      event.returnValue = "";
    });
    await loadCurrentUser();
    if (currentUser) loadBriefs();
  } catch (err) {
    console.error("[admin] init_error:", err);
    showAppError("Не удалось загрузить интерфейс. Обновите страницу.", "init_error");
  }
});

async function loadCurrentUser() {
  var button = el("btn-open-create");
  if (button) button.disabled = true;

  var res, data;
  try {
    res = await fetch("/api/admin/me");
    data = await res.json().catch(function () { return {}; });
  } catch (err) {
    handleAuthError("network_error", "Не удалось соединиться с сервером. Проверьте соединение и обновите страницу.", String(err));
    return;
  }

  if (res.status === 401) {
    handleAuthError("session_expired", data.message || "Сессия истекла. Выйдите и войдите снова.", null);
    return;
  }
  if (res.status === 403) {
    handleAuthError("access_denied", data.message || "Нет доступа к панели брифов.", null);
    return;
  }
  if (!res.ok || !data.ok) {
    handleAuthError("auth_error", "Сервис временно недоступен. Попробуйте обновить страницу.", data.message || String(res.status));
    return;
  }

  currentUser = { name: data.name, email: data.email };
  var userEl = el("current-user");
  if (userEl) {
    userEl.textContent = "Вы вошли как: " + data.name + " · " + data.email;
    userEl.classList.remove("user-error");
  }
  var noteEl = el("create-manager-note");
  if (noteEl) noteEl.textContent = "Ответственный: " + data.name + " · " + data.email;
  if (button) button.disabled = false;
  var mineBtn = el("filter-mine");
  if (mineBtn) mineBtn.disabled = false;
}

async function loadBriefs() {
  show("loading");
  hide("error");
  hide("empty");
  hide("list");
  var refreshBtn = el("btn-refresh");
  if (refreshBtn) refreshBtn.disabled = true;

  try {
    const res = await fetch("/api/admin/briefs");
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok || !data.ok) {
      if (res.status === 401) throw new Error("Сессия доступа закончилась. Обновите страницу и войдите снова.");
      throw new Error(data.message || "Не удалось получить данные.");
    }
    briefs = data.briefs || [];
    loadedAt = new Date();
    hide("loading");
    renderLoadedAt();
    renderStats();
    renderList();
  } catch (err) {
    hide("loading");
    showError(err.message || "Не удалось загрузить заявки.");
  } finally {
    var refreshBtn = el("btn-refresh");
    if (refreshBtn) refreshBtn.disabled = false;
  }
}

async function patchBrief(submissionId, updates) {
  const res = await fetch("/api/admin/briefs", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submissionId: submissionId, updates: updates })
  });
  const data = await res.json().catch(function () { return {}; });
  if (!res.ok || !data.ok) throw new Error(data.message || "Не удалось сохранить изменения.");
  return data;
}

function getFiltered() {
  const q = currentSearch.toLowerCase();
  return briefs.filter(function (b) {
    if (currentFilter === "new") { if (b.status !== "Новая") return false; }
    else if (currentFilter === "mine") { if (!currentUser || b.responsible !== currentUser.name) return false; }
    else if (currentFilter === "test") { if (b.status !== "Тест") return false; }
    else { if (b.status === "Тест") return false; }

    if (!q) return true;
    return (
      (b.company  || "").toLowerCase().includes(q) ||
      (b.name     || "").toLowerCase().includes(q) ||
      (b.contact  || "").toLowerCase().includes(q)
    );
  });
}

function renderStats() {
  const total = briefs.filter(function (b) { return b.status !== "Тест"; }).length;
  const newCount = briefs.filter(function (b) { return b.status === "Новая"; }).length;
  el("stats").innerHTML =
    '<span class="stat"><b>' + total + '</b> всего</span>' +
    '<span class="stat"><b class="s-new">' + newCount + '</b> новых</span>';
}

function renderList() {
  const items = getFiltered().slice().sort(function (a, b) {
    return parseDate(b.date) - parseDate(a.date);
  });

  if (!items.length) {
    hide("list");
    el("empty").textContent = emptyMessage();
    show("empty");
    return;
  }

  hide("empty");
  show("list");
  el("list").innerHTML = items.map(function (b) {
    const owner = b.responsible
      ? '<span class="card-owner">Менеджер: ' + esc(b.responsible) + '</span>'
      : '<span class="card-owner owner-missing">Менеджер не указан</span>';
    return (
      '<button class="card" type="button" data-id="' + esc(b.submissionId) + '">' +
        '<span class="card-main">' +
          '<span class="card-company">' + esc(b.company || "Без названия") + '</span>' +
          '<span class="card-meta">' + esc(b.name || "") + (b.contact ? " · " + esc(b.contact) : "") + '</span>' +
          owner +
        '</span>' +
        '<span class="card-side">' +
          (b.status === "Новая" ? '<span class="badge s-new">Новая</span>' : "") +
          '<span class="card-type">' + esc(b.briefTitle || "Бриф") + '</span>' +
          '<span class="card-date">' + esc(b.date || "") + '</span>' +
        '</span>' +
      '</button>'
    );
  }).join("");

  el("list").querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("click", function () { openPanel(card.dataset.id); });
  });
}

function emptyMessage() {
  const q = currentSearch;
  if (q) return "Ничего не найдено по запросу «" + q + "»";
  if (currentFilter === "mine") return "У вас пока нет заявок. Создайте персональную ссылку — она закрепит бриф за вами.";
  if (currentFilter === "new") return "Новых заявок нет";
  if (currentFilter === "test") return "Тестовых заявок нет";
  return "Пока нет входящих брифов";
}

function initFilters() {
  el("filters").addEventListener("click", function (event) {
    const btn = event.target.closest(".filter");
    if (!btn || btn.disabled) return;
    el("filters").querySelectorAll(".filter").forEach(function (item) { item.classList.remove("active"); });
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderList();
  });
}

function initSearch() {
  el("search").addEventListener("input", function (event) {
    currentSearch = event.target.value.trim();
    renderList();
  });
}

function initPanel() {
  el("overlay").addEventListener("click", function () {
    if (!el("create-modal").classList.contains("hidden")) {
      closeCreateModal();
      return;
    }
    requestClose();
  });
  el("panel-close").addEventListener("click", requestClose);
  el("btn-save").addEventListener("click", saveChanges);
  el("btn-doc").addEventListener("click", openDoc);
  el("btn-copy-link").addEventListener("click", copyGeneralBriefLink);
  el("btn-mark-test").addEventListener("click", toggleTest);
  ["field-responsible", "field-amo"].forEach(function (id) {
    el(id).addEventListener("input", updateDirtyState);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !el("panel").classList.contains("hidden")) requestClose();
  });
}

function openPanel(submissionId) {
  const b = briefs.find(function (item) { return item.submissionId === submissionId; });
  if (!b) return;
  currentId = submissionId;

  el("panel-title").textContent = b.company || "Заявка";
  el("panel-meta").textContent = [b.briefTitle, b.date].filter(Boolean).join(" · ");
  el("field-responsible").value = b.responsible || "";
  el("field-amo").value = b.amoLink || "";
  el("save-msg").textContent = "";
  el("test-msg").textContent = "";

  const fields = [
    ["Компания", b.company],
    ["Имя", b.name],
    ["Контакт", b.contact],
    ["Мессенджер", b.messenger],
    ["Бюджет", b.budget],
    ["Задача", b.request],
    ["Дата заполнения", b.date]
  ].filter(function (field) { return field[1]; });
  el("brief-fields").innerHTML = fields.map(function (field) {
    return '<div class="brief-field"><dt class="bf-label">' + esc(field[0]) + '</dt><dd class="bf-value">' + esc(String(field[1])) + '</dd></div>';
  }).join("");

  el("btn-doc").disabled = !b.docUrl;
  el("doc-help").textContent = b.docUrl ? "Полные ответы клиента откроются в новой вкладке." : "Google Doc для этой заявки не найден.";
  const amoButton = el("btn-amo");
  if (isHttpUrl(b.amoLink)) {
    amoButton.href = b.amoLink;
    amoButton.classList.remove("hidden");
  } else {
    amoButton.classList.add("hidden");
    amoButton.removeAttribute("href");
  }
  el("btn-mark-test").textContent = b.status === "Тест" ? "Вернуть из тестовых" : "Отметить как тестовую заявку";

  savedPanelState = panelState();
  updateDirtyState();
  show("overlay");
  el("panel").classList.remove("hidden");
  document.body.classList.add("panel-open");
  el("panel").scrollTop = 0;
}

function requestClose() {
  if (!hasUnsavedChanges()) {
    closePanel();
    return;
  }
  if (window.confirm("Есть несохраненные изменения. Закрыть карточку без сохранения?")) closePanel();
}

function closePanel() {
  hide("overlay");
  el("panel").classList.add("hidden");
  document.body.classList.remove("panel-open");
  currentId = null;
  savedPanelState = "";
  closeAfterConfirm = null;
}

async function saveChanges() {
  if (!currentId) return;
  const amoLink = el("field-amo").value.trim();
  if (amoLink && !isHttpUrl(amoLink)) {
    setMessage("save-msg", "Введите полную ссылку, начинающуюся с http:// или https://", true);
    return;
  }

  const updates = {
    responsible: el("field-responsible").value.trim(),
    amoLink: amoLink
  };
  const btn = el("btn-save");
  btn.disabled = true;
  setMessage("save-msg", "Сохраняю…");

  try {
    await patchBrief(currentId, updates);
    applyLocal(currentId, updates);
    savedPanelState = panelState();
    updateDirtyState();
    setMessage("save-msg", "Сохранено ✓");
    renderList();
    const amoButton = el("btn-amo");
    if (isHttpUrl(amoLink)) {
      amoButton.href = amoLink;
      amoButton.classList.remove("hidden");
    } else {
      amoButton.classList.add("hidden");
      amoButton.removeAttribute("href");
    }
  } catch (err) {
    setMessage("save-msg", err.message, true);
  } finally {
    btn.disabled = false;
  }
}

function openDoc() {
  const b = current();
  if (b && isHttpUrl(b.docUrl)) window.open(b.docUrl, "_blank", "noopener,noreferrer");
}

async function copyGeneralBriefLink() {
  const b = current();
  const briefId = b && BRIEF_TITLE_TO_ID[b.briefTitle];
  if (!briefId) {
    setMessage("save-msg", "Не удалось определить тип брифа.", true);
    return;
  }
  await copyText(window.location.origin + "/?brief=" + briefId, el("btn-copy-link"), "Скопировано");
}

async function toggleTest() {
  const b = current();
  if (!b) return;
  const newStatus = b.status === "Тест" ? "Новая" : "Тест";
  const btn = el("btn-mark-test");
  btn.disabled = true;
  setMessage("test-msg", "Сохраняю…");
  try {
    await patchBrief(currentId, { status: newStatus });
    applyLocal(currentId, { status: newStatus });
    btn.textContent = newStatus === "Тест" ? "Вернуть из тестовых" : "Отметить как тестовую заявку";
    setMessage("test-msg", "Готово ✓");
    renderStats();
    renderList();
  } catch (err) {
    setMessage("test-msg", err.message, true);
  } finally {
    btn.disabled = false;
  }
}

function initCreateModal() {
  el("create-brief").innerHTML = '<option value="">Выберите тип брифа</option>' + BRIEFS.map(function (item) {
    return '<option value="' + item[0] + '">' + esc(item[1]) + '</option>';
  }).join("");
  el("btn-open-create").addEventListener("click", openCreateModal);
  el("create-close").addEventListener("click", closeCreateModal);
  el("btn-create-cancel").addEventListener("click", closeCreateModal);
  el("create-form").addEventListener("submit", createPersonalLink);
  el("btn-copy-personal").addEventListener("click", function () {
    copyText(el("personal-link").value, el("btn-copy-personal"), "Ссылка скопирована");
  });
  el("btn-copy-general").addEventListener("click", function () {
    copyText(el("general-link").value, el("btn-copy-general"), "Ссылка скопирована");
  });
  el("btn-create-another").addEventListener("click", resetCreateForm);
}

function openCreateModal() {
  if (!currentUser) return;
  resetCreateForm();
  show("overlay");
  el("create-modal").classList.remove("hidden");
  document.body.classList.add("panel-open");
  el("create-brief").focus();
}

function closeCreateModal() {
  el("create-modal").classList.add("hidden");
  if (el("panel").classList.contains("hidden")) {
    hide("overlay");
    document.body.classList.remove("panel-open");
  }
}

function resetCreateForm() {
  el("create-form").reset();
  show("create-form");
  hide("create-result");
  hide("create-error");
  el("create-error").textContent = "";
  el("btn-create").disabled = false;
}

async function createPersonalLink(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const payload = {
    briefId: String(form.get("briefId") || ""),
    clientName: String(form.get("clientName") || "").trim(),
    amoUrl: String(form.get("amoUrl") || "").trim() || undefined
  };
  if (!payload.briefId || !payload.clientName) return;

  const btn = el("btn-create");
  btn.disabled = true;
  btn.textContent = "Создаю…";
  hide("create-error");
  try {
    const res = await fetch("/api/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok || !data.ok) {
      if (res.status === 401) throw new Error("Сессия доступа закончилась. Обновите страницу и войдите снова.");
      throw new Error(data.message || "Не удалось создать ссылку.");
    }
    el("personal-link").value = data.url;
    el("general-link").value = window.location.origin + "/?brief=" + payload.briefId;
    hide("create-form");
    show("create-result");
  } catch (err) {
    el("create-error").textContent = err.message;
    show("create-error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Создать ссылку";
  }
}

async function copyText(text, button, successText) {
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = successText;
  } catch {
    button.textContent = "Выделите и скопируйте ссылку вручную";
  }
  setTimeout(function () { button.textContent = original; }, 2200);
}

function panelState() {
  return JSON.stringify({
    responsible: el("field-responsible").value.trim(),
    amoLink: el("field-amo").value.trim()
  });
}

function hasUnsavedChanges() {
  return Boolean(currentId && savedPanelState && panelState() !== savedPanelState);
}

function updateDirtyState() {
  const dirty = hasUnsavedChanges();
  el("btn-save").textContent = dirty ? "Сохранить изменения" : "Сохранено";
  el("btn-save").disabled = !dirty;
}

function applyLocal(submissionId, updates) {
  const b = briefs.find(function (item) { return item.submissionId === submissionId; });
  if (b) Object.assign(b, updates);
}

function current() {
  return currentId ? briefs.find(function (item) { return item.submissionId === currentId; }) : null;
}

function renderLoadedAt() {
  if (!loadedAt) return;
  el("loaded-at").textContent = "Обновлено в " +
    String(loadedAt.getHours()).padStart(2, "0") + ":" +
    String(loadedAt.getMinutes()).padStart(2, "0");
}

function parseDate(value) {
  const match = String(value || "").match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!match) return 0;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), Number(match[4] || 0), Number(match[5] || 0)).getTime();
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function setMessage(id, text, isError) {
  const node = el(id);
  node.textContent = text || "";
  node.className = "save-msg" + (isError ? " msg-err" : text ? " msg-ok" : "");
}

function el(id) {
  var node = document.getElementById(id);
  if (!node) console.warn("[admin] element not found: #" + id);
  return node;
}
function show(id) { var node = el(id); if (node) node.classList.remove("hidden"); }
function hide(id) { var node = el(id); if (node) node.classList.add("hidden"); }
function showError(message) {
  var errorEl = el("error");
  if (errorEl) errorEl.textContent = message;
  show("error");
}
function showAppError(message, code) {
  var msgEl = document.getElementById("app-error-msg");
  var codeEl = document.getElementById("app-error-code");
  var errEl = document.getElementById("app-error");
  if (msgEl) msgEl.textContent = message;
  if (codeEl) codeEl.textContent = code ? "код: " + code : "";
  if (errEl) errEl.classList.remove("hidden");
  hide("loading");
}
function handleAuthError(code, userMessage, technical) {
  console.error("[admin] " + code + (technical ? ": " + technical : ""));
  showAppError(userMessage, code);
}
function esc(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
