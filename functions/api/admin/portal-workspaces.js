// POST /api/admin/portal-workspaces → create or open Presale Portal Workspace for a submitted brief.

import { getAdminUser } from "../../../lib/admin-user.js";

export async function onRequestPost({ request, env }) {
  const user = await getAdminUser(request, env);
  if (!user.ok) return json(user, user.status);

  if (!env.PRESALE_PORTAL_URL || !env.PRESALE_PORTAL_IMPORT_TOKEN) {
    return json({ ok: false, message: "Presale Portal сейчас недоступен. Попробуйте позже." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: "Неверный формат запроса." }, 400);
  }

  const token = String(body.token || "").trim();
  if (!token) return json({ ok: false, message: "Выберите заполненный бриф." }, 400);
  if (!env.SESSIONS) return json({ ok: false, message: "Сервис недоступен." }, 503);

  const key = `session:${token}`;
  const raw = await env.SESSIONS.get(key);
  if (!raw) return json({ ok: false, message: "Персональная ссылка не найдена." }, 404);

  const session = JSON.parse(raw);
  if (session.createdByEmail && session.createdByEmail !== user.email) {
    return json({ ok: false, message: "Эта ссылка закреплена за другим менеджером." }, 403);
  }
  if (session.status !== "submitted" || !session.submittedBrief) {
    return json({ ok: false, message: "Workspace можно создать только после заполнения брифа клиентом." }, 409);
  }
  if (session.portalWorkspace?.workspace_url) {
    return json({
      ok: true,
      brief_id: session.portalWorkspace.brief_id,
      workspace_id: session.portalWorkspace.workspace_id,
      workspace_url: session.portalWorkspace.workspace_url,
      created: false,
      existing: true
    });
  }

  const result = await callPresalePortal(env, session.submittedBrief);
  if (!result.ok) {
    return json({
      ok: false,
      message: result.message || "Presale Portal временно недоступен. Попробуйте ещё раз."
    }, result.status || 502);
  }

  const portalWorkspace = {
    brief_id: result.brief_id,
    workspace_id: result.workspace_id,
    workspace_url: result.workspace_url,
    created: Boolean(result.created),
    existing: Boolean(result.existing),
    linkedAt: new Date().toISOString()
  };
  const updated = { ...session, portalWorkspace, updatedAt: portalWorkspace.linkedAt };
  await env.SESSIONS.put(key, JSON.stringify(updated), { expirationTtl: 31_536_000 });

  return json({ ok: true, ...portalWorkspace }, result.created ? 201 : 200);
}

async function callPresalePortal(env, submittedBrief) {
  const base = String(env.PRESALE_PORTAL_URL || "").replace(/\/+$/, "");
  try {
    const response = await fetch(`${base}/api/integrations/serenity-brief/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.PRESALE_PORTAL_IMPORT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(submittedBrief)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      return {
        ok: false,
        status: response.status,
        message: data.message || "Presale Portal временно недоступен. Попробуйте ещё раз."
      };
    }
    return data;
  } catch (error) {
    console.error("[portal-workspaces] portal_unavailable:", error && error.name ? error.name : "fetch_error");
    return { ok: false, status: 502, message: "Presale Portal временно недоступен. Попробуйте ещё раз." };
  }
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
