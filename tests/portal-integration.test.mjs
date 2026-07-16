import assert from "node:assert/strict";

import { onRequestPost as createPortalWorkspace } from "../functions/api/admin/portal-workspaces.js";
import {
  onRequestDelete as deleteSession,
  onRequestPatch as archiveSession
} from "../functions/api/admin/sessions.js";

const originalFetch = globalThis.fetch;

try {
  await testSubmittedBriefCreatesWorkspace();
  await testRepeatedImportReturnsExistingWorkspace();
  await testUnsubmittedBriefIsBlocked();
  await testPortalUnavailableDoesNotUpdateSession();
  await testCyrillicClientPayloadIsSent();
  await testDeleteUnfilledUnlinkedSession();
  await testDeleteOneSessionDoesNotTouchSecondClientLink();
  await testDeleteSubmittedSessionIsBlocked();
  await testArchiveSubmittedSession();
  console.log("Portal integration tests passed");
} finally {
  globalThis.fetch = originalFetch;
}

async function testDeleteUnfilledUnlinkedSession() {
  const deleted = [];
  const env = integrationEnv({
    session: { token: "token-1", status: "opened", createdByEmail: "anna@serenity.agency" },
    delete: async (key) => deleted.push(key)
  });

  const response = await deleteSession({
    request: accessRequest({ token: "token-1" }, "DELETE", "https://brief.test/api/admin/sessions"),
    env
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.deleted, true);
  assert.deepEqual(deleted, ["session:token-1"]);
}

async function testDeleteOneSessionDoesNotTouchSecondClientLink() {
  const deleted = [];
  const env = integrationEnv({
    session: { token: "token-1", status: "created", clientName: "Same Client", createdByEmail: "anna@serenity.agency" },
    delete: async (key) => deleted.push(key)
  });

  const response = await deleteSession({
    request: accessRequest({ token: "token-1" }, "DELETE", "https://brief.test/api/admin/sessions"),
    env
  });

  assert.equal(response.status, 200);
  assert.deepEqual(deleted, ["session:token-1"]);
  assert.ok(!deleted.includes("session:token-2"));
}


async function testDeleteSubmittedSessionIsBlocked() {
  const deleted = [];
  const env = integrationEnv({
    session: submittedSession(),
    delete: async (key) => deleted.push(key)
  });

  const response = await deleteSession({
    request: accessRequest({ token: "token-1" }, "DELETE", "https://brief.test/api/admin/sessions"),
    env
  });
  const body = await response.json();

  assert.equal(response.status, 409);
  assert.equal(body.ok, false);
  assert.equal(deleted.length, 0);
}

async function testArchiveSubmittedSession() {
  const writes = [];
  const env = integrationEnv({
    session: submittedSession(),
    put: async (key, value) => writes.push([key, JSON.parse(value)])
  });

  const response = await archiveSession({
    request: accessRequest({ token: "token-1", action: "archive" }, "PATCH", "https://brief.test/api/admin/sessions"),
    env
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.session.archived, true);
  assert.equal(writes.length, 1);
  assert.ok(writes[0][1].archivedAt);
}

async function testSubmittedBriefCreatesWorkspace() {
  const writes = [];
  const session = submittedSession();
  const env = integrationEnv({
    session,
    put: async (key, value) => writes.push([key, JSON.parse(value)]),
    portalResponse: {
      ok: true,
      brief_id: "brief-1",
      workspace_id: "workspace-1",
      workspace_url: "https://clients.test/app/?workspace=workspace-1",
      created: true,
      existing: false
    }
  });

  const response = await createPortalWorkspace({
    request: accessRequest({ token: "token-1" }),
    env
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.ok, true);
  assert.equal(body.workspace_id, "workspace-1");
  assert.equal(writes.length, 1);
  assert.equal(writes[0][0], "session:token-1");
  assert.equal(writes[0][1].portalWorkspace.workspace_url, "https://clients.test/app/?workspace=workspace-1");
}

async function testRepeatedImportReturnsExistingWorkspace() {
  let fetchCalled = false;
  const session = {
    ...submittedSession(),
    portalWorkspace: {
      brief_id: "brief-1",
      workspace_id: "workspace-1",
      workspace_url: "https://clients.test/app/?workspace=workspace-1"
    }
  };
  const env = integrationEnv({
    session,
    fetchImpl: async () => {
      fetchCalled = true;
      return new Response("{}", { status: 500 });
    }
  });

  const response = await createPortalWorkspace({
    request: accessRequest({ token: "token-1" }),
    env
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.existing, true);
  assert.equal(body.workspace_url, "https://clients.test/app/?workspace=workspace-1");
  assert.equal(fetchCalled, false);
}

async function testUnsubmittedBriefIsBlocked() {
  const env = integrationEnv({
    session: { ...submittedSession(), status: "opened", submittedBrief: null }
  });

  const response = await createPortalWorkspace({
    request: accessRequest({ token: "token-1" }),
    env
  });
  const body = await response.json();

  assert.equal(response.status, 409);
  assert.equal(body.ok, false);
}

async function testPortalUnavailableDoesNotUpdateSession() {
  const writes = [];
  const env = integrationEnv({
    session: submittedSession(),
    put: async (key, value) => writes.push([key, value]),
    fetchImpl: async (url) => {
      if (String(url).includes("/cdn-cgi/access/get-identity")) {
        return new Response(JSON.stringify({ email: "anna@serenity.agency" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      throw new TypeError("Failed to fetch");
    }
  });

  const response = await createPortalWorkspace({
    request: accessRequest({ token: "token-1" }),
    env
  });
  const body = await response.json();

  assert.equal(response.status, 502);
  assert.equal(body.ok, false);
  assert.equal(writes.length, 0);
}

async function testCyrillicClientPayloadIsSent() {
  let received;
  const env = integrationEnv({
    session: submittedSession({
      submittedBrief: {
        ...submittedSession().submittedBrief,
        client_name: "ООО Эко-Сервис"
      }
    }),
    portalResponse: {
      ok: true,
      brief_id: "brief-1",
      workspace_id: "workspace-eco",
      workspace_url: "https://clients.test/app/?workspace=workspace-eco",
      created: true,
      existing: false
    },
    captureBody: (body) => { received = body; }
  });

  const response = await createPortalWorkspace({
    request: accessRequest({ token: "token-1" }),
    env
  });

  assert.equal(response.status, 201);
  assert.equal(received.client_name, "ООО Эко-Сервис");
}

function integrationEnv({ session, portalResponse, fetchImpl, put, delete: deleteFn, captureBody } = {}) {
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes("/cdn-cgi/access/get-identity")) {
      return new Response(JSON.stringify({ email: "anna@serenity.agency" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (fetchImpl) return fetchImpl(url, options);
    assert.equal(String(url), "https://clients.test/api/integrations/serenity-brief/import");
    assert.equal(options.headers.Authorization, "Bearer import-token");
    const body = JSON.parse(options.body);
    captureBody?.(body);
    return new Response(JSON.stringify(portalResponse || { ok: false }), {
      status: portalResponse?.ok ? 201 : 502,
      headers: { "Content-Type": "application/json" }
    });
  };

  return {
    ADMIN_USERS_JSON: JSON.stringify({ "anna@serenity.agency": "Анна" }),
    PRESALE_PORTAL_URL: "https://clients.test",
    PRESALE_PORTAL_IMPORT_TOKEN: "import-token",
    SESSIONS: {
      get: async (key) => key === "session:token-1" ? JSON.stringify(session) : null,
      put: put || (async () => {}),
      delete: deleteFn || (async () => {})
    }
  };
}

function submittedSession(overrides = {}) {
  return {
    token: "token-1",
    status: "submitted",
    createdByEmail: "anna@serenity.agency",
    submittedBrief: {
      brief_id: "brief-1",
      client_name: "Client",
      goals: "Need growth",
      submitted: true,
      status: "submitted"
    },
    ...overrides
  };
}

function accessRequest(body, method = "POST", url = "https://brief.test/api/admin/portal-workspaces") {
  const headers = new Headers({
    "Content-Type": "application/json",
    "CF-Access-Jwt-Assertion": "verified-jwt",
    "Cookie": "CF_Authorization=session-cookie"
  });
  return new Request(url, {
    method,
    headers,
    body: JSON.stringify(body)
  });
}
