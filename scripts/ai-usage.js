const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const LEDGER = path.join(ROOT, 'results', 'ai-usage.jsonl');
const PRICING_PATH = path.join(ROOT, 'config', 'ai-pricing.json');

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function readPricing() {
  try {
    return JSON.parse(fs.readFileSync(PRICING_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function estimateCostUsd({ provider, model, inputTokens = 0, outputTokens = 0 }) {
  const pricing = readPricing();
  if (!pricing) return 0;

  if (provider === 'gemini') {
    const m = pricing.gemini?.[model];
    if (!m) return 0;
    const inCost = (Number(m.inputPer1M || 0) / 1_000_000) * inputTokens;
    const outCost = (Number(m.outputPer1M || 0) / 1_000_000) * outputTokens;
    return inCost + outCost;
  }

  // replicate pricing is not standardized here yet
  return 0;
}

function appendAiUsage(row) {
  try {
    ensureDir(LEDGER);

    const provider = row.provider || 'unknown';
    const model = row.model || 'unknown';
    const inputTokens = Number(row.inputTokens || 0) || 0;
    const outputTokens = Number(row.outputTokens || 0) || 0;

    const costUsd =
      row.costUsd != null ? Number(row.costUsd) || 0 : estimateCostUsd({ provider, model, inputTokens, outputTokens });

    const out = {
      ts: row.ts || new Date().toISOString(),
      provider,
      model,
      project: row.project || 'unknown',
      inputTokens,
      outputTokens,
      costUsd,
      meta: row.meta || undefined,
    };

    fs.appendFileSync(LEDGER, JSON.stringify(out) + '\n');
    return out;
  } catch {
    return null;
  }
}

module.exports = {
  appendAiUsage,
  estimateCostUsd,
};
