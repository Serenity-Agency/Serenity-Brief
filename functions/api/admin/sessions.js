// GET    /api/admin/sessions → list personal client brief links.
// POST   /api/admin/sessions → create a personal client brief link.
// PATCH  /api/admin/sessions → archive a submitted or linked personal link.
// DELETE /api/admin/sessions → delete an unfilled unlinked personal link.

import { getAdminUser } from "../../../lib/admin-user.js";

export async function onRequestGet({ request, env }) {
  const user = await getAdminUser(request, env);
  if (!user.ok) return json(user, user.status);

  if (!env.SESSIONS) {
    return json({ ok: false, message: "Сервис недоступен." }, 503);
  }

  const sessions = [];
  const origin = new URL(request.url).origin;
  let cursor;
  do {
    const listed = await env.SESSIONS.list({ prefix: "session:", cursor, limit: 100 });
    cursor = listed.cursor;
    for (const key of listed.keys || []) {
      const raw = await env.SESSIONS.get(key.name);
      if (!raw) continue;
      const session = JSON.parse(raw);
      if (session.createdByEmail && session.createdByEmail !== user.email) continue;
      sessions.push(sessionSummary(session, origin));
    }
  } while (cursor);

  sessions.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  return json({ ok: true, sessions });
}

export async function onRequestPost({ request, env }) {
  const user = await getAdminUser(request, env);
  if (!user.ok) return json(user, user.status);

  if (!env.SESSIONS) {
    return json({ ok: false, message: "Сервис недоступен." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: "Неверный формат запроса." }, 400);
  }

  const briefId = String(body.briefId || "").trim();
  const clientName = String(body.clientName || "").trim();

  if (!briefId || !clientName) {
    return json({ ok: false, message: "Укажите тип брифа и клиента." }, 400);
  }

  const amoUrl = String(body.amoUrl || "").trim();
  const amoDealId = extractAmoDealId(amoUrl);

  const token = crypto.randomUUID();
  const now = new Date().toISOString();
  const origin = new URL(request.url).origin;
  const session = {
    v: 1,
    token,
    briefId: briefId.slice(0, 100),
    clientName: clientName.slice(0, 500),
    createdBy: user.name.slice(0, 200),
    createdByEmail: user.email.slice(0, 320),
    amoUrl: amoUrl.slice(0, 500) || null,
    amoDealId: amoDealId || null,
    status: "draft",
    url: `${origin}/?session=${token}`,
    answers: {},
    submissionId: null,
    createdAt: now,
    updatedAt: now
  };

  await env.SESSIONS.put(`session:${token}`, JSON.stringify(session), {
    expirationTtl: 31_536_000
  });

  return json({ ok: true, token, url: session.url, session: sessionSummary(session, origin) }, 201);
}

export async function onRequestPatch({ request, env }) {
  const user = await getAdminUser(request, env);
  if (!user.ok) return json(user, user.status);
  if (!env.SESSIONS) return json({ ok: false, message: "Сервис недоступен." }, 503);

  const body = await readJson(request);
  const token = String(body.token || "").trim();
  if (!token || body.action !== "archive") {
    return json({ ok: false, message: "Некорректное действие." }, 400);
  }

  const loaded = await loadOwnedSession(env, token, user);
  if (!loaded.ok) return json(loaded, loaded.status);

  const session = loaded.session;
  if (session.status !== "submitted" && !session.portalWorkspace?.workspace_url) {
    return json({ ok: false, message: "Незаполненную ссылку можно удалить, а не архивировать." }, 409);
  }

  const updated = {
    ...session,
    archivedAt: new Date().toISOString(),
    archivedBy: user.email,
    updatedAt: new Date().toISOString()
  };
  await env.SESSIONS.put(loaded.key, JSON.stringify(updated), { expirationTtl: 31_536_000 });
  return json({ ok: true, session: sessionSummary(updated, new URL(request.url).origin) });
}

export async function onRequestDelete({ request, env }) {
  const user = await getAdminUser(request, env);
  if (!user.ok) return json(user, user.status);
  if (!env.SESSIONS) return json({ ok: false, message: "Сервис недоступен." }, 503);

  const body = await readJson(request);
  const token = String(body.token || "").trim();
  if (!token) return json({ ok: false, message: "Выберите ссылку." }, 400);

  const loaded = await loadOwnedSession(env, token, user);
  if (!loaded.ok) return json(loaded, loaded.status);

  const session = loaded.session;
  if (session.status === "submitted" || session.portalWorkspace?.workspace_url) {
    return json({ ok: false, message: "Заполненный бриф нельзя удалить. Перенесите карточку в архив." }, 409);
  }

  await env.SESSIONS.delete(loaded.key);
  return json({ ok: true, deleted: true, token });
}

function extractAmoDealId(url) {
  const match = String(url || "").match(/\/leads\/detail\/(\d+)/);
  return match ? match[1] : null;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function loadOwnedSession(env, token, user) {
  const key = `session:${token}`;
  const raw = await env.SESSIONS.get(key);
  if (!raw) return { ok: false, status: 404, message: "Персональная ссылка не найдена." };
  const session = JSON.parse(raw);
  if (session.createdByEmail && session.createdByEmail !== user.email) {
    return { ok: false, status: 403, message: "Эта ссылка закреплена за другим менеджером." };
  }
  return { ok: true, key, session };
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function sessionSummary(session, origin = "") {
  const status = session.status === "submitted"
    ? "filled"
    : (session.status === "opened" ? "opened" : "created");
  return {
    token: session.token,
    briefId: session.briefId,
    briefTitle: session.briefTitle || "",
    clientName: session.clientName || "",
    createdBy: session.createdBy || "",
    createdByEmail: session.createdByEmail || "",
    amoUrl: session.amoUrl || "",
    amoDealId: session.amoDealId || "",
    status,
    submissionId: session.submissionId || null,
    createdAt: session.createdAt || "",
    updatedAt: session.updatedAt || "",
    url: session.url || (origin && session.token ? `${origin}/?session=${session.token}` : null),
    portalWorkspace: session.portalWorkspace || null,
    archived: Boolean(session.archivedAt),
    archivedAt: session.archivedAt || null
  };
}
