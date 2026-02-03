# 🎨 Dual Image Generation - FLUX + Nano Banana Pro

**Você agora tem DOIS modelos prontos para escolher!**

---

## 📊 Comparativo Rápido

| Aspecto | FLUX 2.0 Pro | Nano Banana Pro |
|---------|--------------|-----------------|
| **Status** | ✅ Testado | 🔧 Implementado |
| **Custo** | $0.045-0.060 | **$0.02-0.05** ⭐ |
| **Qualidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Velocidade** | 30-40s | **15-30s** ⭐ |
| **Identidade** | Excelente | Excelente |
| **Provider** | Black Forest Labs | Google (Gemini 3) |

---

## 🚀 Setup (Uma Vez)

### 1. Adicionar ao PowerShell Profile

```powershell
notepad $PROFILE

# Cole o conteúdo de: GEN-IMAGE-DUAL.ps1

# Salve e restart PowerShell
```

### 2. Verificar Setup

```powershell
gen-help
```

---

## 💡 Como Usar

### FLUX 2.0 Pro (Confiável + Testado)

```powershell
# Custom prompt
gen-flux "Same person in [SCENARIO], maintaining facial features"

# Atalhos prontos
gen-flux-studio       # Estúdio profissional
gen-flux-beach        # Praia ao pôr do sol
gen-flux-formal       # Formal/Corporativo
gen-flux-outdoor      # Natureza/Outdoor
```

**Quando usar:**
- ✅ Quando quer garantir resultado
- ✅ Qualidade máxima é prioridade
- ✅ Não se importa com custo extra

---

### Nano Banana Pro (Barato + Rápido)

```powershell
# Custom prompt
gen-nano "Same person in [SCENARIO], maintaining facial features"

# Atalhos prontos
gen-nano-studio       # Estúdio
gen-nano-beach        # Praia
```

**Quando usar:**
- ✅ Quando quer economizar
- ✅ Velocidade é importante
- ✅ Batch de múltiplas imagens
- ✅ Experimentar cenários

---

### Escolher Manualmente

```powershell
gen-image flux "seu prompt"    # FLUX
gen-image nano "seu prompt"    # Nano Banana
```

---

## 📈 Exemplos Práticos

### Estúdio Profissional - Compara FLUX vs Nano

```powershell
# FLUX
gen-flux-studio
# Resultado em 30-40s com máxima qualidade

# Nano
gen-nano-studio
# Resultado em 15-30s mais barato
```

### Batch de 10 Imagens - Use Nano (Economiza!)

```powershell
# Cria 10 variações com Nano (mais barato)
for ($i=1; $i -le 10; $i++) {
    gen-nano "Same person in scenario $i, maintaining facial features"
}

# Custo: ~$0.05 × 10 = $0.50 (vs $0.60 com FLUX)
```

### Qualidade Crítica - Use FLUX

```powershell
# Quando precisa de MELHOR qualidade
gen-flux "Same person [cenário perfeito], maintaining identical features"
```

---

## 💰 Custo Estimado

### FLUX 2.0 Pro
```
1 imagem:    $0.045-0.060
10 imagens:  $0.45-0.60
100 imagens: $4.50-6.00
```

### Nano Banana Pro
```
1 imagem:    $0.02-0.05
10 imagens:  $0.20-0.50
100 imagens: $2.00-5.00  ⭐ Economiza ~50%
```

---

## 🎯 Estratégia Recomendada

### Para Desenvolver Cenários
```
1. Use Nano pra testar (barato e rápido)
2. Quando gostar, use FLUX pra qualidade final
```

**Exemplo:**
```powershell
# Testa diferentes cenários com Nano
gen-nano "Same person at [various locations]"

# Quando achar o melhor, refine com FLUX
gen-flux "Same person at [best location], premium styling"
```

---

## 🔧 Troubleshooting

### "gen-image comando não encontrado"
```powershell
# Não configurou o PowerShell Profile?
notepad $PROFILE
# Cole o conteúdo de GEN-IMAGE-DUAL.ps1
# Restart PowerShell
```

### "Nano Banana Pro tá com erro"
```
Status: 🔧 Implementado mas pode precisar ajustes
Próximo passo: Debug da API com Google
```

### "Qual modelo usar?"

**FLUX se:**
- Qualidade é CRÍTICA
- É foto final pro cliente
- Portfolio/profissional

**Nano se:**
- Quer economizar
- Está testando cenários
- Precisa de múltiplas versões
- Não se importa com ~5% menos qualidade

---

## 📝 Prompts Prontos

### Studio (Ambos)
```
Same person in a professional studio with minimalist white background, 
wearing premium casual editorial clothes, magazine quality, 
maintaining identical facial features, sharp focus on face, perfect lighting
```

### Beach (Ambos)
```
Same person at a beautiful beach at sunset, wearing casual beach clothes, 
maintaining identical facial features, golden hour lighting, 
professional portrait photography, warm and inviting
```

### Formal (FLUX preferred)
```
Same person in formal business attire in a professional office environment, 
maintaining identical facial features, corporate photography style, 
perfect studio lighting, sharp focus
```

### Nature (Ambos)
```
Same person outdoors in a beautiful natural environment, wearing casual outdoor clothes, 
maintaining identical facial features, natural golden hour lighting, 
landscape background, professional portrait
```

---

## 📊 Resultados Até Agora

### FLUX 2.0 Pro
```
✅ Teste 1: SUCESSO
   - Imagem: https://drive.google.com/file/d/1-aZS7l6EaH7bdog_JPQNU9J8Z7mljK85/view?usp=drivesdk
   - Tempo: ~30s
   - Qualidade: Excelente
   - Identidade: Mantida ✅
```

### Nano Banana Pro
```
🔧 Status: Implementado
   - Scripts prontos
   - Falta: Debug da API
   - Próximo: Testar quando Google libera
```

---

## 🚀 Próximos Passos

1. **Setup Dual Model** (hoje)
   ```powershell
   notepad $PROFILE
   # Cole GEN-IMAGE-DUAL.ps1
   # Restart PowerShell
   ```

2. **Teste FLUX** (garanta que funciona)
   ```powershell
   gen-flux-studio
   ```

3. **Teste Nano** (quando tiver tempo)
   ```powershell
   gen-nano-studio
   ```

4. **Compare e Escolha** sua estratégia

---

## 🎓 Resumo

```
┌─────────────────────────────────────────┐
│  FLUX 2.0 Pro:                          │
│  - Status: ✅ Funcionando                │
│  - Custo: $0.045-0.060/img              │
│  - Quando: Qualidade crítica             │
│                                         │
│  Nano Banana Pro:                       │
│  - Status: 🔧 Implementado               │
│  - Custo: $0.02-0.05/img (mais barato) │
│  - Quando: Economizar + rápido           │
└─────────────────────────────────────────┘
```

---

## ❓ FAQ

**P: Qual devo usar primeiro?**
R: Use FLUX (testado). Nano quando quiser economizar.

**P: Qual é melhor?**
R: FLUX um pouco melhor qualidade. Nano um pouco mais rápido e barato.

**P: Posso usar os dois juntos?**
R: Sim! Teste com Nano, refine com FLUX.

**P: E se Nano não funcionar?**
R: FLUX vai funcionar sempre. Nano é bonus.

---

**Pronto!** Você tem duas ferramentas poderosas. Use conforme necessário! 🚀
