# 🔧 Como Aplicar os Fixes nos Arquivos PHP

**Status:** 🔴 CRÍTICO - BD offline, mas erros podem ser minimizados enquanto BD volta

---

## 📋 Arquivos a Editar

### 1️⃣ `/home/cliccombr/public_html/vendors/Capa.php`

**Linhas afetadas:** 85, 102

**O que fazer:**
Procure por linhas que acessam `$capa->combo1_tipo`, `$capa->combo2_tipo`, etc.

**Antes:**
```php
echo $capa->combo1_tipo;
echo $capa->combo1_id_artigo;
```

**Depois:**
```php
if (isset($capa) && is_object($capa)) {
    echo $capa->combo1_tipo ?? '';
    echo $capa->combo1_id_artigo ?? '';
} else {
    error_log("ERRO: Capa.php - objeto null");
}
```

**Na linha 102**, procure por `$capa->destaque_tipo`:
```php
if (isset($capa) && is_object($capa) && property_exists($capa, 'destaque_tipo')) {
    echo $capa->destaque_tipo;
}
```

---

### 2️⃣ `/home/cliccombr/public_html/vendors/SubCapa.php`

**Linha afetada:** 91

**O que fazer:**
Procure por `$subcapa->combo1_id_artigo`, `$subcapa->combo2_id_artigo`, etc.

**Antes:**
```php
echo $subcapa->combo1_id_artigo;
```

**Depois:**
```php
if (isset($subcapa) && is_object($subcapa)) {
    echo $subcapa->combo1_id_artigo ?? '';
    echo $subcapa->combo2_id_artigo ?? '';
    echo $subcapa->combo3_id_artigo ?? '';
} else {
    error_log("ERRO: SubCapa.php linha 91 - objeto null");
}
```

---

### 3️⃣ `/home/cliccombr/public_html/vendors/Artigos.php`

**Linha afetada:** 272

**O que fazer:**
Procure por `$amountImages` (sem ser inicializada antes)

**Antes:**
```php
echo $amountImages;  // ← Erro se não foi definida
```

**Depois:**
```php
// Inicializa se não existir
$amountImages = $amountImages ?? 0;
echo $amountImages;
```

**OU:**
```php
echo isset($amountImages) ? $amountImages : 0;
```

---

## 🚀 Como Fazer Upload

### Opção 1: Via cPanel File Manager
1. Abra: https://www.iaol.com.br:2087
2. Vá em: **Files → File Manager**
3. Navegue até: `/home/cliccombr/public_html/vendors/`
4. Clique em **Edit** (para cada arquivo)
5. Aplique as mudanças
6. Clique em **Save**

### Opção 2: Via FTP (Recomendado)
1. Use FileZilla ou outro cliente FTP
2. Conecte em: `server.vipreseller25ssd.com`
3. Navegue até: `/home/cliccombr/public_html/vendors/`
4. Download dos arquivos
5. Edite localmente
6. Upload de volta

### Opção 3: Via SSH (Mais rápido)
```bash
ssh user@server.vipreseller25ssd.com
nano /home/cliccombr/public_html/vendors/Capa.php
# Faça as mudanças e salve (Ctrl+O, Enter, Ctrl+X)
```

---

## ✅ Validação Após Editar

Após fazer as mudanças, visite:
```
https://clicando.com.br/
```

Veja se os erros desaparecem do log.

---

## 📊 O Que Esperar

**Antes do fix:**
```
PHP Notice: Trying to get property 'combo1_tipo' of non-object
```

**Depois do fix:**
```
(sem erro - mostrará valor vazio ou padrão)
```

---

## ⚠️ IMPORTANTE

**Estes fixes são TEMPORÁRIOS!**

A causa raiz é o **Banco de Dados estar offline**. 

**Você AINDA PRECISA:**
1. ✅ Contactar suporte
2. ✅ Reiniciar MySQL/MariaDB
3. ✅ Verificar conexão PHP→BD
4. ✅ Restaurar dados se necessário

---

**Archivos patches:** 
- Capa.php.patch
- SubCapa.php.patch
- Artigos.php.patch

Todos estão em: `C:\Users\vsuga\clawd\fixes\`
