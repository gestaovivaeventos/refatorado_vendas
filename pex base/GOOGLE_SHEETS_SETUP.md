# Configuração do Google Sheets API

Este documento explica como configurar o acesso ao Google Sheets usando Service Account.

## 📋 Pré-requisitos

1. Ter uma conta Google Cloud Platform
2. Ter uma planilha Google Sheets criada
3. Ter permissões de administrador no projeto GCP

## 🔧 Configuração Passo a Passo

### 1. Criar um Projeto no Google Cloud Platform

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o nome/ID do projeto

### 2. Ativar a API do Google Sheets

1. No menu lateral, vá em **APIs & Services** > **Library**
2. Procure por "Google Sheets API"
3. Clique em **Enable** para ativar a API

### 3. Criar uma Service Account

1. No menu lateral, vá em **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **Service Account**
3. Preencha os dados:
   - **Service account name**: `pex-dashboard-sheets` (ou outro nome)
   - **Service account ID**: será gerado automaticamente
   - **Description**: "Service Account para acesso ao Google Sheets do PEX"
4. Clique em **Create and Continue**
5. Em **Role**, selecione **Viewer** (ou deixe sem role se preferir controlar pelo Sheets)
6. Clique em **Done**

### 4. Gerar uma Chave JSON

1. Na lista de Service Accounts, clique na conta recém-criada
2. Vá na aba **Keys**
3. Clique em **Add Key** > **Create new key**
4. Selecione o formato **JSON**
5. Clique em **Create**
6. Um arquivo JSON será baixado automaticamente - **GUARDE-O COM SEGURANÇA**

### 5. Compartilhar a Planilha com a Service Account

1. Abra o arquivo JSON baixado
2. Copie o valor do campo `client_email` (algo como: `pex-dashboard-sheets@projeto.iam.gserviceaccount.com`)
3. Abra sua planilha Google Sheets
4. Clique em **Compartilhar** (Share)
5. Cole o e-mail da Service Account
6. Defina a permissão como **Viewer** (Visualizador)
7. Desmarque "Notify people" (não enviar e-mail)
8. Clique em **Share**

### 6. Obter o ID da Planilha

O ID da planilha está na URL:
```
https://docs.google.com/spreadsheets/d/[ESTE_É_O_ID]/edit
```

Copie o ID entre `/d/` e `/edit`

### 7. Codificar o Service Account em Base64

Você precisa converter o arquivo JSON para Base64 para armazenar como variável de ambiente.

**No PowerShell (Windows):**
```powershell
$jsonContent = Get-Content -Path "caminho\para\seu\arquivo.json" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonContent)
$base64 = [Convert]::ToBase64String($bytes)
$base64 | Set-Clipboard
Write-Host "Base64 copiado para clipboard!"
```

**No Linux/Mac:**
```bash
base64 -i seu-arquivo.json | pbcopy  # Mac
base64 -i seu-arquivo.json | xclip   # Linux
```

**Ou use um site como:** https://www.base64encode.org/ (cole o conteúdo do JSON)

### 8. Configurar Variáveis de Ambiente

Adicione no seu arquivo `.env` (ou `.env.local`):

```env
# ID da planilha (da URL)
GOOGLE_SHEET_ID=1a2b3c4d5e6f7g8h9i0j

# Email da Service Account (do arquivo JSON)
GOOGLE_SERVICE_ACCOUNT_EMAIL=pex-dashboard-sheets@projeto.iam.gserviceaccount.com

# Conteúdo do arquivo JSON codificado em Base64
GOOGLE_SERVICE_ACCOUNT_BASE64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6InByb2pldG8tc2hlZXRzLTEyMzQ1NiIsInByaXZhdGVfa2V5X2lkIjoiYWJjMTIzZGVmNDU2IiwiY...
```

## 🔒 Segurança

**IMPORTANTE:**

1. ❌ **NUNCA** commit o arquivo JSON da Service Account no Git
2. ❌ **NUNCA** commit o arquivo `.env` com as credenciais
3. ✅ Armazene o arquivo JSON no **Cofre Central de Credenciais**
4. ✅ Mantenha o `.env.example` atualizado (sem valores reais)
5. ✅ Use variáveis de ambiente no servidor (não no cliente)

## 📊 Estrutura Esperada das Abas

### Aba: `DEVERIA`

Colunas esperadas (A até V):
- **nm_unidade**: Nome da unidade/franquia
- **cluster**: Cluster da franquia (CALOURO_INICIANTE, CALOURO, GRADUADO, POS_GRADUADO)
- **Onda**: Número da onda atual
- E outras colunas até a coluna V

> **Importante:** A API busca dados do range `DEVERIA!A:V`, que inclui da coluna A (nm_unidade) até a coluna V (Onda).

## 🧪 Testando a API

Após configurar, teste a API:

```bash
# Desenvolvimento local
curl http://localhost:3000/api/sheets

# Produção
curl https://seu-dominio.vercel.app/api/sheets
```

Resposta esperada:
```json
[
  ["nm_unidade", "cluster", "...", "Onda"],
  ["Franquia A", "GRADUADO", "...", "1"],
  ["Franquia B", "CALOURO", "...", "1"]
]
```

## ❓ Troubleshooting

### Erro: "The caller does not have permission"
- Verifique se compartilhou a planilha com o `client_email` da Service Account
- Confirme que a permissão é de pelo menos "Viewer"

### Erro: "Invalid JWT Signature"
- Verifique se a chave privada no JSON está correta
- Recrie a chave se necessário

### Erro: "Variáveis de ambiente não configuradas"
- Confirme que todas as 3 variáveis estão no `.env`
- Reinicie o servidor após adicionar/editar o `.env`

### Dados vazios retornados
- Verifique se o nome da aba está correto: `DEVERIA`
- Confirme que há dados na aba da planilha
- Verifique se as colunas vão de A até V
- Verifique o ID da planilha na URL
