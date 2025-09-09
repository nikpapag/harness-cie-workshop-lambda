// index.js — paste this whole file
const https = require("https");
const crypto = require("crypto");

/* ============== UI SHELL & VIEWS ============== */
function pageShell(title, body) {
  const css = `
    :root{
      --hl-navy:#0b1f3b; --hl-blue:#1a4db3; --hl-sky:#e8f0ff; --hl-ink:#0d1321; --hl-muted:#6b7280;
      --ok:#1f9d55; --bad:#d64545; --warning:#eab308; --card:#ffffff;
      --shadow:0 10px 20px rgba(0,0,0,.07), 0 3px 6px rgba(0,0,0,.05); --radius:20px;
    }
    *{box-sizing:border-box} html,body{height:100%}
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial,"Noto Sans";
      color:var(--hl-ink);background:linear-gradient(180deg,var(--hl-sky),#fff 40%);}
    header{background:var(--hl-navy);color:#fff;padding:18px 24px;display:flex;align-items:center;gap:16px;justify-content:space-between;flex-wrap:wrap}
    .brand{font-weight:800;letter-spacing:.3px}.brand a{color:#fff;text-decoration:none}
    nav a{color:#fff;text-decoration:none;margin-right:16px;opacity:.9} nav a:hover{opacity:1;text-decoration:underline}
    main{max-width:980px;margin:32px auto;padding:0 16px}
    .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);padding:24px;margin:20px 0;}
    h1{margin:0 0 12px 0;font-size:28px} h2{margin:12px 0 6px 0;font-size:20px} p{line-height:1.6}
    .pill{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;font-weight:600}
    .pill.ok{background:rgba(31,157,85,.12);color:var(--ok);border:1px solid rgba(31,157,85,.25)}
    .pill.bad{background:rgba(214,69,69,.12);color:var(--bad);border:1px solid rgba(214,69,69,.25)}
    .pulse{position:relative}
    .pulse::after{content:"";position:absolute;inset:-6px;border-radius:inherit;border:2px solid currentColor;opacity:.35;animation:pulse 1.8s infinite}
    @keyframes pulse{0%{transform:scale(.95);opacity:.35}70%{transform:scale(1.1);opacity:0}100%{opacity:0}}
    .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
    .btn{background:var(--hl-blue);color:#fff;border:none;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer;box-shadow:var(--shadow)}
    .btn.secondary{background:#fff;color:var(--hl-blue);border:2px solid var(--hl-blue)}
    .muted{color:var(--hl-muted)}
    form{display:grid;gap:12px;max-width:520px}
    input,select{width:100%;padding:12px 14px;border-radius:12px;border:1px solid #d1d5db;outline:none;font-size:16px;}
    input:focus{border-color:var(--hl-blue);box-shadow:0 0 0 3px rgba(26,77,179,.15)}
    .split{display:grid;grid-template-columns:1fr;gap:16px}
    @media(min-width:720px){.split{grid-template-columns:1.2fr .8fr}}
    .hero{background:#fff;border-radius:var(--radius);padding:28px;display:grid;gap:10px;box-shadow:var(--shadow);border:1px solid #eef2ff}
    .badge{display:inline-block;padding:6px 10px;border-radius:10px;font-size:12px;background:#eef2ff;color:var(--hl-blue);font-weight:700}
    .progress{height:14px;border-radius:999px;background:#eef2ff;overflow:hidden}
    .bar{height:100%;background:var(--warning);width:0%}
    footer{margin:36px 0;color:var(--hl-muted);font-size:14px}
    code.kv{background:#0b1f3b10;padding:4px 8px;border-radius:8px}
    table{border-collapse:separate;border-spacing:0;width:100%;margin-top:8px}
    th,td{padding:8px 10px;border-bottom:1px solid #eef2ff;text-align:left}
    th{font-size:12px;letter-spacing:.02em;text-transform:uppercase;color:var(--hl-muted)}
  `;
  return `<!doctype html><html lang="en"><head>
    <meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>${escapeHtml(title)}</title><style>${css}</style>
  </head><body>
    <header>
      <div class="brand"><a href="/">Lambda Function Demo</a></div>
      <nav>
        <a href="/health?status=up">Health</a>
        <a href="/competition">Competition</a>
        <a href="/canary">Canary</a>
      </nav>
    </header>
    <main>${body}</main>
    <footer><span class="muted">Demo UI deployed by Harness Pipelines</span></footer>
  </body></html>`;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function healthView(statusParam){
  const up = (statusParam||"").toLowerCase()==="down" ? false : true;
  const stateText = up ? "System Healthy" : "System Down";
  const pillClass = up ? "pill ok pulse" : "pill bad pulse";
  const blurb = up
    ? "All critical checks passed. Latency within SLO, error budget healthy."
    : "One or more checks failed. Investigating and applying remediation.";
  return `
    <section class="hero">
      <span class="badge">/health</span>
      <h1>${stateText}</h1>
      <p class="muted">Use <code class="kv">?status=up</code> or <code class="kv">?status=down</code> to simulate.</p>
      <div class="${pillClass}">● ${up ? "UP" : "DOWN"}</div>
      <div class="card"><h2>Details</h2><p>${blurb}</p></div>
      <div class="actions">
        <a class="btn" href="/health?status=up">Set Up</a>
        <a class="btn secondary" href="/health?status=down">Set Down</a>
      </div>
    </section>`;
}

function competitionView(){
  return `
    <section class="hero">
      <span class="badge">/competition</span>
      <h1>T-Shirt Giveaway</h1>
      <p class="muted">Enter the monthly draw to win a limited-edition tee.</p>
      <div class="split">
        <div class="card">
          <h2>Enter the draw</h2>
          <form id="giveaway">
            <input name="name" placeholder="Your name" required/>
            <input type="email" name="email" placeholder="Email address" required/>
            <select name="size" required>
              <option value="">T-shirt size</option>
              <option>XS</option><option>S</option><option>M</option>
              <option>L</option><option>XL</option><option>XXL</option>
            </select>
            <button class="btn" type="submit">Enter giveaway</button>
          </form>
        </div>
        <div class="card">
          <h2>About the prize</h2>
          <p>Comfy fit, tasteful logo. Fill in your details, grab a screenshot and share with the Harness Team</p>
          <ul>
            <li>One entry per person</li>
            <li>No purchase necessary</li>
            <li>We only use your email to contact the winner</li>
          </ul>
        </div>
      </div>
    </section>
    <script>
      const form = document.getElementById('giveaway');
      form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const name = data.get('name');
        const size = data.get('size');
        form.outerHTML = '<div class="card"><h2>All set 🎉</h2><p>Thanks, ' +
          (name ? String(name) : 'friend') +
          '! You\\'re in the draw. We\\'ll email the winner. Selected size: <strong>' + size + '</strong>.</p></div>';
      });
    </script>`;
}

/* ============== CANARY (alias-weight aware) ============== */
const clamp = (n)=>Math.max(0, Math.min(100, n));

function getAliasFromArn(invokedFunctionArn){
  if(!invokedFunctionArn) return null;
  const marker = ':function:';
  const i = invokedFunctionArn.indexOf(marker);
  if(i === -1) return null;
  const rest = invokedFunctionArn.slice(i + marker.length); // functionName[:qualifier]
  const parts = rest.split(':');
  return parts.length > 1 ? parts[1] : null; // alias or version as qualifier
}
function getFunctionNameFromArn(invokedFunctionArn){
  // arn:aws:lambda:region:acct:function:functionName[:qualifier]
  if(!invokedFunctionArn) return null;
  const segments = invokedFunctionArn.split(':');
  const idx = segments.indexOf('function');
  return idx !== -1 && segments[idx+1] ? segments[idx+1] : null;
}

/** Minimal SigV4 signer for AWS Lambda GetAlias (no external deps) */
function hmac(key, data) { return crypto.createHmac('sha256', key).update(data, 'utf8').digest(); }
function sha256(data) { return crypto.createHash('sha256').update(data, 'utf8').digest('hex'); }
function getSignatureKey(key, dateStamp, region, service) {
  const kDate = hmac('AWS4' + key, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  return kSigning;
}

/** Call Lambda GetAlias to fetch routing weights */
async function fetchAliasInfo({ region, functionName, alias }) {
  const host = `lambda.${region}.amazonaws.com`;
  const method = 'GET';
  const path = `/2015-03-31/functions/${encodeURIComponent(functionName)}/aliases/${encodeURIComponent(alias)}`;
  const query = '';
  const service = 'lambda';

  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;
  if (!accessKey || !secretKey) throw new Error('Missing AWS credentials in environment');

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g,''); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0,8);

  const signedHeaders = 'host;x-amz-date' + (sessionToken ? ';x-amz-security-token' : '');
  const headers = {
    'host': host,
    'x-amz-date': amzDate,
    ...(sessionToken ? {'x-amz-security-token': sessionToken} : {})
  };

  const canonicalHeaders =
      `host:${host}\n` +
      `x-amz-date:${amzDate}\n` +
      (sessionToken ? `x-amz-security-token:${sessionToken}\n` : '');

  const payloadHash = sha256(''); // GET, no body
  const canonicalRequest = [
    method,
    path,
    query,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    sha256(canonicalRequest)
  ].join('\n');

  const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

  const authorizationHeader =
    `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const requestOptions = {
    method,
    host,
    path,
    headers: {
      ...headers,
      'Authorization': authorizationHeader
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        } else {
          const err = new Error(`GetAlias failed (${res.statusCode}): ${data}`);
          err.statusCode = res.statusCode;
          resolve({ __error: err.message }); // resolve with marker so UI can show fallback
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

/** Compute this version's weight from alias info */
function computeWeightForVersion(aliasInfo, thisVersion){
  // If aliasInfo is missing or malformed, return null
  if (!aliasInfo || typeof aliasInfo !== 'object' || aliasInfo.__error) return null;

  const baseVersion = aliasInfo.FunctionVersion; // string, e.g. "1"
  const add = (aliasInfo.RoutingConfig && aliasInfo.RoutingConfig.AdditionalVersionWeights) || {};
  // AWS stores additional weights as decimals (0.5). Console shows percents.
  const sumAdditional = Object.values(add).reduce((a,b)=>a + Number(b||0), 0);
  if (String(thisVersion) === String(baseVersion)) {
    const w = Math.max(0, 1 - sumAdditional);
    return Math.round(w * 100);
  }
  if (Object.prototype.hasOwnProperty.call(add, String(thisVersion))) {
    return Math.round(Number(add[String(thisVersion)]) * 100);
  }
  // If version not present, weight is 0
  return 0;
}

function canaryViewUI({ percent, version, alias, aliasInfo, headerFlag }){
  const pct = clamp(parseInt(String(percent||0),10) || 0);
  const segment = pct===0 ? "BLUE" : pct>=100 ? "GREEN" : "CANARY";
  const headerNote = headerFlag ? `<p class="muted">Request header <code class="kv">X-Canary: ${escapeHtml(headerFlag)}</code></p>` : "";

  const table = aliasInfo && !aliasInfo.__error ? (() => {
    const base = aliasInfo.FunctionVersion;
    const add = (aliasInfo.RoutingConfig && aliasInfo.RoutingConfig.AdditionalVersionWeights) || {};
    const rows = [];
    // base row weight = 1 - sum(additional)
    const baseWeight = Math.max(0, 1 - Object.values(add).reduce((a,b)=>a + Number(b||0), 0));
    rows.push([String(base), Math.round(baseWeight*100)]);
    for (const [v,w] of Object.entries(add)) rows.push([v, Math.round(Number(w)*100)]);
    // sort numerically by version
    rows.sort((a,b)=>parseInt(a[0],10)-parseInt(b[0],10));
    return `<div class="card">
      <h2>Alias traffic split</h2>
      <table><thead><tr><th>Version</th><th>Weight</th></tr></thead><tbody>
        ${rows.map(([v,w])=>`<tr${v===String(version)?' style="font-weight:700"':''}><td>${v}${v===String(version)?' (this)':''}</td><td>${w}%</td></tr>`).join('')}
      </tbody></table>
    </div>`;
  })() : (aliasInfo && aliasInfo.__error ? `<div class="card"><h2>Alias lookup</h2><p class="muted">Could not query alias weights: ${escapeHtml(aliasInfo.__error)}</p></div>` : "");

  return `
    <section class="hero">
      <span class="badge">/canary</span>
      <h1>Canary Deployment</h1>
      <p class="muted">Running version <strong>${version}</strong>${alias ? ` via alias <strong>${escapeHtml(alias)}</strong>` : " (no alias detected)"}.</p>
      ${headerNote}
      <div class="card">
        <h2>Rollout status</h2>
        <p>Serving segment: <span class="pill ${segment!=="BLUE" ? "ok" : ""}">${segment}</span></p>
        <div class="progress" aria-label="canary percent"><div class="bar" style="width:${pct}%"></div></div>
        <p class="muted">Traffic weight for <strong>this version</strong>: <strong>${pct}%</strong></p>
      </div>
      ${table}
      <div class="actions">
        <a class="btn secondary" href="/canary">Refresh</a>
      </div>
      <p class="muted">Weights shown are read live from the Lambda alias configuration.</p>
    </section>`;
}

/* ============== HANDLER ============== */
exports.handler = async (event, context) => {
  const path = (event.rawPath || event.path || "/").toLowerCase();
  const q = event.queryStringParameters || {};
  let title = "HL-style Demo";
  let content = "";

  if (path.startsWith("/health")) {
    title = "Health";
    content = healthView(q.status);
  } else if (path.startsWith("/competition")) {
    title = "Competition";
    content = competitionView();
  } else if (path.startsWith("/canary")) {
    title = "Canary";

    // Detect version + alias + region + function name
    const version = String(context?.functionVersion || "$LATEST");
    const alias = getAliasFromArn(context?.invokedFunctionArn);
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
    const functionName = getFunctionNameFromArn(context?.invokedFunctionArn) || context?.functionName;

    let aliasInfo = null;
    let computedPercent = 0;

    if (alias && functionName) {
      try {
        aliasInfo = await fetchAliasInfo({ region, functionName, alias });
        const w = computeWeightForVersion(aliasInfo, version);
        if (w !== null && w !== undefined) computedPercent = w;
      } catch (e) {
        aliasInfo = { __error: String(e && e.message || e) };
      }
    } else {
      aliasInfo = { __error: "Invocation not via alias; no weights set at alias level." };
    }

    const headerFlag = event.headers?.["x-canary"] || event.headers?.["X-Canary"];
    content = canaryViewUI({
      percent: computedPercent,
      version,
      alias,
      aliasInfo,
      headerFlag: typeof headerFlag === "string" ? headerFlag : undefined
    });

  } else {
    content = `
      <section class="hero">
        <span class="badge">/</span>
        <h1>Welcome</h1>
        <p class="muted">Try the demo routes below.</p>
        <div class="card">
          <h2>Routes</h2>
          <ul>
            <li><a href="/health?status=up">/health</a> – system status (up or down)</li>
            <li><a href="/competition">/competition</a> – T-shirt giveaway</li>
            <li><a href="/canary">/canary</a> – shows live alias weight for this version</li>
          </ul>
        </div>
      </section>`;
  }

  const html = pageShell(title, content);
  return {
    statusCode: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    },
    body: html
  };
};

