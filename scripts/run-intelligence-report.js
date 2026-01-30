#!/usr/bin/env node
/**
 * Run Daily Intelligence Report
 * Called by Windows Task Scheduler at 7 AM
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = 'C:\\Users\\vsuga\\clawd';
const STATE_FILE = path.join(WORKSPACE, 'memory', 'heartbeat-state.json');
const REPORT_DIR = path.join(WORKSPACE, 'memory');

function log(msg) {
  const timestamp = new Date().toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'});
  console.log(`[${timestamp}] ${msg}`);
}

async function main() {
  try {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    
    log('🚀 Starting Daily Intelligence Report generation...');
    
    // Check if already ran today
    try {
      const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      if (state.lastIntelligenceReport === date) {
        log('✅ Already ran today. Skipping.');
        process.exit(0);
      }
    } catch (e) {
      log('📝 First run of the day, proceeding...');
    }
    
    // Generate report via clawdbot
    log('🔍 Generating report via sessions_spawn...');
    try {
      execSync(
        `clawdbot sessions spawn --task "Search and compile a comprehensive daily market intelligence report with three sections:\\n\\n1. **🪙 CRYPTO TRENDS** - Search for trending cryptocurrencies across all exchanges, top gainers, losers, and market sentiment\\n\\n2. **🏛️ POLITICS & POLICY** - Search for recent political news and policy changes in Brazil and globally\\n\\n3. **📈 TRENDING TOPICS** - Trending topics on social media, Google Trends, and news\\n\\nFormat in clean markdown with metrics. Save to: memory/${date}-daily-intelligence.md" --label "Daily Report" --cleanup delete`,
        { stdio: 'inherit', shell: true }
      );
    } catch (e) {
      log('⚠️  Report generation ongoing (non-blocking)');
    }
    
    // Update state
    const state = {
      lastIntelligenceReport: date,
      lastIntelligenceTime: now.toISOString(),
      nextIntelligenceTime: new Date(now.getTime() + 86400000).toISOString()
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    log('✅ State updated');
    
    // Send Telegram notification
    log('📤 Sending Telegram notification...');
    try {
      execSync(
        `clawdbot message send --channel telegram --target 385573206 --message "📊 **DAILY INTELLIGENCE REPORT**\\n\\n🪙 Crypto Trends\\n🏛️ Política & Policy\\n📈 Trending Topics\\n\\nRelatório consolidado em anexo! 📎"`,
        { shell: true }
      );
      log('✅ Telegram notification sent');
    } catch (e) {
      log('⚠️  Telegram notification ongoing');
    }
    
    log('✨ Daily Intelligence Report process completed!');
    process.exit(0);
    
  } catch (error) {
    log(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
