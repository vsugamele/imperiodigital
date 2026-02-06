/**
 * GROWTH ANALYTICS - Métricas de Crescimento dos Perfis
 * 
 * Coleta métricas de crescimento e integra com posting log
 * 
 * Usage:
 *   node scripts/growth-analytics.js --fetch teo
 *   node scripts/growth-analytics.js --fetch pedro
 *   node scripts/growth-analytics.js --fetch laise
 *   node scripts/growth-analytics.js --report
 */

const fs = require('fs');
const https = require('https');

class GrowthAnalytics {
  constructor() {
    this.name = 'GROWTH ANALYTICS';
    this.version = '1.0';
    
    // Perfis monitorados
    this.accounts = {
      teo: {
        username: 'teofilipe',
        platform: 'instagram',
        displayName: 'Teo',
        niche: 'comedy/entertainment'
      },
      jonathan: {
        username: 'jonathanofc1',
        platform: 'instagram', 
        displayName: 'Jonathan',
        niche: 'comedy'
      },
      laise: {
        username: 'laisegouveia',
        platform: 'instagram',
        displayName: 'Laise',
        niche: 'lifestyle/fashion'
      },
      pedro: {
        username: 'pedrovieira',
        platform: 'instagram',
        displayName: 'Pedro',
        niche: 'comedy'
      },
      petselectuk: {
        username: 'petselectuk',
        platform: 'instagram',
        displayName: 'PetSelect UK',
        niche: 'pets'
      }
    };
    
    // Métricas (simuladas - em produção usaria APIs)
    this.metrics = {
      followers: null,
      following: null,
      posts: null,
      engagement: null,
      avgLikes: null,
      avgComments: null,
      growthRate: null,
      reach: null,
      impressions: null,
      profileViews: null,
      websiteClicks: null,
      followerGrowth: null, // Crescimento de seguidores (%)
      avgReach: null,
      saveRate: null,
      shareRate: null
    };
    
    // Storage
    this.dataDir = 'results/growth';
    this.logPath = 'results/posting-log-v2.csv';
  }

  async run(input) {
    console.log(`\n📊 ${this.name} v${this.version}`);
    console.log('='.repeat(60));
    
    try {
      const args = this.parseArgs(input);
      
      if (args.mode === 'help') {
        this.showHelp();
        return;
      }
      
      if (args.mode === 'report') {
        return this.generateReport();
      }
      
      if (args.mode === 'fetch') {
        return this.fetchMetrics(args.account);
      }
      
      if (args.mode === 'fetch-all') {
        return this.fetchAllAccounts();
      }
      
      this.showHelp();
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  parseArgs(input) {
    const args = input || process.argv.slice(2).join(' ');
    const parsed = { mode: 'help', account: null };
    
    if (args.includes('--help')) return parsed;
    
    if (args.includes('--report')) {
      parsed.mode = 'report';
      return parsed;
    }
    
    if (args.includes('--fetch-all')) {
      parsed.mode = 'fetch-all';
      return parsed;
    }
    
    const accountArg = args.split(/\s+/).find(a => !a.startsWith('--'));
    if (accountArg && this.accounts[accountArg]) {
      parsed.mode = 'fetch';
      parsed.account = accountArg;
    }
    
    return parsed;
  }

  async fetchMetrics(account) {
    const info = this.accounts[account];
    console.log(`\n📊 Fetching metrics for: @${info.username}`);
    
    // Simular métricas de crescimento (em produção, usaria Instagram API)
    const metrics = this.generateMockMetrics(account);
    
    // Salvar métricas
    this.saveMetrics(account, metrics);
    
    // Adicionar ao posting log (simulado)
    this.logMetrics(account, metrics);
    
    this.printMetrics(account, metrics);
    
    return metrics;
  }

  async fetchAllAccounts() {
    console.log('\n🔄 Fetching all accounts...\n');
    
    const results = {};
    
    for (const account of Object.keys(this.accounts)) {
      results[account] = await this.fetchMetrics(account);
    }
    
    // Gerar relatório consolidado
    this.generateConsolidatedReport(results);
    
    return results;
  }

  generateMockMetrics(account) {
    // Gerar métricas baseadas em comportamento típico
    
    // Crescimento de seguidores (%)
    const followerGrowth = (Math.random() * 5 - 1).toFixed(2); // -1% a +4%
    
    // Engajamento médio
    const engagement = (Math.random() * 5 + 2).toFixed(2); // 2% a 7%
    
    return {
      timestamp: new Date().toISOString(),
      account,
      
      // Métricas básicas
      followers: this.getFollowers(account, followerGrowth),
      following: Math.floor(Math.random() * 500 + 200),
      posts: Math.floor(Math.random() * 500 + 100),
      
      // Engajamento
      engagement: parseFloat(engagement),
      avgLikes: Math.floor(Math.random() * 50000 + 5000),
      avgComments: Math.floor(Math.random() * 500 + 50),
      
      // Crescimento
      followerGrowth: parseFloat(followerGrowth),
      followerChange: Math.floor((parseFloat(followerGrowth) / 100) * this.getFollowers(account, followerGrowth)),
      
      // Alcance (Reach)
      reach: Math.floor(Math.random() * 100000 + 20000),
      impressions: Math.floor(Math.random() * 200000 + 50000),
      profileViews: Math.floor(Math.random() * 5000 + 500),
      websiteClicks: Math.floor(Math.random() * 500 + 50),
      
      // taxas
      saveRate: (Math.random() * 3 + 0.5).toFixed(2),
      shareRate: (Math.random() * 2 + 0.2).toFixed(2),
      
      // Top posts (últimos 3)
      topPosts: this.generateTopPosts()
    };
  }

  getFollowers(account, growth) {
    const base = {
      teo: 1500000,
      jonathan: 800000,
      laise: 300000,
      pedro: 500000,
      petselectuk: 50000
    };
    
    const followers = base[account] || 100000;
    return Math.floor(followers * (1 + parseFloat(growth) / 100));
  }

  generateTopPosts() {
    const types = ['Reels', 'Carrossel', 'Image'];
    const topics = ['comedy', 'lifestyle', 'pets', 'viral', 'trend'];
    
    const posts = [];
    for (let i = 0; i < 3; i++) {
      posts.push({
        type: types[Math.floor(Math.random() * types.length)],
        topic: topics[Math.floor(Math.random() * topics.length)],
        likes: Math.floor(Math.random() * 100000 + 10000),
        comments: Math.floor(Math.random() * 1000 + 100),
        reach: Math.floor(Math.random() * 200000 + 30000),
        date: new Date(Date.now() - i * 86400000).toISOString()
      });
    }
    
    return posts;
  }

  saveMetrics(account, metrics) {
    const dir = `${this.dataDir}/${account}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const path = `${dir}/metrics-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(path, JSON.stringify(metrics, null, 2));
    
    // Salvar Latest
    fs.writeFileSync(`${dir}/latest.json`, JSON.stringify(metrics, null, 2));
    
    console.log(`   💾 Saved: ${path}`);
  }

  logMetrics(account, metrics) {
    // Adicionar métricas ao posting log (colunas extras)
    const logEntry = {
      timestamp: metrics.timestamp,
      account,
      followers: metrics.followers,
      followerGrowth: metrics.followerGrowth,
      engagement: metrics.engagement,
      avgLikes: metrics.avgLikes,
      reach: metrics.reach
    };
    
    const logPath = `${this.dataDir}/growth-log.csv`;
    const header = Object.keys(logEntry).join(',');
    const values = Object.values(logEntry).join(',');
    
    if (!fs.existsSync(logPath)) {
      fs.writeFileSync(logPath, header + '\n');
    }
    
    fs.appendFileSync(logPath, values + '\n');
    console.log(`   📊 Growth log updated: ${logPath}`);
  }

  printMetrics(account, metrics) {
    console.log('\n' + '='.repeat(60));
    console.log(`📊 @${this.accounts[account].username} - Growth Report`);
    console.log('='.repeat(60));
    
    console.log(`\n👥 SEGUIDORES`);
    console.log(`   Total: ${metrics.followers.toLocaleString()}`);
    console.log(`   Crescimento: ${metrics.followerGrowth > 0 ? '+' : ''}${metrics.followerGrowth}%`);
    console.log(`   Variação: ${metrics.followerChange > 0 ? '+' : ''}${metrics.followerChange.toLocaleString()}`);
    
    console.log(`\n🔥 ENGAJAMENTO`);
    console.log(`   Taxa: ${metrics.engagement}%`);
    console.log(`   Média Likes: ${metrics.avgLikes.toLocaleString()}`);
    console.log(`   Média Comments: ${metrics.avgComments.toLocaleString()}`);
    
    console.log(`\n📈 ALCANCE`);
    console.log(`   Reach: ${metrics.reach.toLocaleString()}`);
    console.log(`   Impressions: ${metrics.impressions.toLocaleString()}`);
    console.log(`   Profile Views: ${metrics.profileViews.toLocaleString()}`);
    
    console.log(`\n📱 POSTS: ${metrics.posts}`);
    
    console.log('\n' + '-'.repeat(60));
  }

  generateReport() {
    console.log('\n📊 GROWTH ANALYTICS REPORT');
    console.log('='.repeat(60));
    
    // Carregar métricas mais recentes de cada conta
    const reports = {};
    
    for (const account of Object.keys(this.accounts)) {
      const latestPath = `${this.dataDir}/${account}/latest.json`;
      if (fs.existsSync(latestPath)) {
        reports[account] = JSON.parse(fs.readFileSync(latestPath));
      }
    }
    
    // Consolidar
    console.log('\n📈 CONSOLIDATED GROWTH');
    console.log('-'.repeat(60));
    
    let totalFollowers = 0;
    let avgEngagement = 0;
    let accountsWithGrowth = 0;
    
    for (const [account, metrics] of Object.entries(reports)) {
      const info = this.accounts[account];
      const growth = metrics.followerGrowth > 0 ? '📈' : '📉';
      
      console.log(`\n${growth} @${info.username}`);
      console.log(`   Seguidores: ${metrics.followers.toLocaleString()} (${metrics.followerGrowth > 0 ? '+' : ''}${metrics.followerGrowth}%)`);
      console.log(`   Engajamento: ${metrics.engagement}%`);
      console.log(`   Reach: ${metrics.reach.toLocaleString()}`);
      
      totalFollowers += metrics.followers;
      avgEngagement += metrics.engagement;
      if (metrics.followerGrowth > 0) accountsWithGrowth++;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 TOTALS');
    console.log(`   Total Seguidores: ${totalFollowers.toLocaleString()}`);
    console.log(`   Média Engajamento: ${(avgEngagement / Object.keys(reports).length).toFixed(2)}%`);
    console.log(`   Contas crescendo: ${accountsWithGrowth}/${Object.keys(reports).length}`);
    
    // Salvar relatório
    const report = {
      generatedAt: new Date().toISOString(),
      accounts: reports,
      summary: {
        totalFollowers,
        avgEngagement: (avgEngagement / Object.keys(reports).length).toFixed(2),
        accountsGrowing: accountsWithGrowth
      }
    };
    
    fs.writeFileSync(`${this.dataDir}/consolidated-report.json`, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved: ${this.dataDir}/consolidated-report.json`);
    
    return reports;
  }

  generateConsolidatedReport(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONSOLIDATED REPORT - ALL ACCOUNTS');
    console.log('='.repeat(60));
    
    let totalFollowers = 0;
    let totalReach = 0;
    let avgGrowth = 0;
    let count = 0;
    
    for (const [account, metrics] of Object.entries(results)) {
      const info = this.accounts[account];
      console.log(`\n📱 @${info.username}`);
      console.log(`   👥 ${metrics.followers.toLocaleString()} seguidores`);
      console.log(`   📈 ${metrics.followerGrowth}% crescimento`);
      console.log(`   🔥 ${metrics.engagement}% engajamento`);
      
      totalFollowers += metrics.followers;
      totalReach += metrics.reach;
      avgGrowth += metrics.followerGrowth;
      count++;
    }
    
    console.log('\n' + '-'.repeat(60));
    console.log(`\n📊 TOTAL SOMA`);
    console.log(`   👥 ${totalFollowers.toLocaleString()} seguidores total`);
    console.log(`   📈 ${(avgGrowth / count).toFixed(2)}% crescimento médio`);
    console.log(`   📊 ${(totalReach / count).toLocaleString()} reach médio`);
    
    // Salvar
    fs.writeFileSync(`${this.dataDir}/all-accounts-report.json`, JSON.stringify(results, null, 2));
    console.log(`\n💾 Saved: ${this.dataDir}/all-accounts-report.json`);
  }

  showHelp() {
    console.log(`
📊 GROWTH ANALYTICS v${this.version}

USO:
  node scripts/growth-analytics.js --fetch [conta]
  node scripts/growth-analytics.js --fetch-all
  node scripts/growth-analytics.js --report
  node scripts/growth-analytics.js --help

CONTAS DISPONIVEIS:
  teo        - @teofilipe
  jonathan   - @jonathanofc1
  laise      - @laisegouveia
  pedro      - @pedrovieira
  petselectuk - @petselectuk

EXEMPLOS:
  node scripts/growth-analytics.js --fetch teo
  node scripts/growth-analytics.js --fetch-all
  node scripts/growth-analytics.js --report

OUTPUT:
  results/growth/{conta}/metrics-{date}.json
  results/growth/{conta}/latest.json
  results/growth/growth-log.csv
  results/growth/consolidated-report.json

METRICAS COLETADAS:
  - Seguidores (total e crescimento %)
  - Engajamento (taxa e médias)
  - Reach e Impressions
  - Profile Views e Website Clicks
  - Top Posts (likes, comments, reach)
`);
  }
}

// CLI
const args = process.argv.slice(2).join(' ');
const analytics = new GrowthAnalytics();
analytics.run(args);
