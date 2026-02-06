/**
 * AUTO-TRAFFIC - Traffic Orchestrator
 * Sistema autônomo de automação de tráfego com Meta Ads + Google Ads
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuração
const CONFIG = {
  checkInterval: 60 * 60 * 1000, // 1 hora
  reportInterval: 6 * 60 * 60 * 1000, // 6 horas
  
  killRules: {
    roas: { threshold: 1.0, impressions: 1000 },
    cpa: { threshold: 2.0, impressions: 1000 },
    ctr: { threshold: 0.5, impressions: 500 },
    frequency: { threshold: 4.0, impressions: 2000 }
  },
  
  scaleRules: {
    vertical: { roas: 2.5, days: 3, budgetIncrease: 0.20 },
    horizontal: { roas: 3.0, frequency: 2.0 }
  }
};

class TrafficOrchestrator {
  constructor() {
    this.metaCampaigns = [];
    this.googleCampaigns = [];
    this.actions = [];
    this.killedCount = 0;
    this.scaledCount = 0;
  }

  async run() {
    console.log('🚀 AUTO-TRAFFIC Started');
    console.log('='.repeat(50));
    
    const startTime = new Date();
    
    // 1. Fetch campanhas do Meta Ads
    console.log('\n📱 Fetching Meta Ads campaigns...');
    this.metaCampaigns = await this.fetchMetaCampaigns();
    
    // 2. Fetch campanhas do Google Ads
    console.log('\n🔍 Fetching Google Ads campaigns...');
    this.googleCampaigns = await this.fetchGoogleCampaigns();
    
    // 3. Avaliar KILL rules
    console.log('\n🔴 Evaluating KILL rules...');
    await this.evaluateKillRules();
    
    // 4. Avaliar SCALE rules
    console.log('\n🟢 Evaluating SCALE rules...');
    await this.evaluateScaleRules();
    
    // 5. Gerar relatório
    console.log('\n📊 Generating report...');
    this.generateReport(startTime);
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ AUTO-TRAFFIC Complete`);
    console.log(`   Killed: ${this.killedCount} | Scaled: ${this.scaledCount}`);
    
    return this.actions;
  }

  async fetchMetaCampaigns() {
    const token = process.env.META_ACCESS_TOKEN;
    const adAccount = process.env.META_AD_ACCOUNT_ID;
    
    if (!token || !adAccount) {
      console.log('   ⚠️ Meta credentials not configured');
      return this.generateMockMetaCampaigns();
    }

    try {
      const url = `https://graph.facebook.com/v18.0/${adAccount}/insights?fields=campaign_name,campaign_id,adset_name,adset_id,impressions,clicks,cpc,cpm,ctr,conversions,spend,roas,actions&access_token=${token}`;
      
      const response = await this.httpGet(url);
      const data = JSON.parse(response);
      
      return data.data || [];
    } catch (error) {
      console.log(`   ❌ Error fetching Meta: ${error.message}`);
      return this.generateMockMetaCampaigns();
    }
  }

  async fetchGoogleCampaigns() {
    const customerId = process.env.GOOGLE_CUSTOMER_ID;
    
    if (!customerId) {
      console.log('   ⚠️ Google credentials not configured');
      return this.generateMockGoogleCampaigns();
    }

    try {
      // Google Ads API integration
      console.log('   🔧 Google Ads API not yet configured - using mock data');
      return this.generateMockGoogleCampaigns();
    } catch (error) {
      console.log(`   ❌ Error fetching Google: ${error.message}`);
      return this.generateMockGoogleCampaigns();
    }
  }

  async evaluateKillRules() {
    const rules = CONFIG.killRules;
    
    for (const campaign of this.metaCampaigns) {
      let killed = false;
      let reason = null;
      
      if (parseFloat(campaign.roas || 0) < rules.roas.threshold && 
          parseInt(campaign.impressions || 0) >= rules.roas.impressions) {
        killed = true;
        reason = `ROAS ${campaign.roas} < ${rules.roas.threshold}`;
      }
      
      if (!killed && parseFloat(campaign.cpa || 0) > rules.cpa.threshold && 
          parseInt(campaign.impressions || 0) >= rules.cpa.impressions) {
        killed = true;
        reason = `CPA ${campaign.cpa} > ${rules.cpa.threshold}x target`;
      }
      
      if (!killed && parseFloat(campaign.ctr || 0) < rules.ctr.threshold && 
          parseInt(campaign.impressions || 0) >= rules.ctr.impressions) {
        killed = true;
        reason = `CTR ${campaign.ctr}% < ${rules.ctr.threshold}%`;
      }

      if (!killed && parseFloat(campaign.frequency || 0) > rules.frequency.threshold && 
          parseInt(campaign.impressions || 0) >= rules.frequency.impressions) {
        killed = true;
        reason = `Frequency ${campaign.frequency} > ${rules.frequency.threshold}`;
      }

      if (killed) {
        this.killedCount++;
        this.actions.push({
          type: 'KILL',
          platform: 'META',
          campaign: campaign.campaign_name,
          adset: campaign.adset_name,
          reason,
          timestamp: new Date().toISOString()
        });
        console.log(`   🔴 KILL: ${campaign.campaign_name} - ${reason}`);
      }
    }
  }

  async evaluateScaleRules() {
    const rules = CONFIG.scaleRules;
    
    for (const campaign of this.metaCampaigns) {
      let scaled = false;
      let reason = null;
      
      // Scale Vertical
      if (parseFloat(campaign.roas || 0) >= rules.vertical.roas) {
        scaled = true;
        reason = `ROAS ${campaign.roas} >= ${rules.vertical.roas} - BUDGET +${rules.vertical.budgetIncrease * 100}%`;
      }
      
      // Scale Horizontal
      if (!scaled && parseFloat(campaign.roas || 0) >= rules.horizontal.roas && 
          parseFloat(campaign.frequency || 0) < rules.horizontal.frequency) {
        scaled = true;
        reason = `ROAS ${campaign.roas} >= ${rules.horizontal.roas} + Freq < ${rules.horizontal.frequency} - NEW AUDIENCE`;
      }

      if (scaled) {
        this.scaledCount++;
        this.actions.push({
          type: 'SCALE',
          platform: 'META',
          campaign: campaign.campaign_name,
          adset: campaign.adset_name,
          reason,
          timestamp: new Date().toISOString()
        });
        console.log(`   🟢 SCALE: ${campaign.campaign_name} - ${reason}`);
      }
    }
  }

  generateReport(startTime) {
    const report = {
      period: {
        start: startTime.toISOString(),
        end: new Date().toISOString()
      },
      summary: {
        totalMetaCampaigns: this.metaCampaigns.length,
        totalGoogleCampaigns: this.googleCampaigns.length,
        killedCount: this.killedCount,
        scaledCount: this.scaledCount,
        totalActions: this.actions.length
      },
      actions: this.actions,
      topPerforming: this.metaCampaigns
        .filter(c => parseFloat(c.roas || 0) > 3)
        .sort((a, b) => parseFloat(b.roas || 0) - parseFloat(a.roas || 0))
        .slice(0, 5),
      worstPerforming: this.metaCampaigns
        .filter(c => parseFloat(c.roas || 0) < 1)
        .sort((a, b) => parseFloat(a.roas || 0) - parseFloat(b.roas || 0))
        .slice(0, 5)
    };

    // Salvar relatório
    const date = new Date().toISOString().split('T')[0];
    const reportPath = `results/traffic/${date}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`   💾 Report saved: ${reportPath}`);
    
    return report;
  }

  httpGet(url) {
    return new Promise((resolve, reject) => {
      https.get(url, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
        res.on('error', reject);
      }).on('error', reject);
    });
  }

  generateMockMetaCampaigns() {
    const names = ['teo-prospeccao', 'jonathan-remarketing', 'laise-engagement', 'pedro-conversion', 'petselect-uk'];
    const mock = [];
    
    for (let i = 0; i < 10; i++) {
      const roas = (Math.random() * 4).toFixed(2);
      const cpa = (Math.random() * 50 + 10).toFixed(2);
      const ctr = (Math.random() * 3 + 0.3).toFixed(2);
      const freq = (Math.random() * 5 + 1).toFixed(1);
      
      mock.push({
        campaign_name: `${names[i % names.length]}_${i + 1}`,
        campaign_id: `camp_${Date.now()}_${i}`,
        adset_name: `adset_${i + 1}`,
        adset_id: `adset_${Date.now()}_${i}`,
        impressions: Math.floor(Math.random() * 10000 + 1000),
        clicks: Math.floor(Math.random() * 500 + 50),
        cpc: (Math.random() * 2 + 0.5).toFixed(2),
        cpm: (Math.random() * 20 + 5).toFixed(2),
        ctr: ctr,
        conversions: Math.floor(Math.random() * 50 + 5),
        spend: (Math.random() * 500 + 50).toFixed(2),
        roas: roas,
        frequency: freq
      });
    }
    
    return mock;
  }

  generateMockGoogleCampaigns() {
    const mock = [];
    for (let i = 0; i < 5; i++) {
      mock.push({
        campaign_id: `google_${Date.now()}_${i}`,
        campaign_name: `google_campaign_${i + 1}`,
        status: 'ENABLED',
        roas: (Math.random() * 4).toFixed(2),
        cost: (Math.random() * 300 + 50).toFixed(2),
        conversions: Math.floor(Math.random() * 30 + 3)
      });
    }
    return mock;
  }
}

// CLI
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🚗 AUTO-TRAFFIC - Traffic Orchestrator

Usage:
  node scripts/auto-traffic/orchestrator.js
  node scripts/auto-traffic/orchestrator.js --mock
  node scripts/auto-traffic/orchestrator.js --report

Options:
  --mock   Use mock data (no API calls)
  --report Show last report
  --help   Show this help
`);
  process.exit(0);
}

if (args.includes('--report')) {
  const date = new Date().toISOString().split('T')[0];
  const reportPath = `results/traffic/${date}.json`;
  if (fs.existsSync(reportPath)) {
    console.log(fs.readFileSync(reportPath));
  } else {
    console.log('No report found for today');
  }
  process.exit(0);
}

const orchestrator = new TrafficOrchestrator();
orchestrator.run()
  .then(actions => {
    console.log(`\n📈 Total actions: ${actions.length}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
