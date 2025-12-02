# PEX Dashboard 2026

> Dashboard para gestão do Programa de Excelência (PEX) da rede de franquias - Ciclo 2026

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Interface e UX](#interface-e-ux)
- [Tecnologias](#tecnologias)
- [Instalação e Execução](#instalação-e-execução)
- [Configuração](#configuração)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Segurança](#segurança)
- [Troubleshooting](#troubleshooting)
- [Contribuidores / Suporte](#contribuidores--suporte)

## 🎯 Visão Geral

O **PEX Dashboard 2026** é uma plataforma web desenvolvida para gerenciar e acompanhar o Programa de Excelência da rede de franquias. O sistema permite monitorar a performance das franquias através de indicadores-chave, clusterização por momento de maturidade, e acompanhamento de ondas trimestrais.

Este projeto resolve o problema de acompanhamento descentralizado e manual da performance das franquias, oferecendo uma visão unificada, automatizada e em tempo real do desempenho de cada unidade em relação às suas metas.

### 📊 Sobre o Programa PEX

O PEX é um programa anual (de conviva a conviva) que visa reconhecer e premiar a excelência na gestão das franquias através de:

- **Clusterização**: Classificação das franquias em 4 clusters (Calouro Iniciante, Calouro, Graduado, Pós Graduado)
- **Indicadores-Chave**: 7 indicadores principais (VVR, MAC, Endividamento, NPS, MC%, E-NPS, Conformidades)
- **Ondas**: 4 ondas trimestrais com pesos variáveis por indicador
- **Bonificações**: Sistema de bônus por ações extras (até 3 por onda)
- **Ranking**: Competição dentro de cada cluster

**Principais características:**

- ✅ Dashboard interativo com visualização de indicadores em tempo real
- ✅ Cálculo automático de pontuações por onda e ranking geral
- ✅ Gestão de clusters e metas personalizadas
- ✅ Sistema de bonificações e reconhecimento
- ✅ Exportação de relatórios e histórico de performance
- ✅ Interface responsiva e otimizada para múltiplos dispositivos
- ✅ Design moderno com tema escuro corporativo e identidade visual Viva
- ✅ Integração com Google Sheets para dados dinâmicos

## ✨ Funcionalidades

### 1. Gestão de Clusters

- Categorização automática de franquias em 4 clusters baseado em VVR dos últimos 12 meses
- Definição de metas específicas por cluster para cada indicador
- Visualização de distribuição de franquias por cluster

### 2. Monitoramento de Indicadores

- **VVR (Valor de Vendas Realizadas)**: Soma dos últimos 12 meses vs meta
- **MAC (Meta de Ativação de Clientes)**: Média de atingimento mensal
- **Endividamento**: Controle de saúde financeira
- **NPS**: Satisfação de clientes
- **MC%**: Margem de contribuição percentual
- **E-NPS**: Satisfação de colaboradores
- **Conformidades**: Média de 4 sub-indicadores (Pipefy, Financeira, Estrutura, Reclame Aqui)

### 3. Sistema de Ondas

- Configuração de 4 ondas por ciclo anual
- Distribuição de pesos (0-5) por indicador em cada onda
- Soma total de pesos sempre igual a 10
- Acompanhamento de performance por onda
- Visualização de pesos por indicador no dashboard

### 4. Bonificações

- Registro de ações extras realizadas pelas franquias
- Pontos bônus (0,5 ou 1 ponto) por ação
- Limite de 3 bonificações por franquia por onda
- Histórico de bonificações recebidas

### 5. Ranking e Resultados

- Cálculo automático de pontuação final (média das ondas)
- Ranking dentro de cada cluster
- Visualização de evolução ao longo das ondas
- Top 3 podium com medalhas por cluster
- Exportação de relatórios detalhados em Excel

### 6. Páginas Principais

- **Ranking** (página inicial): Exibição dos top 3 e top 10 por cluster
- **Resultados**: Dashboard com indicadores por quarter, filtros avançados e tabela resumida
- **Gerenciamento de Parâmetros**: Gestão de consultores, clusters, metas, pesos e bônus
- **Navegação Intuitiva**: Sidebar recolhível com navegação entre páginas

## 🎨 Interface e UX

### Design e Tema

- **Tema Escuro Corporativo**: Background #212529 com componentes em #343A40
- **Identidade Visual Viva**: Logo Viva Eventos integrada no header
- **Tipografia**: Poppins (corpo) e Orbitron (títulos) para destaque
- **Cores Principais**: 
  - Laranja (#FF6600) para ações e destaques
  - Branco (#F8F9FA) para textos principais
  - Cinza (#6c757d) para textos secundários

### Componentes Visuais

- **Header**: Barra superior com logo Viva e título do programa, botão de logout
- **Sidebar**: Navegação recolhível com filtros contextuais (Quarter, Unidade, Cluster, Consultor) e ícones lucide-react em estilo SaaS Enterprise
- **Cards de Ranking (Top 3)**: Glassmorphism cards com cores ouro/prata/bronze para as 3 primeiras posições
- **Cards de Indicadores**: Exibição de pontuação, comparativos e peso do indicador
- **Tabela Resumida**: Listagem de unidades com todas as pontuações, ordenação por coluna e exportação para Excel
- **Footer**: Crédito discreto de desenvolvimento na base de todas as páginas
- **Favicon**: Logo Viva como favicon para branding em abas do navegador
- **Tipografia**: Orbitron para títulos (impactante), Poppins para corpo de texto

### Recursos de Otimização

- Exportação de dados para Excel via botão dedicado
- Filtros dinâmicos que atualizam todos os gráficos e tabelas em tempo real
- Tabelas com scroll vertical para melhor visualização
- Títulos HTML específicos por página para melhor SEO e identificação em abas
- Responsive design que funciona em desktop, tablet e mobile

## 🛠 Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript 5.3
- **Estilização**: Tailwind CSS 3.3, PostCSS, styled-jsx
- **Ícones**: Lucide React (para ícones SVG monochromáticos)
- **Backend**: Next.js API Routes
- **Banco de Dados**: Google Sheets API (origem de dados)
- **Exportação**: XLSX para relatórios em Excel
- **Hospedagem**: Vercel
- **Ferramentas**: Git, npm, ESLint

## 📦 Instalação e Execução

### Pré-requisitos

- Node.js v18 ou superior
- npm v9 ou superior
- Acesso ao repositório GitHub da organização
- Credenciais do Google Sheets (consultar documentação de configuração)

### Passos

1. **Clone o repositório**
   ```bash
   git clone https://github.com/gestaovivaeventos/novo_pex.git
   cd novo_pex
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   - Copie o arquivo `.env.example` para `.env`
   - Consulte o arquivo [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) para obter as chaves
   - Preencha todas as variáveis necessárias (Google Sheets API)

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   - Abra seu navegador em `http://localhost:3000`
   - A aplicação redirecionará automaticamente para `/ranking`

### Build para Produção

```bash
npm run build
npm start
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis. Para uma lista completa, consulte `.env.example`.

```env
# Google Sheets API Configuration
GOOGLE_SHEET_ID=seu_id_da_planilha_aqui
GOOGLE_SERVICE_ACCOUNT_EMAIL=seu-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_BASE64=sua_chave_em_base64_aqui

# Environment
NODE_ENV=production
```

**⚠️ Importante**: 
- **NUNCA** commit o arquivo `.env` no Git
- A chave base64 deve ser a Service Account do Google Cloud codificada em base64
- O arquivo `.env.example` deve ser mantido atualizado sem valores reais

### Configuração do Google Sheets

Para configurar a integração com Google Sheets, consulte o guia completo em [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md).

**Resumo:**
1. Criar Service Account no Google Cloud Platform
2. Ativar Google Sheets API
3. Compartilhar planilha com o e-mail da Service Account
4. Codificar o JSON da Service Account em Base64
5. Configurar as 3 variáveis de ambiente

### Abas do Google Sheets Esperadas

- **DEVERIA**: Dados principais com colunas de indicadores por quarter
- **CRITERIOS RANKING**: Pesos dos indicadores por quarter (VVR, MAC, ENDIVIDAMENTO, NPS, % MC (ENTREGA), E-NPS, % CONFORMIDADES)
- **METAS**: Metas por cluster para cada indicador

## 📁 Estrutura do Projeto

```
novo_pex/
├── public/                       # Arquivos estáticos
│   ├── index.html               # HTML principal
│   └── logo_viva.png            # Logo para favicon
├── src/
│   ├── components/              # Componentes React reutilizáveis
│   │   ├── Card.tsx            # Card genérico com estilos customizados
│   │   ├── Header.tsx          # Cabeçalho com logo Viva
│   │   ├── Footer.tsx          # Footer com crédito de desenvolvimento
│   │   ├── Sidebar.tsx         # Sidebar com navegação e filtros
│   │   ├── ClusterBadge.tsx    # Badge de cluster
│   │   ├── IndicadorCard.tsx   # Card de indicador com peso
│   │   ├── TabelaRanking.tsx   # Tabela de ranking com top 3
│   │   ├── TabelaResumo.tsx    # Tabela resumida com exportação Excel
│   │   └── ResumoOnda.tsx      # Resumo de onda
│   ├── pages/                  # Páginas Next.js
│   │   ├── index.tsx           # Página de redirecionamento para /ranking
│   │   ├── ranking.tsx         # Página de ranking (principal)
│   │   ├── resultados.tsx      # Página de resultados/dashboard
│   │   ├── parametros.tsx      # Página de gerenciamento de parâmetros
│   │   ├── _app.tsx            # App wrapper
│   │   ├── _document.tsx       # Document wrapper com favicon
│   │   └── api/                # API Routes
│   │       ├── sheets.ts       # Handler Google Sheets (dados)
│   │       ├── pesos.ts        # Handler pesos dos indicadores
│   │       ├── consultores.ts  # Handler consultores
│   │       ├── clusters.ts     # Handler clusters
│   │       ├── metas.ts        # Handler metas
│   │       └── bonus.ts        # Handler bônus
│   ├── hooks/                  # React Hooks customizados
│   │   └── useSheetsData.ts    # Hook para buscar dados do Sheets
│   ├── styles/                 # Estilos globais
│   │   └── globals.css         # CSS global com Tailwind
│   ├── utils/                  # Funções utilitárias
│   │   ├── calculosPex.ts      # Cálculos dos indicadores PEX
│   │   ├── formatacao.ts       # Formatação de dados
│   │   ├── validacao.ts        # Validações
│   │   └── dadosMock.ts        # Dados simulados para desenvolvimento
│   ├── config/                 # Configurações
│   │   ├── firebase.ts         # Configuração Firebase
│   │   └── app.config.ts       # Configurações da aplicação
│   └── types/                  # TypeScript types
│       └── pex.types.ts        # Tipos do PEX
├── .env                        # Variáveis de ambiente (NÃO COMMITAR)
├── .env.example                # Template de variáveis
├── .gitignore                  # Arquivos ignorados pelo Git
├── GOOGLE_SHEETS_SETUP.md      # Guia de configuração Google Sheets
├── GUIA_EXECUCAO.md            # Guia de execução e uso
├── PAGINA_PRINCIPAL.md         # Documentação da página principal
├── package.json                # Dependências
├── tsconfig.json               # Configuração TypeScript
├── next.config.js              # Configuração Next.js
├── tailwind.config.js          # Configuração Tailwind
├── postcss.config.js           # Configuração PostCSS
├── vercel.json                 # Configuração Vercel
└── README.md                   # Este arquivo
```

## 🎯 Fluxo de Navegação

1. **Acesso**: Usuário acessa `localhost:3000` ou `seu-dominio.com`
2. **Redirecionamento**: Automático para `/ranking` (página principal)
3. **Ranking**: Visualiza top 3 com medalhas e top 10 de cada cluster
4. **Filtros (Sidebar)**: Quarter, Unidade, Cluster, Consultor
5. **Resultados**: Dashboard com indicadores e comparativos
6. **Parâmetros**: Gerenciamento de dados base do sistema
7. **Navegação**: Sidebar permite retornar a qualquer página

## 📊 Páginas e Funcionalidades

### 1. Página de Ranking (`/ranking`)
- **Conteúdo**: Top 3 (com podium e medalhas) + Top 10 por cluster
- **Dados**: Média de todos os quarters
- **Visualização**: Clusterizado e ranqueado automaticamente

### 2. Página de Resultados (`/resultados`)
- **Conteúdo**: Cards de indicadores com pesos + tabela resumida
- **Filtros**: Quarter, Unidade, Cluster, Consultor
- **Indicadores**: 8 cards (7 indicadores + 1 bônus)
- **Comparativos**: Melhor pontuação da rede e cluster por indicador
- **Exportação**: Tabela pode ser exportada para Excel

### 3. Página de Parâmetros (`/parametros`)
- **Consultor**: CRUD de consultores responsáveis
- **Cluster**: CRUD de clusters de franquias
- **Metas**: Configuração de metas por cluster
- **Pesos**: Definição de pesos por indicador e quarter
- **Bônus**: Registro de bonificações

### 4. Página Principal (Redirecionamento automático para `/ranking`)
- Exibe mensagem "Redirecionando..."
- Redireciona para `/ranking` ao carregar

## 🔐 Segurança

### Autenticação
- Autenticação básica por e-mail/senha através do Google Sheets
- Senhas armazenadas com hash seguro na aba SENHAS da planilha
- Sistema de tokens para reset de senha
- Controle de acesso baseado em autenticação de usuário

### Chaves de API
- Todas as credenciais são gerenciadas via **variáveis de ambiente**
- Credenciais da Google Sheets API acessadas apenas no backend
- Nenhuma chave exposta diretamente no código (hardcode)
- Service Account do Google Cloud codificada em base64

### Banco de Dados
- **Google Sheets** como banco de dados seguro baseado em nuvem
- Acesso restrito por permissões de compartilhamento do Google Drive
- Múltiplas abas para organizar dados (DEVERIA, CRITERIOS RANKING, METAS, SENHAS)
- Histórico automático de alterações via Google Drive

### Conformidade com Diretrizes
Este projeto foi desenvolvido seguindo rigorosamente o **Documento de Diretrizes e Boas Práticas para o Desenvolvimento de Ferramentas de IA**:
- ✅ Código modular e reutilizável (princípio DRY)
- ✅ Separação de responsabilidades
- ✅ Comentários explicando "o porquê"
- ✅ Variáveis de ambiente para credenciais
- ✅ GitFlow com branches e code review
- ✅ Conventional Commits
- ✅ Sem console.log em produção
- ✅ Footer com crédito de desenvolvimento
- ✅ Favicon e títulos HTML específicos
- ✅ Design System consistente (Central de Dashboards)

## 🐛 Troubleshooting

### Erro: "Cannot find module 'firebase/app'"
**Solução**: Certifique-se de ter instalado todas as dependências:
```bash
npm install
```

### Erro: "process is not defined"
**Solução**: Este erro ocorre quando variáveis de ambiente não estão configuradas. Verifique:
1. Arquivo `.env` existe na raiz do projeto
2. Todas as variáveis de Google Sheets estão preenchidas
3. Reinicie o servidor de desenvolvimento após criar/editar o `.env`

### Página não carrega ou erro 404
**Solução**: 
- Limpe o cache do Next.js: `rm -rf .next`
- Execute `npm run dev` novamente

### Erro ao buscar dados do Google Sheets
**Solução**:
- Verifique se a Service Account está corretamente configurada
- Confirme que a planilha está compartilhada com o e-mail da Service Account
- Valide se as abas (DEVERIA, CRITERIOS RANKING, METAS, SENHAS) existem
- Verifique se o GOOGLE_SHEET_ID está correto

## 👥 Contribuidores / Suporte

**Desenvolvedor Principal**: Gabriel Braz  
**Equipe**: Gestão Viva Eventos  
**Organização**: gestaovivaeventos

### Suporte
- Para dúvidas técnicas, consulte a documentação no repositório
- Para configuração de Google Sheets, consulte [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)
- Para reportar bugs ou sugerir melhorias, abra uma issue no GitHub

### Processo de Contribuição

1. **Nunca edite a branch main diretamente**
2. Crie uma branch para sua feature: `git checkout -b feat/nova-funcionalidade`
3. Faça commits seguindo Conventional Commits:
   - `feat:` para novas funcionalidades
   - `fix:` para correções de bugs
   - `docs:` para documentação
   - `refactor:` para refatorações
4. Solicite code review antes do merge
5. Abra um Pull Request para a main

---

**Versão**: 2.1.0  
**Última Atualização**: Novembro 2025  
**Licença**: Proprietário - Gestão Viva Eventos
