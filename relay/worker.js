/*
 * nd-voice-relay — receives test results from the console and commits each
 * submission as a new JSON file in the private results repo.
 *
 * Secrets (set with `wrangler secret put`, never in this repo):
 *   SUBMIT_KEY   — shared key the tester's link carries as #k=...
 *   GITHUB_TOKEN — fine-grained token, only the results repo, Contents: read and write
 * Vars (wrangler.toml): ALLOWED_ORIGIN, RESULTS_REPO, RESULTS_BRANCH
 */

const MAX_BYTES = 200 * 1024;
const SCHEMA = "nd-voice-test-results/v1";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowed = origin === env.ALLOWED_ORIGIN;

    if (request.method === "OPTIONS") {
      if (!allowed) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: cors(env, { "Access-Control-Max-Age": "86400" }) });
    }
    if (url.pathname !== "/submit") return reply(env, allowed, 404, { ok: false, error: "Not found." });
    if (request.method !== "POST") return reply(env, allowed, 405, { ok: false, error: "Use POST." });
    if (!allowed) return reply(env, false, 403, { ok: false, error: "This origin is not allowed." });
    if (!env.SUBMIT_KEY || !env.GITHUB_TOKEN) return reply(env, true, 500, { ok: false, error: "Relay is not configured." });

    const declared = Number(request.headers.get("Content-Length") || 0);
    if (declared > MAX_BYTES) return reply(env, true, 413, { ok: false, error: "Payload is larger than 200 KB." });
    const raw = await request.arrayBuffer();
    if (raw.byteLength > MAX_BYTES) return reply(env, true, 413, { ok: false, error: "Payload is larger than 200 KB." });

    let body;
    try {
      body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw));
    } catch {
      return reply(env, true, 400, { ok: false, error: "Body is not valid JSON." });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return reply(env, true, 400, { ok: false, error: "Body must be a JSON object." });
    }

    if (typeof body.key !== "string" || !(await sameSecret(body.key, env.SUBMIT_KEY))) {
      return reply(env, true, 401, { ok: false, error: "The submit key is missing or wrong." });
    }
    delete body.key;

    const problem = schemaProblem(body);
    if (problem) return reply(env, true, 422, { ok: false, error: "Schema check failed: " + problem });

    const receiptId = makeReceipt();
    const stored = { ...body, receivedAtUtc: new Date().toISOString(), receiptId };
    const content = toBase64(JSON.stringify(stored, null, 2) + "\n");
    const round = slug(String(body.round), 40);
    const tester = slug(body.tester, 40);

    // Create-only: no `sha` is sent, so GitHub refuses to replace an existing file (422).
    // On a name clash, retry with a fresh timestamp instead of overwriting.
    for (let attempt = 0; attempt < 3; attempt++) {
      const stamp = new Date(Date.now() + attempt).toISOString().replace(/:/g, "-");
      const path = `results/round-${round}/${stamp}-${tester}.json`;
      const res = await fetch(`https://api.github.com/repos/${env.RESULTS_REPO}/contents/${path}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "nd-voice-relay",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Results: round ${round}, ${tester}, receipt ${receiptId}`,
          content,
          branch: env.RESULTS_BRANCH || "main",
        }),
      });
      if (res.status === 201) return reply(env, true, 200, { ok: true, receiptId, file: path });
      if (res.status === 422) continue;
      console.log(`github write failed: status ${res.status}`);
      return reply(env, true, 502, { ok: false, error: `Could not save results (storage returned ${res.status}).` });
    }
    return reply(env, true, 409, { ok: false, error: "Could not create a unique file. Please try again." });
  },
};

function schemaProblem(b) {
  if (b.schema !== SCHEMA) return `"schema" must be "${SCHEMA}"`;
  if (typeof b.tester !== "string" || !b.tester.trim()) return '"tester" is required';
  if ((typeof b.round !== "string" && typeof b.round !== "number") || !String(b.round).trim()) return '"round" is required';
  if (typeof b.promptVersion !== "string" || !b.promptVersion.trim()) return '"promptVersion" is required';
  if (!Array.isArray(b.tests) || b.tests.length < 1 || b.tests.length > 20) return '"tests" must be a non-empty array';
  if (!b.tests.every((t) => t && typeof t === "object" && typeof t.id === "string")) return 'every test needs an "id"';
  return "";
}

function cors(env, extra = {}) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
    ...extra,
  };
}

function reply(env, withCors, status, obj) {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  return new Response(JSON.stringify(obj), { status, headers: withCors ? { ...headers, ...cors(env) } : headers });
}

// Compare digests so the check takes the same time whatever the input.
async function sameSecret(a, b) {
  const enc = new TextEncoder();
  const [da, db] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const x = new Uint8Array(da), y = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function slug(s, max) {
  const out = String(s).normalize("NFKD").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, max);
  return out || "unknown";
}

function makeReceipt() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const r = crypto.getRandomValues(new Uint8Array(3));
  return `ND-${d}-${[...r].map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
