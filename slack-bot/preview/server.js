/**
 * Local Dev Preview Server
 * Simula el funcionamiento del bot SIN necesitar credenciales de Slack.
 * Corre en http://localhost:4000
 */
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Import role config (no env vars needed) ────────────────────────────────────
import { getDefaultTools, TOOL_META, ALL_TOOLS } from '../src/config/roles.js';
import { ALL_ONBOARDING_STEPS, ALL_OFFBOARDING_STEPS, getStepsForProcess, isManualStep, isBlockingStep, ACTORS } from '../src/workflows/steps.js';

const PORT = 4000;

// Active SSE sessions  { id → { res, steps, processData } }
const sessions = new Map();

// ── Step simulation timings (ms) per tool ─────────────────────────────────────
const STEP_DELAY = {
  create_google_account:   1200,
  create_drive_folder:     800,
  assign_google_voice:     900,
  invite_slack_channels:   700,
  send_welcome_dm:         500,
  create_timedoctor_user:  1000,
  invite_hubspot_user:     1100,
  invite_github_org:       900,
  assign_github_repos:     700,
  notify_manager:          400,
  notify_manager_offboard: 400,
  transfer_drive_files:    1500,
  revoke_github_access:    800,
  suspend_google_account:  700,
  revoke_google_voice:     600,
  deactivate_timedoctor:   700,
  revoke_hubspot:          600,
};

// ── HTTP Router ────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // Serve main HTML
  if (req.method === 'GET' && path === '/') {
    const html = readFileSync(resolve(__dirname, 'public/index.html'), 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // Tools defaults API (called when dept/role changes in the form)
  if (req.method === 'GET' && path === '/api/tools-defaults') {
    const dept = url.searchParams.get('dept') ?? '';
    const role = url.searchParams.get('role') ?? '';
    const tools = getDefaultTools(dept, role);
    json(res, { tools, allTools: ALL_TOOLS, toolMeta: TOOL_META });
    return;
  }

  // Start a process (onboarding or offboarding)
  if (req.method === 'POST' && (path === '/api/start-onboarding' || path === '/api/start-offboarding')) {
    const body = await readBody(req);
    const type = path.includes('onboarding') ? 'onboarding' : 'offboarding';
    const sessionId = `${type}-${Date.now()}`;

    const allSteps = type === 'onboarding' ? ALL_ONBOARDING_STEPS : ALL_OFFBOARDING_STEPS;
    const steps = getStepsForProcess({ tools: body.tools ?? ['google_workspace'] }, allSteps);

    sessions.set(sessionId, {
      type,
      steps: steps.map(s => ({ ...s, status: 'pending' })),
      processData: body,
      blockResolve: null,
    });

    json(res, { sessionId, steps: sessions.get(sessionId).steps });

    // Kick off simulation async
    setImmediate(() => simulateSteps(sessionId));
    return;
  }

  // SSE stream for a session
  if (req.method === 'GET' && path.startsWith('/api/events/')) {
    const sessionId = path.replace('/api/events/', '');
    const session = sessions.get(sessionId);
    if (!session) { res.writeHead(404); res.end(); return; }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    session.sseRes = res;

    // Send current state immediately
    sendSSE(res, 'state', session.steps);

    req.on('close', () => { if (session.sseRes === res) session.sseRes = null; });
    return;
  }

  // Complete a manual step (also handles blocking gate actor confirmation)
  if (req.method === 'POST' && path.startsWith('/api/complete-step/')) {
    const [sessionId, stepKey] = path.replace('/api/complete-step/', '').split('/');
    const session = sessions.get(sessionId);
    if (session) {
      const step = session.steps.find(s => s.key === stepKey);
      if (step && (step.status === 'pending' || step.status === 'waiting_actor')) {
        step.status = step.blocking ? 'actor_confirmed' : 'completed';
        if (session.sseRes) sendSSE(session.sseRes, 'step', step);
        if (step.blocking) setImmediate(() => resumeAfterBlock(sessionId));
        else checkCompletion(sessionId);
      }
    }
    json(res, { ok: true });
    return;
  }

  // Export ACTORS to the client
  if (req.method === 'GET' && path === '/api/actors') {
    json(res, { actors: ACTORS });
    return;
  }

  // Save env vars to .env file
  if (req.method === 'POST' && path === '/api/save-env') {
    const body = await readBody(req);
    const { vars } = body;
    if (!vars || typeof vars !== 'object') { json(res, { ok: false, error: 'Invalid body' }); return; }

    try {
      const envPath = resolve(__dirname, '../../.env');
      let existing = '';
      try { existing = readFileSync(envPath, 'utf-8'); } catch (_) {}

      const existingVars = {};
      existing.split('\n').forEach(line => {
        const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (match) existingVars[match[1]] = match[2];
      });

      const merged = { ...existingVars, ...vars };

      const { writeFileSync } = await import('node:fs');
      const content = Object.entries(merged)
        .filter(([, v]) => v !== '')
        .map(([k, v]) => `${k}=${v}`)
        .join('\n') + '\n';

      writeFileSync(envPath, content, 'utf-8');
      json(res, { ok: true, saved: Object.keys(vars).length });
    } catch (err) {
      json(res, { ok: false, error: err.message });
    }
    return;
  }

  // Load current .env values
  if (req.method === 'GET' && path === '/api/load-env') {
    try {
      const envPath = resolve(__dirname, '../../.env');
      let content = '';
      try { content = readFileSync(envPath, 'utf-8'); } catch (_) {}

      const vars = {};
      content.split('\n').forEach(line => {
        const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/);
        if (match) vars[match[1]] = match[2];
      });
      json(res, { ok: true, vars });
    } catch (err) {
      json(res, { ok: false, vars: {} });
    }
    return;
  }

  // HubSpot companies search (real API or mock fallback)
  if (req.method === 'GET' && path === '/api/hubspot-companies') {
    const q = (url.searchParams.get('q') ?? '').toLowerCase();

    // Try real HubSpot API if token available
    const hsToken = process.env.HUBSPOT_ACCESS_TOKEN;
    if (hsToken) {
      try {
        const hsRes = await fetch('https://api.hubapi.com/crm/v3/objects/companies/search', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${hsToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filterGroups: q ? [{ filters: [{ propertyName: 'name', operator: 'CONTAINS_TOKEN', value: `*${q}*` }] }] : [],
            properties: ['name', 'domain'],
            limit: 20,
            sorts: [{ propertyName: 'name', direction: 'ASCENDING' }],
          }),
        });
        if (hsRes.ok) {
          const data = await hsRes.json();
          const companies = (data.results ?? []).map(c => ({ id: c.id, name: c.properties?.name ?? 'Unknown', domain: c.properties?.domain ?? '' }));
          json(res, { ok: true, companies, source: 'hubspot' });
          return;
        }
      } catch (_) {}
    }

    // Mock fallback (no HubSpot token)
    const MOCK_COMPANIES = [
      { id: '1', name: 'GSD Outsources', domain: 'gsdoutsources.com' },
      { id: '2', name: 'Acme Corporation', domain: 'acme.com' },
      { id: '3', name: 'TechStart Inc', domain: 'techstart.io' },
      { id: '4', name: 'Global Partners LLC', domain: 'globalpartners.com' },
      { id: '5', name: 'Innovation Hub', domain: 'innovationhub.co' },
      { id: '6', name: 'Digital Solutions SA', domain: 'digitalsolutions.com' },
      { id: '7', name: 'CloudBase Systems', domain: 'cloudbase.io' },
      { id: '8', name: 'NextGen Agency', domain: 'nextgen.agency' },
      { id: '9', name: 'Bright Minds Co', domain: 'brightminds.co' },
      { id: '10', name: 'Apex Services', domain: 'apexservices.com' },
    ];
    const filtered = q
      ? MOCK_COMPANIES.filter(c => c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q))
      : MOCK_COMPANIES;
    json(res, { ok: true, companies: filtered, source: 'mock' });
    return;
  }

  // Actor confirms their blocking step (dedicated endpoint)
  if (req.method === 'POST' && path.startsWith('/api/actor-confirm/')) {
    const parts = path.replace('/api/actor-confirm/', '').split('/');
    const sessionId = parts[0];
    const stepKey = parts[1];
    const session = sessions.get(sessionId);
    if (session) {
      const step = session.steps.find(s => s.key === stepKey);
      if (step && step.status === 'waiting_actor') {
        step.status = 'actor_confirmed';
        if (session.sseRes) sendSSE(session.sseRes, 'step', step);
        setImmediate(() => resumeAfterBlock(sessionId));
      }
    }
    json(res, { ok: true });
    return;
  }

  res.writeHead(404); res.end();
});

// ── Step simulator ─────────────────────────────────────────────────────────────
async function simulateSteps(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return;

  for (const step of session.steps) {
    if (step.status !== 'pending') continue;

    // Blocking manual step — pause and wait for actor confirmation via Promise
    if (step.blocking) {
      step.status = 'waiting_actor';
      const sseRes = sessions.get(sessionId)?.sseRes;
      if (sseRes) {
        sendSSE(sseRes, 'step', step);
        sendSSE(sseRes, 'actor_notification', {
          sessionId,
          stepKey: step.key,
          actor: step.actor,
          actorInfo: ACTORS[step.actor] ?? { label: step.actor, emoji: '👤', color: '#666' },
          label: step.label,
          ts: Date.now(),
        });
      }
      // Suspend here until resumeAfterBlock resolves the promise
      await new Promise(resolve => { session.blockResolve = resolve; });
      // Mark completed after actor confirms
      const currentStep = sessions.get(sessionId)?.steps.find(x => x.key === step.key);
      if (currentStep && (currentStep.status === 'waiting_actor' || currentStep.status === 'actor_confirmed')) {
        currentStep.status = 'completed';
        const sseRes2 = sessions.get(sessionId)?.sseRes;
        if (sseRes2) sendSSE(sseRes2, 'step', currentStep);
      }
      continue;
    }

    // Non-blocking manual steps — skip in simulator (user completes via action buttons)
    if (step.manual) continue;

    // Auto step
    const delay = STEP_DELAY[step.key] ?? 800;
    step.status = 'in_progress';
    if (session.sseRes) sendSSE(session.sseRes, 'step', step);

    await sleep(delay);

    // Simulate occasional failures (4% chance) for demo realism
    const fail = Math.random() < 0.04;
    step.status = fail ? 'failed' : 'completed';
    step.errorMessage = fail ? 'API timeout (simulado)' : null;

    if (session.sseRes) sendSSE(session.sseRes, 'step', step);
  }

  checkCompletion(sessionId);
}

// Resume the blocked simulation after an actor confirms their step
function resumeAfterBlock(sessionId) {
  const session = sessions.get(sessionId);
  if (!session || !session.blockResolve) return;
  const resolve = session.blockResolve;
  session.blockResolve = null;
  resolve();
}

function checkCompletion(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return;
  const allDone = session.steps.every(s => ['completed', 'failed', 'skipped'].includes(s.status));
  if (allDone && session.sseRes) {
    sendSSE(session.sseRes, 'complete', { sessionId });
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function sendSSE(res, event, data) {
  try {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  } catch (_) {}
}

function json(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

server.listen(PORT, () => {
  console.log(`\n🚀 Preview corriendo en http://localhost:${PORT}\n`);
  console.log('  ✅ No necesitas credenciales de Slack para el preview');
  console.log('  📋 Ve a http://localhost:4000 para visualizar el flujo\n');
});
