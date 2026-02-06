#!/usr/bin/env node
/**
 * QUOTE OVERLAY GENERATOR - Premium Devocional Style
 * Estilo: Capa de devocional, sagrado, elegante, minimalista
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// ==================== CONFIG ====================

const CONFIG = {
  TEMPLATE_PATH: path.join(__dirname, '..', 'images', 'templates', 'quote_template_motivacao.jpg'),
  OUTPUT_DIR: path.join(__dirname, '..', 'outputs', 'quotes', 'generated'),
  
  // Cores premium
  TEXT_COLOR: '#F5F5F0', // Off-white suave
  ACCENT_COLOR: '#D4AF37', // Dourado claro
  GRADIENT_COLORS: ['rgba(20, 15, 10, 0.95)', 'rgba(40, 30, 20, 0.7)', 'rgba(60, 50, 40, 0.3)'],
  
  // Fonte serif elegante (precisa ter no sistema ou usar fallback)
  FONT_PRIMARY: 'Georgia, serif', // Playfair Display style
  FONT_SECONDARY: 'Georgia, serif',
  
  // Layout
  CONTENT_PADDING: 60,
  MAX_WIDTH: 0.50, // 50% da largura
  LINE_HEIGHT: 2.0, // Mais espaçamento entre linhas
  
  // Área de conteúdo (mais ao canto esquerdo)
  CONTENT_X_RATIO: 0.05, // Começa em 5% da imagem (canto esquerdo)
  
  // Aspas decorativas
  QUOTE_SIZE: 120,
  QUOTE_OPACITY: 0.15,
};

// ==================== FREE QUOTES (fallback) ====================

const SALMOS_QUOTES = [
  { text: "O Senhor é o meu pastor; nada me faltará.", author: "Salmo 23:1", category: "faith" },
  { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.", author: "João 3:16", category: "god" },
  { text: "Tudo posso naquele que me fortalece.", author: "Filipenses 4:13", category: "faith" },
  { text: "O choro pode durar uma noite, mas a alegria vem pela manhã.", author: "Salmo 30:5", category: "wisdom" },
  { text: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", author: "Salmo 37:5", category: "faith" },
  { text: "O Senhor é bom, um refúgio em tempos de tribulação.", author: "Nahum 1:7", category: "god" },
  { text: "Por que estás abatida, ó minha alma, e por que te perturbas dentro de mim?", author: "Salmo 42:5", category: "wisdom" },
  { text: "Tu és a minha pedra firme, a minha libertação.", author: "Salmo 62:6", category: "faith" }
];

// ==================== FREE QUOTE FUNCTION ====================

function getFreeQuote(category = null) {
  let quotes = SALMOS_QUOTES;
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  
  return {
    success: true,
    quote: {
      quote: quote.text,
      author: quote.author,
      category: quote.category
    }
  };
}

// ==================== TEXT WRAPPING ====================

function getWrappedLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

// ==================== CALCULATE FONT SIZE ====================

function calculateFontSize(ctx, text, maxWidth, maxHeight, minFontSize = 36, maxFontSize = 72) {
  let fontSize = maxFontSize;
  
  for (let size = maxFontSize; size >= minFontSize; size -= 2) {
    ctx.font = `${size}px ${CONFIG.FONT_PRIMARY}`;
    const lines = getWrappedLines(ctx, text, maxWidth);
    const totalHeight = lines.length * size * CONFIG.LINE_HEIGHT;
    
    if (totalHeight <= maxHeight) {
      return { fontSize, lines };
    }
  }
  
  return { fontSize: minFontSize, lines: getWrappedLines(ctx, text, maxWidth) };
}

// ==================== DRAW DECORATIVE QUOTE ====================

function drawDecorativeQuote(ctx, x, y, size, color, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.font = `${size}px Georgia`;
  
  // Aspas decorativas
  ctx.fillText('"', x, y);
  ctx.fillText('"', x + size * 0.6, y - size * 0.8);
  
  ctx.restore();
}

// ==================== DRAW GRADIENT OVERLAY ====================

function drawGradientOverlay(ctx, image, width, height) {
  // Gradiente suave da esquerda para direita (área menor)
  const gradient = ctx.createLinearGradient(0, 0, width * 0.4, 0);
  
  CONFIG.GRADIENT_COLORS.forEach((color, i) => {
    gradient.addColorStop(i / (CONFIG.GRADIENT_COLORS.length - 1), color);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

// ==================== GENERATE IMAGE ====================

async function generateQuoteImage(quote, author, outputPath) {
  const templatePath = CONFIG.TEMPLATE_PATH;
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template não encontrado: ${templatePath}`);
  }
  
  const image = await loadImage(templatePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  
  // Desenhar template base
  ctx.drawImage(image, 0, 0);
  
  // Aplicar gradiente escuro suave (esquerda)
  drawGradientOverlay(ctx, image, image.width, image.height);
  
  // Área de conteúdo (centralizada à direita do gradiente)
  const contentX = image.width * CONFIG.CONTENT_X_RATIO;
  const maxWidth = image.width * CONFIG.MAX_WIDTH;
  const centerY = image.height / 2;
  
  // Calcular tamanho da fonte
  const { fontSize, lines } = calculateFontSize(
    ctx, 
    quote, 
    maxWidth, 
    image.height * 0.35
  );
  
  const lineHeight = fontSize * CONFIG.LINE_HEIGHT;
  const totalTextHeight = lines.length * lineHeight;
  const contentStartY = centerY - (totalTextHeight / 2);
  
  // Configurar texto principal
  ctx.fillStyle = CONFIG.TEXT_COLOR;
  ctx.textAlign = 'left'; // Alinhado à esquerda
  
  // Efeito de sombra forte para destacar o texto
  ctx.shadowColor = 'rgba(0, 0, 0, 1.0)'; // Sombra preta sólida
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  
  // Aspas decorativas (topo, alinhado à esquerda)
  drawDecorativeQuote(
    ctx, 
    contentX, 
    contentStartY - 20,
    CONFIG.QUOTE_SIZE * 1.2,
    CONFIG.ACCENT_COLOR,
    CONFIG.QUOTE_OPACITY
  );
  
  // Desenhar texto da citação - FONTE NEGRITO
  ctx.font = `bold ${fontSize}px ${CONFIG.FONT_PRIMARY}`;
  // Estilo negrito sutil
  ctx.fillStyle = CONFIG.TEXT_COLOR;
  
  lines.forEach((line, i) => {
    const y = contentStartY + (i * lineHeight) + fontSize;
    ctx.fillText(line, contentX, y); // Alinhado à esquerda
  });
  
  // Linha decorativa abaixo do texto
  const lineY = contentStartY + totalTextHeight + 40;
  ctx.strokeStyle = CONFIG.ACCENT_COLOR;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(contentX, lineY);
  ctx.lineTo(contentX + 120, lineY);
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  // Autor - NEGRITO
  ctx.font = `bold ${fontSize * 0.55}px ${CONFIG.FONT_SECONDARY}`;
  ctx.fillStyle = CONFIG.ACCENT_COLOR;
  const authorText = `${author}`;
  ctx.fillText(authorText, contentX, lineY + 50); // Alinhado à esquerda
  
  // Salvar
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const buffer = canvas.toBuffer('image/jpeg', 0.92);
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✅ Imagem gerada: ${outputPath}`);
  console.log(`   Texto: "${quote.substring(0, 50)}..."`);
  console.log(`   Autor: ${author}`);
  
  return outputPath;
}

// ==================== MAIN ====================

async function main() {
  console.log('\n🖼️  QUOTE OVERLAY - DEVOCIONAL PREMIUM\n');
  console.log('   Estilo: Sagrado, Elegante, Minimalista\n');
  
  // Verificar template
  if (!fs.existsSync(CONFIG.TEMPLATE_PATH)) {
    console.log(`❌ Template não encontrado: ${CONFIG.TEMPLATE_PATH}`);
    process.exit(1);
  }
  
  // Buscar citação
  console.log('📝 Buscando citação de Salmos...');
  const quoteResult = getFreeQuote();
  
  if (!quoteResult.success) {
    console.log('❌ Erro ao buscar citação');
    process.exit(1);
  }
  
  const { quote, author } = quoteResult.quote;
  console.log(`   ✅ "${quote.substring(0, 50)}..."`);
  console.log(`   ✅ ${author}\n`);
  
  // Gerar imagem
  const timestamp = Date.now();
  const outputPath = path.join(CONFIG.OUTPUT_DIR, `salmos_premium_${timestamp}.jpg`);
  
  try {
    await generateQuoteImage(quote, author, outputPath);
    
    console.log('\n✅ SUCESSO!');
    console.log(`📁 Arquivo: ${outputPath}`);
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    process.exit(1);
  }
}

main();
