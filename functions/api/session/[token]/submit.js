export async function onRequestPost({ params, request, env }) {
  if (!env.SESSIONS || !env.APPS_SCRIPT_URL || !env.FORM_API_SECRET) {
    return json({ ok: false, message: "Сервис недоступен." }, 503);
  }

  const token = params.token;
  const raw = await env.SESSIONS.get(`session:${token}`);
  if (!raw) return json({ ok: false, message: "Ссылка устарела или не существует." }, 404);

  const session = JSON.parse(raw);

  if (session.status === "submitted") {
    return json({ ok: false, message: "Бриф уже отправлен.", submissionId: session.submissionId }, 409);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "Неверный формат запроса." }, 400);
  }

  let result;
  try {
    const response = await fetch(env.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        responsible: session.createdBy || "",
        apiSecret: env.FORM_API_SECRET
      }),
      redirect: "follow"
    });
    result = await response.json();
  } catch (error) {
    console.error("Session submit proxy failed", error);
    return json({ ok: false, message: "Не удалось отправить бриф. Попробуйте еще раз." }, 502);
  }

  if (!result?.ok) {
    return json(result, 400);
  }

  // Add amoCRM note if deal was linked at session creation
  let amoNoteError = null;
  if (session.amoDealId && result.documentUrl && env.AMO_ACCESS_TOKEN && env.AMO_DOMAIN) {
    try {
      await addAmoNote(env, session.amoDealId, result.documentUrl);
    } catch (err) {
      amoNoteError = err.message;
      console.error("amoCRM note failed:", err.message);
    }
  }

  // Mark session as submitted so duplicate submits are blocked
  const now = new Date().toISOString();
  const submissionId = payload.submissionId || result.submissionId || null;
  const updated = {
    ...session,
    status: "submitted",
    submissionId,
    submittedAt: now,
    updatedAt: now,
    submittedBrief: buildSubmittedBriefSnapshot(payload, result, session, submissionId, now)
  };

  await env.SESSIONS.put(`session:${token}`, JSON.stringify(updated), {
    expirationTtl: 31_536_000
  });

  return json(amoNoteError ? { ...result, amoNoteError } : result, 200);
}

async function addAmoNote(env, dealId, documentUrl) {
  const text = `Бриф заполнен клиентом.\nGoogle Doc с ответами: ${documentUrl}`;
  const res = await fetch(
    `https://${env.AMO_DOMAIN}/api/v4/leads/${dealId}/notes`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.AMO_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([{ note_type: "common", params: { text } }])
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`amoCRM ${res.status}: ${body.slice(0, 200)}`);
  }
}

export function onRequestGet() {
  return json({ ok: false, message: "Метод не поддерживается." }, 405);
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

function buildSubmittedBriefSnapshot(payload, result, session, submissionId, submittedAt) {
  const sections = Array.isArray(payload.sections) ? payload.sections : [];
  return {
    brief_id: submissionId || payload.submissionId || result.submissionId || session.token,
    brief_type: payload.briefId || session.briefId || "",
    brief_title: payload.briefTitle || "",
    client_name: payload.companyName || session.clientName || "",
    client_site: payload.companySite || payload.site || "",
    geography: payload.geography || "",
    services: extractServices(payload, sections),
    products: extractAnswer(sections, ["товар", "услуг", "продукт"]),
    goals: payload.request || payload.goal || extractAnswer(sections, ["задач", "цель", "результат"]),
    budget: payload.budget || extractAnswer(sections, ["бюджет"]),
    competitors: splitList(extractAnswer(sections, ["конкурент"])),
    audience: extractAnswer(sections, ["аудитор"]),
    timeline: extractAnswer(sections, ["срок"]),
    comments: payload.comment || extractAnswer(sections, ["комментар", "дополнительно"]),
    document_url: result.documentUrl || "",
    amocrm_url: session.amoUrl || "",
    submitted_at: submittedAt,
    submitted: true,
    status: "submitted"
  };
}

function extractServices(payload, sections) {
  const values = [payload.briefTitle, payload.briefId, extractAnswer(sections, ["услуг", "направлен"])]
    .filter(Boolean)
    .join(", ");
  return splitList(values);
}

function extractAnswer(sections, needles) {
  for (const section of sections) {
    for (const field of section.fields || []) {
      const label = String(field.label || field.title || "").toLowerCase();
      if (needles.some((needle) => label.includes(needle))) {
        const value = Array.isArray(field.value) ? field.value.join(", ") : field.value;
        if (String(value || "").trim()) return String(value).trim();
      }
    }
  }
  return "";
}

function splitList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "")
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
