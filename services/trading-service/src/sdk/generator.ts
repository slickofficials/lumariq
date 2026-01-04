import fs from "fs";
import path from "path";

type GenerateSdkOpts = {
  outDir?: string;
  baseUrl?: string;
};

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p: string, content: string) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, "utf8");
}

export function generateSDK(opts: GenerateSdkOpts = {}) {
  const outDir = opts.outDir || path.join(process.cwd(), "sdk");
  const baseUrl = (opts.baseUrl || "http://localhost:4010").replace(/\/+$/, "");

  ensureDir(outDir);

  // JS client (runtime)
  const js = [
    "/* Auto-generated SDK (v1) */",
    "/* eslint-disable */",
    "",
    "function req(method, url, body, apiKey) {",
    "  const headers = { 'Content-Type': 'application/json' };",
    "  if (apiKey) headers['x-api-key'] = apiKey;",
    "  return fetch(url, {",
    "    method,",
    "    headers,",
    "    body: body ? JSON.stringify(body) : undefined",
    "  }).then(async (r) => {",
    "    const txt = await r.text();",
    "    let json;",
    "    try { json = JSON.parse(txt); } catch { json = { raw: txt }; }",
    "    if (!r.ok) {",
    "      const err = new Error('HTTP ' + r.status);",
    "      // @ts-ignore",
    "      err.data = json;",
    "      throw err;",
    "    }",
    "    return json;",
    "  });",
    "}",
    "",
    "exports.client = function client(apiKey, baseUrl) {",
    "  const BASE = (baseUrl || '" + baseUrl + "').replace(/\\/+$/, '');",
    "  return {",
    "    billingInit: (payload) => req('POST', BASE + '/billing/init', payload, apiKey),",
    "    billingVerify: (reference) => req('GET', BASE + '/billing/verify/' + encodeURIComponent(reference), null, apiKey),",
    "    health: () => req('GET', BASE + '/health', null, apiKey),",
    "  };",
    "};",
    ""
  ].join("\\n");

  // TS types (optional)
  const dts = [
    "export type BillingInitPayload = {",
    "  email: string;",
    "  amount: number;",
    "  country?: string;",
    "};",
    "",
    "export type BillingInitResponse = any;",
    "export type BillingVerifyResponse = any;",
    "",
    "export function client(apiKey?: string, baseUrl?: string): {",
    "  billingInit(payload: BillingInitPayload): Promise<BillingInitResponse>;",
    "  billingVerify(reference: string): Promise<BillingVerifyResponse>;",
    "  health(): Promise<any>;",
    "};",
    ""
  ].join("\\n");

  // TS wrapper (import-friendly)
  const ts = [
    "/* Auto-generated SDK (v1) */",
    "/* eslint-disable */",
    "import type { BillingInitPayload } from './index';",
    "",
    "function req(method: string, url: string, body: any, apiKey?: string) {",
    "  const headers: Record<string, string> = { 'Content-Type': 'application/json' };",
    "  if (apiKey) headers['x-api-key'] = apiKey;",
    "  return fetch(url, {",
    "    method,",
    "    headers,",
    "    body: body ? JSON.stringify(body) : undefined,",
    "  }).then(async (r) => {",
    "    const txt = await r.text();",
    "    let json: any;",
    "    try { json = JSON.parse(txt); } catch { json = { raw: txt }; }",
    "    if (!r.ok) {",
    "      const err: any = new Error('HTTP ' + r.status);",
    "      err.data = json;",
    "      throw err;",
    "    }",
    "    return json;",
    "  });",
    "}",
    "",
    "export function client(apiKey?: string, baseUrl?: string) {",
    "  const BASE = (baseUrl || '" + baseUrl + "').replace(/\\/+$/, '');",
    "  return {",
    "    billingInit: (payload: BillingInitPayload) => req('POST', BASE + '/billing/init', payload, apiKey),",
    "    billingVerify: (reference: string) => req('GET', BASE + '/billing/verify/' + encodeURIComponent(reference), null, apiKey),",
    "    health: () => req('GET', BASE + '/health', null, apiKey),",
    "  };",
    "}",
    ""
  ].join("\\n");

  writeFile(path.join(outDir, "client.js"), js);
  writeFile(path.join(outDir, "index.d.ts"), dts);
  writeFile(path.join(outDir, "index.ts"), dts);
  writeFile(path.join(outDir, "client.ts"), ts);

  return { outDir, baseUrl };
}
