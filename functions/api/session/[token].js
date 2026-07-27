export async function onRequestGet({ params, env }) {
  if (!env.SESSIONS) return json({ ok: false, message: "Сервис недоступен." }, 503);

  const token = params.token;
  const raw = await env.SESSIONS.get(`session:${token}`);
  if (!raw) return json({ ok: false, message: "Ссылка устарела или не существует." }, 404);

  const session = JSON.parse(raw);

  // Renew TTL so active drafts don't expire while in use
  await env.SESSIONS.put(`session:${token}`, raw, { expirationTtl: 31_536_000 });

  return json({
    ok: true,
    briefId: session.briefId,
    clientName: session.clientName,
    answers: session.answers || {},
    status: session.status,
    updatedAt: session.updatedAt
  });
}

export async function onRequestPut({ params, request, env }) {
  if (!env.SESSIONS) return json({ ok: false, message: "Сервис недоступен." }, 503);

  const token = params.token;
  const raw = await env.SESSIONS.get(`session:${token}`);
  if (!raw) return json({ ok: false, message: "Ссылка устарела или не существует." }, 404);

  const session = JSON.parse(raw);

  if (session.status === "submitted") {
    return json({ ok: false, message: "Бриф уже отправлен." }, 423);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: "Неверный формат запроса." }, 400);
  }

  const { answers, clientUpdatedAt } = body;

  // Optimistic locking: reject if another save happened in the meantime
  if (clientUpdatedAt && clientUpdatedAt !== session.updatedAt) {
    return json({ ok: false, message: "conflict", serverUpdatedAt: session.updatedAt }, 409);
  }

  const now = new Date().toISOString();
  const updated = { ...session, answers: answers || {}, updatedAt: now };

  await env.SESSIONS.put(`session:${token}`, JSON.stringify(updated), {
    expirationTtl: 31_536_000
  });

  return json({ ok: true, updatedAt: now });
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
