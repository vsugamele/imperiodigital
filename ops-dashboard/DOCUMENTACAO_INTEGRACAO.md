# 📄 Guia de Integração - Clube das Brabas

Este documento orienta como integrar o frontend do Clube das Brabas com o Dashboard Central (Webhook Hub).

## 🚀 Endpoints Disponíveis

A URL base para os webhooks depende do ambiente:
- **Produção:** `https://seu-projeto.vercel.app/api/webhooks/jp/`
- **Local:** `http://localhost:3002/api/webhooks/jp/`

### 1. Cadastro de Usuário (Lead clicou em "Registrar")

Quando o lead preenche o formulário de cadastro, o frontend deve enviar uma requisição `POST` para criar o acesso.

**Endpoint:** `POST /api/webhooks/jp/create-user`

**Payload (JSON):**
```json
{
  "email": "lead@exemplo.com",
  "password": "SenhaTemporaria123",
  "name": "Nome da Aluna",
  "phone": "+5511999999999",
  "metadata": {
    "origem": "landing-page-v1"
  }
}
```

**O que acontece:**
1. Cria a conta no Supabase Auth do projeto SB1.
2. Cria automaticamente o perfil na tabela `public.c_profiles`.
3. Dispara um e-mail de boas-vindas com as credenciais.

---

### 2. Esqueci Minha Senha

Quando a usuária clica em "Esqueci minha senha", o frontend deve enviar o e-mail dela para disparar o fluxo de recuperação.

**Endpoint:** `POST /api/webhooks/jp/reset-password`

**Payload (JSON):**
```json
{
  "email": "aluna@exemplo.com",
  "redirect_url": "https://clubedasbrabas.vercel.app/reset-password"
}
```

**O que acontece:**
1. Gera um link seguro de recuperação no Supabase SB1.
2. Envia um e-mail personalizado através do Gmail do JP com o botão de redefinição.

---

## 🛠️ Exemplo de Implementação (React/JS)

```javascript
// Exemplo para o botão de Cadastro
const handleRegister = async (formData) => {
  try {
    const response = await fetch('http://localhost:3002/api/webhooks/jp/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone
      })
    });
    
    const result = await response.json();
    if (result.success) {
      alert('Cadastro realizado! Verifique seu e-mail.');
    }
  } catch (error) {
    console.error('Erro ao cadastrar:', error);
  }
};
```

## ⚠️ Observação sobre o E-mail
O envio de e-mails via Gmail **exige** uma "Senha de App" de 16 dígitos. Sem isso, o sistema não consegue autenticar no SMTP do Google por questões de segurança (2FA).

## 🌍 Deploy na Vercel

Para que o site online funcione, você deve subir este projeto do dashboard na Vercel e configurar as **Environment Variables** lá (exatamente como estão no seu `.env.local`).

1. Conecte o repositório `ops-dashboard` na Vercel.
2. Adicione as chaves:
   - `SB1_SUPABASE_URL`
   - `SB1_SUPABASE_SERVICE_ROLE_KEY`
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. O Vercel gerará uma URL (ex: `https://ops-dashboard.vercel.app`).
4. O time do Clube das Brabas deve trocar o `localhost:3002` pela sua URL de produção.
