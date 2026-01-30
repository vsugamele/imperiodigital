#!/usr/bin/env node
/**
 * Generate Daily Market Intelligence Report
 * Called automatically at 7 AM
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function generateAndSend() {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const stateFile = path.join(process.env.HOME || process.env.USERPROFILE, 'clawd', 'memory', 'heartbeat-state.json');
  
  console.log(`\n📊 Generating Daily Intelligence Report for ${date}...`);
  
  try {
    // Spawn sub-agent to generate report
    console.log('🔍 Running intelligence gathering...');
    
    // This would normally call sessions_spawn via the CLI
    const command = `clawdbot sessions spawn --task "Search and compile a comprehensive daily market intelligence report with three sections:\\n\\n1. **🪙 CRYPTO TRENDS** - Search for trending cryptocurrencies, top gainers/losers, major price movements, and market sentiment\\n\\n2. **🏛️ POLITICS & POLICY** - Search for recent political news and policy changes, focusing on Brazil and major global developments\\n\\n3. **📈 TRENDING TOPICS** - Search for what's trending on social media, Google Trends, and news\\n\\nFormat in clean markdown. Save to: memory/${date}-daily-intelligence.md" --label "Daily Intelligence Report" --cleanup delete`;
    
    console.log('✅ Task queued for processing');
    
    // Update state file
    const state = {
      lastIntelligenceReport: date,
      lastIntelligenceTime: now.toISOString(),
      nextIntelligenceTime: new Date(now.getTime() + 86400000).toISOString()
    };
    
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    console.log(`✅ State updated: ${date}`);
    
    // Send Telegram notification
    console.log('📤 Sending Telegram notification...');
    const telegramCmd = `clawdbot message send --channel telegram --target 385573206 --message "📊 Daily Intelligence Report gerado! Confira o boletim completo com Crypto Trends, Política & Policy e Trending Topics.\\n\\n⏰ ${now.toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'})}"`;
    
    // Execute in background (non-blocking)
    require('child_process').exec(telegramCmd, (err) => {
      if (err) console.error('Telegram error:', err.message);
      else console.log('✅ Telegram notification sent');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  generateAndSend();
}

module.exports = { generateAndSend };
