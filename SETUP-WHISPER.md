# 🎙️ Whisper Local - Transcrição de Áudio

## ✅ O que foi instalado

- ✅ **OpenAI Whisper** — Transcrição de áudio local (sem enviar pra cloud)
- ✅ **PyTorch** — Engine de IA do Whisper
- ✅ **Scripts Python** — Transcrever automaticamente
- ✅ **Integração com Clawdbot** — Consigo rodar diretamente

---

## 🎯 Como usar

### Opção 1: Via Command Line

```bash
python -m whisper "seu_audio.ogg" --model base --language pt
```

### Opção 2: Via Script Python

```bash
python C:\Users\vsuga\clawd\scripts\transcribe-audio.py seu_audio.ogg
```

### Opção 3: Via Batch File

```bash
C:\Users\vsuga\clawd\scripts\transcribe.bat seu_audio.ogg
```

### Opção 4: Via Node (eu controlo)

```bash
node C:\Users\vsuga\clawd\scripts\transcribe-telegram.js seu_audio.ogg
```

---

## 📝 Como funciona

1. **Você manda áudio** — Telegram, chat, arquivo
2. **Eu recebo e transcrevo** — Usando Whisper local
3. **Retorno o texto** — E respondo normalmente

---

## 🎚️ Modelos Disponíveis

| Modelo | Qualidade | Velocidade | Tamanho |
|--------|-----------|-----------|---------|
| tiny   | 😐 Básica | ⚡ Rápido  | 39 MB   |
| base   | ✅ Boa    | 👍 Normal | 140 MB  |
| small  | 👍 Melhor | 🐢 Lento  | 466 MB  |
| medium | 🎯 Muito boa | 🐢 Mais lento | 1.5 GB |
| large  | 🏆 Melhor | 🐢🐢 Muito lento | 2.9 GB |

**Default:** `base` (bom balanço entre qualidade e velocidade)

---

## 🌍 Idiomas Suportados

- ✅ Português (pt)
- ✅ English (en)
- ✅ Español (es)
- ✅ 97+ outros idiomas

Whisper detecta automático, mas você pode especificar.

---

## 💾 Onde os arquivos ficam

- **Scripts:** `C:\Users\vsuga\clawd\scripts\`
- **Áudios:** `C:\Users\vsuga\.clawdbot\media\inbound\`
- **Transcrições:** Mesmo diretório do áudio com extensão `.txt`

---

## 🚀 Próximo Passo

**Manda um áudio agora!** 

Eu vou:
1. Receber
2. Transcrever com Whisper
3. Retornar o texto
4. Responder sua pergunta

---

**Status:** ✅ Instalação em progresso... Aviso quando terminar!
