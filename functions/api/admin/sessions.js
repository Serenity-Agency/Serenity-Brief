// POST /api/admin/sessions → create a personal client brief link.

import { getAdminUser } from "../../../lib/admin-user.js";

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
    answers: {},
    submissionId: null,
    createdAt: now,
    updatedAt: now
  };

  await env.SESSIONS.put(`session:${token}`, JSON.stringify(session), {
    expirationTtl: 31_536_000
  });

  const origin = new URL(request.url).origin;
  return json({ ok: true, token, url: `${origin}/?session=${token}` }, 201);
}

function extractAmoDealId(url) {
  const match = String(url || "").match(/\/leads\/detail\/(\d+)/);
  return match ? match[1] : null;
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
