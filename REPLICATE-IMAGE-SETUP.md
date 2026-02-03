# Setup - Image Transformation com Replicate 🎨

Pipeline completo: **Gemini 3.5 Pro + Stable Diffusion img2img**

## 📋 O que vai acontecer

```
Sua foto (Teo)
    ↓
Gemini 3.5 Pro: Analisa características detalhadas
    ↓
Prompt gerado: Descrição + novo cenário + novas roupas
    ↓
Stable Diffusion img2img (Replicate): Gera nova imagem MANTENDO A PESSOA
    ↓
Nova foto (mesmo Teo, novo cenário)
    ↓
Sobe no Drive
```

## 🔑 Step 1: Criar conta Replicate

1. Vai em https://replicate.com
2. Clica "Sign up"
3. Cria conta (pode ser com GitHub)
4. Copia sua API key em https://replicate.com/account
5. Salva em local seguro

## 🔧 Step 2: Configurar API Key

**Windows (PowerShell como Admin):**

```powershell
setx REPLICATE_API_KEY "sua_chave_aqui"
```

**Windows (Permanente):**

1. Abre System Properties
2. Advanced → Environment Variables
3. New → Variável: `REPLICATE_API_KEY`
4. Valor: sua chave

**Linux/Mac:**

```bash
export REPLICATE_API_KEY="sua_chave_aqui"
```

## ✅ Step 3: Testar Setup

```powershell
python C:\Users\vsuga\clawd\scripts\image-transform-replicate.py "praia ao pôr do sol" "roupa de praia" "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP" "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"
```

## 🎯 Como Funciona

### Phase 1: Análise (Gemini 3.5 Pro)
```
Análise detalhada:
- Formato do rosto
- Cor dos olhos
- Tamanho do nariz
- Formato da boca
- Cabelo (cor, textura, corte)
- Barba/pelos
- Tom de pele
- Idade aparente
- Marcas distintivas
```

### Phase 2: Geração (Stable Diffusion img2img)
```
Input:
- Imagem original
- Análise da pessoa
- Novo cenário
- Novas roupas
- Prompt descritivo

Strength: 0.85 (85% novo, 15% original)
→ Mantém características faciais
→ Muda cenário e roupas completamente
```

### Phase 3: Upload (Drive)
```
Imagem gerada → Salva localmente → Sobe no Drive
```

## 📊 Tempo de Processamento

| Etapa | Tempo |
|-------|-------|
| Análise Gemini | ~2s |
| Geração Replicate | ~30-60s |
| Upload Drive | ~5s |
| **Total** | **~40-70s** |

## 💰 Custo

| Modelo | Por Imagem |
|--------|-----------|
| Gemini 3.5 Pro | ~$0.001 |
| Stable Diffusion | ~$0.005 |
| **Total** | **~$0.006** |

Para 100 imagens: ~$0.60

## 🎨 Parâmetros Ajustáveis

Abra `image-transform-replicate.py` e ajuste:

```python
"strength": 0.85,              # 0-1: quanto mudar (0.85 = muito)
"num_inference_steps": 50,     # 20-100: qualidade (mais = melhor)
"guidance_scale": 15.0         # 1-20: aderência ao prompt (mais = mais fiel)
```

Recomendado pra manter pessoa:
- `strength: 0.7-0.85` (70-85% novo)
- `guidance_scale: 12-18` (bem fiel ao prompt)

## ❓ Troubleshooting

### "REPLICATE_API_KEY não configurada"
```
Setou a variável de ambiente?
setx REPLICATE_API_KEY sua_chave
```

### "API Request Timeout"
```
Replicate tá sobrecarregado. Tenta de novo em 1 minuto.
```

### "Imagem não mantém características"
```
Aumenta guidance_scale:
"guidance_scale": 18.0
```

### "Imagem muito parecida com original"
```
Diminui strength:
"strength": 0.7
```

### "Erro 401 - Unauthorized"
```
API key inválida ou expirada. Verifica em:
https://replicate.com/account
```

## 📚 Recursos

- **Replicate Docs**: https://replicate.com/docs
- **Stable Diffusion img2img**: https://replicate.com/stability-ai/sdxl
- **Gemini Docs**: https://ai.google.dev

## 🚀 Criar Alias

Adicione ao `$PROFILE` do PowerShell:

```powershell
function image-transform {
    param(
        [string]$Scenario,
        [string]$Clothes,
        [string]$SourceFolder = "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP",
        [string]$DestFolder = "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"
    )
    
    python C:\Users\vsuga\clawd\scripts\image-transform-replicate.py $Scenario $Clothes $SourceFolder $DestFolder
}
```

**Uso:**
```powershell
image-transform "praia ao pôr" "roupa de praia"
```

## 📝 Exemplo Completo

```powershell
# Testa o setup
python C:\Users\vsuga\clawd\scripts\image-transform-replicate.py `
  "estúdio profissional com iluminação cinematográfica" `
  "roupa casual premium" `
  "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP" `
  "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"
```

## ✨ O que Você Consegue Fazer

```
Input: Foto do Teo em casa
       Cenário: Praia ao pôr do sol
       Roupa: Casual para praia

Output: Teo na praia ao pôr do sol com roupa casual
        (Mesma pessoa, mesmo rosto, novo cenário)
```

## 🔄 Próximas Iterações

1. Testar com diferentes cenários
2. Ajustar `strength` para melhor resultado
3. Experimentar `guidance_scale`
4. Criar batch de imagens automaticamente

---

**Pronto!** Agora é só:
1. Pega API key do Replicate
2. Configura a variável de ambiente
3. Roda o script
4. Vê a mágica acontecer! ✨
