// GET  /api/admin/briefs        → list all briefs from Sheets
// PATCH /api/admin/briefs       → update status/responsible/amoLink

export async function onRequest({ request, env }) {
  // Cloudflare Access is the primary auth guard (/admin* policy in CF dashboard).
  // Checking for the JWT header here is secondary defense — the header is injected
  // by CF Access after successful Google auth and never arrives from outside.
  if (!request.headers.get("CF-Access-Jwt-Assertion")) {
    return respond({ ok: false, message: "Доступ запрещен." }, 401);
  }

  if (!env.APPS_SCRIPT_URL || !env.FORM_API_SECRET) {
    return respond({ ok: false, message: "Сервис недоступен." }, 503);
  }

  if (request.method === "GET") return handleGet(env);
  if (request.method === "PATCH") return handlePatch(request, env);
  return respond({ ok: false, message: "Метод не поддерживается." }, 405);
}

async function handleGet(env) {
  const data = await callAppsScript(env, { action: "adminGet" });
  return respond(data, data.ok ? 200 : 502);
}

async function handlePatch(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return respond({ ok: false, message: "Некорректный JSON." }, 400);
  }

  if (!body.submissionId || !body.updates || typeof body.updates !== "object") {
    return respond({ ok: false, message: "Некорректные данные." }, 400);
  }

  const allowed = ["status", "responsible", "amoLink"];
  const updates = {};
  for (const key of allowed) {
    if (key in body.updates) updates[key] = String(body.updates[key] ?? "").slice(0, 2000);
  }

  const data = await callAppsScript(env, {
    action: "adminUpdate",
    submissionId: String(body.submissionId).slice(0, 200),
    updates
  });
  return respond(data, data.ok ? 200 : 400);
}

async function callAppsScript(env, payload) {
  try {
    const res = await fetch(env.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, apiSecret: env.FORM_API_SECRET }),
      redirect: "follow"
    });
    return await res.json();
  } catch {
    return { ok: false, message: "Не удалось связаться с сервером данных." };
  }
}

function respond(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
