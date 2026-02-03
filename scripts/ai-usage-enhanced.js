/**
 * AI Usage Logger - Enhanced com tracking detalhado
 * 
 * Usage:
 * - Import: const { logAiUsage } = require('./scripts/ai-usage-enhanced')
 * - logAiUsage({ provider, model, prompt_tokens, completion_tokens, project, cost, reason })
 * 
 * Reason examples:
 * - "igaming_image" - Geração de imagem para reels
 * - "igaming_video" - Criação de vídeo
 * - "petselect_carousel" - Carousel para PetSelect
 * - "transcription" - Transcrição de áudio
 * - "chat_completion" - Resposta de chat
 */

const fs = require('node:fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LEDGER = path.join(ROOT, 'results', 'ai-usage.jsonl');

// Pricing por 1M tokens (USD)
const PRICING = {
  // Google Gemini
  'gemini-1.5-pro': { input: 5.00, output: 15.00, type: 'per_million' },
  'gemini-1.5-flash': { input: 0.075, output: 0.30, type: 'per_million' },
  'gemini-1.0-pro': { input: 0.50, output: 1.50, type: 'per_million' },
  'gemini-2.0-flash': { input: 0.01, output: 0.03, type: 'per_million' },
  'gemini-3-pro-image-preview': { input: 0.55, output: 1.65, type: 'per_million' },
  
  // OpenAI
  'gpt-4': { input: 30.00, output: 60.00, type: 'per_million' },
  'gpt-4-turbo': { input: 10.00, output: 30.00, type: 'per_million' },
  'gpt-3.5-turbo': { input: 0.50, output: 1.50, type: 'per_million' },
  
  // Anthropic
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00, type: 'per_million' },
  'claude-3-5-haiku-20241022': { input: 0.25, output: 1.25, type: 'per_million' },
  'claude-3-opus-20240229': { input: 15.00, output: 75.00, type: 'per_million' },
  
  // OpenRouter
  'openrouter/auto': { input: 0.10, output: 0.30, type: 'per_million' },
};

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function calculateCost(model, inputTokens, outputTokens) {
  const price = PRICING[model];
  if (!price) return 0;
  
  const inputCost = (price.input / 1_000_000) * inputTokens;
  const outputCost = (price.output / 1_000_000) * outputTokens;
  return inputCost + outputCost;
}

function logAiUsage({ 
  provider, 
  model, 
  prompt_tokens = 0, 
  completion_tokens = 0, 
  project = 'unknown',
  cost = null,
  reason = 'unknown',  // <-- NOVO: por que usou?
  metadata = {}
}) {
  try {
    ensureDir(LEDGER);
    
    const totalTokens = Number(prompt_tokens || 0) + Number(completion_tokens || 0);
    const costUsd = cost !== null ? Number(cost) : calculateCost(model, prompt_tokens, completion_tokens);
    
    const entry = {
      timestamp: new Date().toISOString(),
      provider: provider || 'unknown',
      model: model || 'unknown',
      project,
      reason,  // <-- NOVO
      prompt_tokens: Number(prompt_tokens || 0),
      completion_tokens: Number(completion_tokens || 0),
      total_tokens: totalTokens,
      cost_usd: costUsd,
      metadata
    };
    
    fs.appendFileSync(LEDGER, JSON.stringify(entry) + '\n');
    
    // Console log para debugging
    if (costUsd > 0.01) {
      console.log(`💰 [${model}] ${totalTokens.toLocaleString()} tok | $${costUsd.toFixed(4)} | ${reason}`);
    }
    
    return entry;
  } catch (e) {
    console.error('Error logging AI usage:', e.message);
    return null;
  }
}

// Convenience functions
function logGemini({ model, prompt_tokens, completion_tokens, project, reason, ...opts }) {
  return logAiUsage({ 
    provider: 'google', 
    model, 
    prompt_tokens, 
    completion_tokens, 
    project, 
    reason,
    ...opts 
  });
}

function logOpenAI({ model, prompt_tokens, completion_tokens, project, reason, ...opts }) {
  return logAiUsage({ 
    provider: 'openai', 
    model, 
    prompt_tokens, 
    completion_tokens, 
    project, 
    reason,
    ...opts 
  });
}

function logAnthropic({ model, prompt_tokens, completion_tokens, project, reason, ...opts }) {
  return logAiUsage({ 
    provider: 'anthropic', 
    model, 
    prompt_tokens, 
    completion_tokens, 
    project, 
    reason,
    ...opts 
  });
}

// Cost summary function
function getCostSummary() {
  if (!fs.existsSync(LEDGER)) return { today: 0, month: 0, byReason: {} };
  
  const lines = fs.readFileSync(LEDGER, 'utf8').split('\n').filter(l => l.trim());
  const records = lines.map(l => JSON.parse(l)).filter(Boolean);
  
  const today = new Date().toISOString().split('T')[0];
  const month = today.slice(0, 7);
  
  let todayCost = 0;
  let monthCost = 0;
  const byReason = {};
  
  for (const r of records) {
    const date = r.timestamp.split('T')[0];
    const cost = r.cost_usd || 0;
    
    if (date === today) todayCost += cost;
    if (date.startsWith(month)) monthCost += cost;
    
    if (!byReason[r.reason]) byReason[r.reason] = { tokens: 0, cost: 0, count: 0 };
    byReason[r.reason].tokens += r.total_tokens || 0;
    byReason[r.reason].cost += cost;
    byReason[r.reason].count += 1;
  }
  
  return { today: todayCost, month: monthCost, byReason };
}

module.exports = {
  logAiUsage,
  logGemini,
  logOpenAI,
  logAnthropic,
  getCostSummary,
  PRICING
};
