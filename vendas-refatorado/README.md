# Dashboard de Vendas - VIVA Eventos

Dashboard de vendas desenvolvido em Next.js/React com TypeScript, seguindo os padrões do projeto PEX.

## Tecnologias

- **Next.js 14** - Framework React com SSR
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Chart.js + react-chartjs-2** - Gráficos
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── charts/         # Gráficos (VVRChart, PieChart, etc.)
│   ├── filters/        # Filtros (DateRangePicker, MultiSelect)
│   ├── tables/         # Tabelas (DataTable, RankingTable)
│   ├── Header.tsx      # Cabeçalho
│   ├── Sidebar.tsx     # Barra lateral com navegação
│   ├── KPICard.tsx     # Cards de KPIs
│   └── ...
├── config/             # Configurações
│   └── app.config.ts   # IDs de planilhas, cores, constantes
├── hooks/              # Hooks customizados
│   ├── useSalesData.ts # Dados de vendas
│   ├── useMetasData.ts # Dados de metas
│   ├── useFundosData.ts # Dados de fundos
│   └── useFunilData.ts # Dados do funil
├── pages/              # Páginas Next.js
│   ├── _app.tsx        # App wrapper
│   ├── _document.tsx   # HTML base
│   └── index.tsx       # Dashboard principal
├── styles/
│   └── globals.css     # Estilos globais + Tailwind
├── types/              # Definições de tipos
│   ├── vendas.types.ts # Tipos de vendas/adesões
│   ├── funil.types.ts  # Tipos do funil
│   └── filtros.types.ts # Tipos de filtros
└── utils/              # Utilitários
    ├── calculos.ts     # Cálculos de KPIs
    ├── formatacao.ts   # Formatação de valores
    └── periodo.ts      # Cálculos de período
```

## Páginas do Dashboard

1. **Metas e Resultados** - KPIs principais (VVR, QAV, TK, TM), gráficos e ranking
2. **Indicadores Secundários** - Indicadores operacionais e comparativos
3. **Funil de Vendas** - Visualização do funil e análise de perdas

## Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start
```

## Fontes de Dados

O dashboard se conecta às seguintes planilhas Google Sheets:

- **Vendas/Adesões**: `1HXyq_r2ssJ5c7wXdrBUc-WdqrlCfiZYE1EuIWbIDg0U`
- **Metas**: `1KywSOsTn7qUdVp2dLthWD3Y27RsE1aInk6hRJhp7BFw`
- **Funil**: `1t67xdPLHB34pZw8WzBUphGRqFye0ZyrTLvDhC7jbVEc`

## Funcionalidades

### Filtros
- Período pré-definido (hoje, ontem, este mês, etc.)
- Período personalizado
- Multi-seleção de unidades, regionais, UFs, cidades
- Toggle de Meta Interna (85%)

### KPIs
- VVR - Valor Vendido Realizado
- QAV - Quantidade de Vendas
- TK - Ticket Médio
- TM - Taxa de Conversão

### Gráficos
- Barras comparativas (realizado x meta)
- Evolução acumulada (linha)
- Distribuição (pizza/rosca)
- Comparativo ano a ano
- Funil de vendas

### Tabelas
- Ranking de unidades/consultores
- Tabela de dados com busca e paginação

## Configuração de Deploy (Vercel)

O projeto está configurado para deploy na Vercel. Basta conectar o repositório.

```json
// vercel.json
{
  "framework": "nextjs"
}
```

## Autor

VIVA Eventos Brasil - {ano_atual}
