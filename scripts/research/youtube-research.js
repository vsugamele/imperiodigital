#!/usr/bin/env node
/**
 * 🎯 YOUTUBE COMMENT ANALYZER
 * 
 * Sistema genérico para analisar comentários do YouTube
 * Identifica: Dores, Oportunidades, Tendências, Perguntas
 * 
 * Uso: node scripts/research/youtube-research.js --project religiao
 *      node scripts/research/youtube-research.js --project igaming
 *      node scripts/research/youtube-research.js --project all
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

// ==================== CONFIG ====================

const CONFIG = {
  MAX_VIDEOS: 10,
  MAX_COMMENTS: 50,  // Comentários por vídeo
  OUTPUT_DIR: path.join(__dirname, '..', 'outputs', 'research'),
  
  // API Key (YouTube Data API v3)
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || 'AIzaSy...',
  
  // Projetos configurados
  PROJECTS: {
    religiao: {
      name: 'Religião/Fé',
      keywords: [
        'salmos',
        'fé cristã',
        'oração',
        'Deus amor',
        'palavras de esperança',
        'bíblia',
        'motivação espiritual'
      ],
      output: 'religiao_comments.json'
    },
    igaming: {
      name: 'iGaming',
      keywords: [
        'cassino online',
        'jogos de azar',
        'bet',
        'roleta',
        'blackjack'
      ],
      output: 'igaming_comments.json'
    },
    petselectuk: {
      name: 'PetSelectUK',
      keywords: [
        'pet care',
        'dog training',
        'pet nutrition',
        'dog health',
        'pet grooming'
      ],
      output: 'pets_comments.json'
    },
    jp_videos: {
      name: 'JP Videos',
      keywords: [
        'corte de cabelo masculino',
        'hair styling',
        'barba',
        'cabelo masculino',
        'looks masculinos'
      ],
      output: 'jp_comments.json'
    }
  }
};

// ==================== YOUTUBE API ====================

function youtubeSearch(query, maxResults = 10) {
  return new Promise((resolve, reject) => {
    const params = new url.URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: maxResults.toString(),
      key: CONFIG.YOUTUBE_API_KEY
    });
    
    const req = https.get(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.items || []);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    
    req.on('error', reject);
    req.end();
  });
}

function youtubeComments(videoId, maxResults = 50) {
  return new Promise((resolve, reject) => {
    const params = new url.URLSearchParams({
      part: 'snippet',
      videoId: videoId,
      maxResults: maxResults.toString(),
      order: 'relevance',
      key: CONFIG.YOUTUBE_API_KEY
    });
    
    const req = https.get(
      `https://www.googleapis.com/youtube/v3/commentThreads?${params}`,
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const comments = (json.items || []).map(item => ({
              author: item.snippet.topLevelComment.snippet.authorDisplayName,
              text: item.snippet.topLevelComment.snippet.textDisplay,
              likeCount: item.snippet.topLevelComment.snippet.likeCount,
              publishedAt: item.snippet.topLevelComment.snippet.publishedAt
            }));
            resolve(comments);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    
    req.on('error', reject);
    req.end();
  });
}

// ==================== COMMENT ANALYSIS ====================

function analyzeComments(comments) {
  const analysis = {
    totalComments: comments.length,
    painPoints: [],
    opportunities: [],
    questions: [],
    trends: [],
    positiveSentiment: 0,
    negativeSentiment: 0,
    neutralSentiment: 0,
    topEngagement: []
  };
  
  // Palavras-chave para identificar tipos de comentários
  const PAIN_KEYWORDS = [
    'não consigo', 'difícil', 'sofrendo', 'triste', 'deprimido',
    'ansioso', 'perdido', 'sem esperança', 'fracasso', 'errei',
    'problema', 'ajuda', 'como fazer', 'não funciona'
  ];
  
  const OPPORTUNITY_KEYWORDS = [
    'gostaria', 'quero', 'preciso', 'buscando', 'procurando',
    'alguém sabe', 'onde encontrar', 'qual o melhor',
    'sugestão', 'recomendação'
  ];
  
  const QUESTION_KEYWORDS = [
    '?', 'como', 'qual', 'quando', 'por que', 'por quê',
    'onde', 'quanto', 'existe', 'tem', 'pode'
  ];
  
  const POSITIVE_KEYWORDS = [
    'obrigado', 'agradeço', 'Deus abençoou', 'maravilhoso',
    'amando', 'perfeito', 'incrível', 'salvou', 'ajudou'
  ];
  
  comments.forEach(comment => {
    const text = comment.text.toLowerCase();
    const words = text.split(/\s+/);
    
    // Verificar dor
    PAIN_KEYWORDS.forEach(kw => {
      if (text.includes(kw)) {
        if (!analysis.painPoints.find(p => p.keyword === kw)) {
          analysis.painPoints.push({
            keyword: kw,
            count: 1,
            examples: [comment.text.substring(0, 200)]
          });
        } else {
          const p = analysis.painPoints.find(p => p.keyword === kw);
          p.count++;
          if (p.examples.length < 3) {
            p.examples.push(comment.text.substring(0, 200));
          }
        }
      }
    });
    
    // Verificar oportunidade
    OPPORTUNITY_KEYWORDS.forEach(kw => {
      if (text.includes(kw)) {
        if (!analysis.opportunities.find(o => o.keyword === kw)) {
          analysis.opportunities.push({
            keyword: kw,
            count: 1,
            examples: [comment.text.substring(0, 200)]
          });
        } else {
          const o = analysis.opportunities.find(o => o.keyword === kw);
          o.count++;
        }
      }
    });
    
    // Verificar pergunta
    if (QUESTION_KEYWORDS.some(kw => text.includes(kw)) && text.includes('?')) {
      analysis.questions.push({
        question: comment.text.substring(0, 300),
        likes: comment.likeCount
      });
    }
    
    // Verificar sentimento positivo
    if (POSITIVE_KEYWORDS.some(kw => text.includes(kw))) {
      analysis.positiveSentiment++;
    } else if (PAIN_KEYWORDS.some(kw => text.includes(kw))) {
      analysis.negativeSentiment++;
    } else {
      analysis.neutralSentiment++;
    }
    
    // Top engajamento
    if (comment.likeCount > 0) {
      analysis.topEngagement.push({
        comment: comment.text.substring(0, 200),
        likes: comment.likeCount
      });
    }
  });
  
  // Ordenar por contagem
  analysis.painPoints.sort((a, b) => b.count - a.count);
  analysis.opportunities.sort((a, b) => b.count - a.count);
  analysis.topEngagement.sort((a, b) => b.likes - a.likes);
  analysis.questions.sort((a, b) => b.likes - a.likes);
  
  return analysis;
}

// ==================== MAIN ====================

async function main() {
  const projectArg = process.argv[2];
  
  console.log('\n🎯 YOUTUBE COMMENT ANALYZER\n');
  
  if (!projectArg || !projectArg.startsWith('--project=')) {
    console.log('Usage: node scripts/research/youtube-research.js --project=<project>');
    console.log('');
    console.log('Projetos disponíveis:');
    Object.keys(CONFIG.PROJECTS).forEach(key => {
      const p = CONFIG.PROJECTS[key];
      console.log(`  - ${key}: ${p.name} (${p.keywords.length} keywords)`);
    });
    console.log('\n  --project=all: Rodar todos os projetos');
    process.exit(1);
  }
  
  const projectName = projectArg.split('=')[1];
  const projectsToRun = projectName === 'all' 
    ? Object.keys(CONFIG.PROJECTS) 
    : [projectName];
  
  if (projectsToRun.length === 0 || !CONFIG.PROJECTS[projectName]) {
    console.log(`❌ Projeto não encontrado: ${projectName}`);
    process.exit(1);
  }
  
  // Criar diretório de output
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }
  
  // Processar cada projeto
  for (const projectKey of projectsToRun) {
    const project = CONFIG.PROJECTS[projectKey];
    console.log(`\n📊 PROJETO: ${project.name}`);
    console.log('='.repeat(50));
    
    const allResults = {
      project: projectKey,
      name: project.name,
      analyzedAt: new Date().toISOString(),
      videos: [],
      summary: {
        totalVideos: 0,
        totalComments: 0,
        topPainPoints: [],
        topOpportunities: [],
        topQuestions: []
      }
    };
    
    // Buscar vídeos para cada keyword
    for (const keyword of project.keywords) {
      console.log(`\n🔍 Buscando: "${keyword}"`);
      
      try {
        const videos = await youtubeSearch(keyword, CONFIG.MAX_VIDEOS);
        console.log(`   Encontrados: ${videos.length} vídeos`);
        
        for (const video of videos) {
          const videoData = {
            videoId: video.id.videoId,
            title: video.snippet.title,
            channel: video.snippet.channelTitle,
            publishedAt: video.snippet.publishedAt,
            comments: []
          };
          
          // Buscar comentários
          console.log(`   💬 Comentários...`);
          try {
            const comments = await youtubeComments(video.id.videoId, CONFIG.MAX_COMMENTS);
            videoData.comments = comments;
            console.log(`      ${comments.length} comentários`);
          } catch (e) {
            console.log(`      ❌ Erro: ${e.message}`);
          }
          
          allResults.videos.push(videoData);
        }
      } catch (e) {
        console.log(`   ❌ Erro na busca: ${e.message}`);
      }
    }
    
    // Analisar todos os comentários
    console.log(`\n📈 Analisando comentários...`);
    const allComments = allResults.videos.flatMap(v => v.comments);
    const analysis = analyzeComments(allComments);
    
    allResults.analysis = analysis;
    allResults.summary = {
      totalVideos: allResults.videos.length,
      totalComments: allComments.length,
      topPainPoints: analysis.painPoints.slice(0, 5),
      topOpportunities: analysis.opportunities.slice(0, 5),
      topQuestions: analysis.questions.slice(0, 5)
    };
    
    // Salvar resultado
    const outputPath = path.join(CONFIG.OUTPUT_DIR, project.output);
    fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
    
    console.log(`\n✅ SALVO: ${outputPath}`);
    console.log(`   Vídeos: ${allResults.summary.totalVideos}`);
    console.log(`   Comentários: ${allResults.summary.totalComments}`);
    console.log(`   Dores identificadas: ${analysis.painPoints.length}`);
    console.log(`   Oportunidades: ${analysis.opportunities.length}`);
    console.log(`   Perguntas: ${analysis.questions.length}`);
  }
  
  console.log('\n🎉 TODOS OS PROJETOS PROCESSADOS!\n');
}

main().catch(console.error);
