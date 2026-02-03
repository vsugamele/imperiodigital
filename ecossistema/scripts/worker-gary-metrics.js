#!/usr/bin/env node

/**
 * 📊 WORKER GARY - METRICS COLLECTOR
 * 
 * Coleta métricas de todos os perfis operacionais
 * - Instagram (via scripts existentes)
 * - TikTok
 * - YouTube
 * 
 * Roda: Todo dia 08:00, 14:00, 20:00
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Config
const METRICS_DIR = path.join(__dirname, '../metrics/daily');
const PROFILES = [
  { name: 'TEO', platform: 'instagram', type: 'igaming' },
  { name: 'JONATHAN', platform: 'instagram', type: 'igaming' },
  { name: 'LAISE', platform: 'instagram', type: 'igaming' },
  { name: 'PEDRO', platform: 'instagram', type: 'igaming' },
  { name: 'PETSELECTUK', platform: 'instagram', type: 'petshop' }
];

async function collectMetrics() {
  const timestamp = new Date().toISOString();
  const date = timestamp.split('T')[0];
  
  console.log(`\n📊 [${timestamp}] GARY: Coletando métricas...\n`);
  
  const metrics = {
    timestamp,
    date,
    profiles: [],
    summary: {
      totalFollowers: 0,
      totalPostsToday: 0,
      avgEngagement: 0,
      topPerformer: null
    }
  };
  
  for (const profile of PROFILES) {
    try {
      const profileMetrics = await getProfileMetrics(profile);
      metrics.profiles.push(profileMetrics);
      metrics.summary.totalFollowers += profileMetrics.followers;
      metrics.summary.totalPostsToday += profileMetrics.postsToday;
      metrics.summary.avgEngagement += profileMetrics.engagementRate;
      
      console.log(`  ✅ ${profile.name}: ${profileMetrics.followers.toLocaleString()} seguidores`);
    } catch (error) {
      console.log(`  ❌ ${profile.name}: Erro - ${error.message}`);
      metrics.profiles.push({
        name: profile.name,
        error: error.message
      });
    }
  }
  
  // Calculate averages
  metrics.summary.avgEngagement = metrics.summary.avgEngagement / PROFILES.length;
  
  // Find top performer
  if (metrics.profiles.length > 0) {
    metrics.summary.topPerformer = metrics.profiles
      .filter(p => !p.error)
      .sort((a, b) => b.engagementRate - a.engagementRate)[0]?.name;
  }
  
  // Save metrics
  const outputPath = path.join(METRICS_DIR, `${date}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2));
  console.log(`\n💾 Métricas salvas: ${outputPath}`);
  
  return metrics;
}

async function getProfileMetrics(profile) {
  // TODO: Implementar coleta real via APIs
  // Por enquanto, retorna métricas simuladas baseadas em dados existentes
  
  // Tentar ler de arquivos de log existentes
  const logFile = path.join(__dirname, `../../results/posting-log-v2.csv`);
  
  if (fs.existsSync(logFile)) {
    // Parse CSV e contar posts de hoje
    const csv = fs.readFileSync(logFile, 'utf8');
    const lines = csv.split('\n');
    const today = new Date().toISOString().split('T')[0];
    
    let postsToday = 0;
    for (const line of lines) {
      if (line.includes(profile.name) && line.includes(today)) {
        postsToday++;
      }
    }
    
    return {
      name: profile.name,
      platform: profile.platform,
      type: profile.type,
      followers: getFollowersCount(profile.name),
      postsToday,
      engagementRate: getEngagementRate(profile.name),
      lastPost: getLastPostDate(profile.name),
      growth: getGrowthRate(profile.name)
    };
  }
  
  // Fallback para desenvolvimento
  return {
    name: profile.name,
    platform: profile.platform,
    type: profile.type,
    followers: getFollowersCount(profile.name),
    postsToday: Math.floor(Math.random() * 3) + 1, // Simulado
    engagementRate: getEngagementRate(profile.name),
    lastPost: new Date().toISOString(),
    growth: getGrowthRate(profile.name)
  };
}

function getFollowersCount(profileName) {
  // TODO: Integrar com Instagram API
  const mockData = {
    'TEO': 12500,
    'JONATHAN': 8200,
    'LAISE': 15700,
    'PEDRO': 9800,
    'PETSELECTUK': 4200
  };
  return mockData[profileName] || 1000;
}

function getEngagementRate(profileName) {
  const mockData = {
    'TEO': 4.2,
    'JONATHAN': 3.8,
    'LAISE': 5.1,
    'PEDRO': 3.5,
    'PETSELECTUK': 4.8
  };
  return mockData[profileName] || 3.0;
}

function getLastPostDate(profileName) {
  return new Date().toISOString();
}

function getGrowthRate(profileName) {
  const rates = {
    'TEO': 2.5,
    'JONATHAN': 1.8,
    'LAISE': 3.2,
    'PEDRO': 1.5,
    'PETSELECTUK': 4.1
  };
  return rates[profileName] || 1.0;
}

// Run if called directly
if (require.main === module) {
  collectMetrics()
    .then(metrics => {
      console.log('\n📈 RESUMO:');
      console.log(`   Total Seguidores: ${metrics.summary.totalFollowers.toLocaleString()}`);
      console.log(`   Posts Hoje: ${metrics.summary.totalPostsToday}`);
      console.log(`   Engagement Médio: ${metrics.summary.avgEngagement.toFixed(2)}%`);
      console.log(`   Top Performer: ${metrics.summary.topPerformer || 'N/A'}`);
    })
    .catch(error => {
      console.error('❌ Erro:', error);
      process.exit(1);
    });
}

module.exports = { collectMetrics, getProfileMetrics };
