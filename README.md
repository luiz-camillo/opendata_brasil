# OpenData Brasil

Aplicação web para consulta, comparação e exportação de dados públicos
brasileiros. Consome APIs oficiais do governo federal e apresenta os
dados em uma interface moderna inspirada em ferramentas de Business
Intelligence.

🔗 **Live demo:** `https://<seu-usuario>.github.io/opendata-brasil/`

## Objetivo

Permitir que estudantes, pesquisadores, analistas e desenvolvedores
explorem dados municipais brasileiros de forma simples, rápida e
organizada, tudo no frontend — sem backend próprio.

## Stack

- React 19
- Vite 8
- JavaScript ES6+
- CSS Modules
- Chart.js
- Leaflet
- Axios
- React Router (HashRouter para GitHub Pages)
- Vitest + Testing Library + jsdom

## Arquitetura

O projeto segue uma arquitetura inspirada em Clean Architecture:

```text
Services (API/External data)
    ↓
Controllers (Business logic)
    ↓
Hooks (State/orchestration)
    ↓
Components (UI only)
```

- **Services**: comunicação com APIs (`IbgeService`, `StorageService`,
  `DatasetService`, `ExportService`).
- **Controllers**: orquestração de consultas e comparações
  (`ConsultaController`, `ComparacaoController`).
- **Models**: classes de domínio (`Municipio`, `Indicador`, `Dataset`,
  `Exportador`, `Comparador`, `Consulta`, `ApiError`, `ApiResponse`).
- **Components**: interface, divididos em `common`, `cards`, `charts`,
  `tables`, `forms`, `map` e `layout`.

Nenhum componente chama APIs diretamente.

## APIs integradas

Atualmente o projeto consome apenas APIs do **IBGE**:

- `/api/v1/localidades/municipios` — lista e detalhes de municípios
- `/api/v3/agregados` — dados do SIDRA

### Indicadores disponíveis

| Indicador | Fonte IBGE | Observação |
|---|---|---|
| População residente estimada | SIDRA 6579 / var 9324 | Com seleção de ano |
| Área territorial | SIDRA 1301 / var 615 | Censo 2010 |
| Densidade demográfica | Derivado | população ÷ área |
| Produto Interno Bruto (PIB) | SIDRA 5938 / var 37 | Com seleção de ano |
| PIB per capita | Derivado | (PIB × 1000) ÷ população |
| Taxa de alfabetização | SIDRA 1383 / var 1646 | Total, Censo 2010 |

A arquitetura permite adicionar novas fontes (Banco Central, IPEA,
INMET, DATASUS, etc.) sem reestruturar o projeto.

## Funcionalidades

- **Dashboard**: cards de indicadores e gráficos (barras, linhas,
  pizza, radar, séries temporais via Chart.js).
- **Comparação**: comparação automática lado a lado entre até dois
  municípios, com indicadores principais pré-selecionados.
- **Data Explorer**: tabela virtualizada com busca instantânea,
  filtros, ordenação, paginação, seleção de colunas, visualização
  **Head** (primeiras 5 linhas), contador de registros e exportação.
- **Exportação**: CSV e JSON, respeitando filtros aplicados.
- **Local Storage**: última consulta (municípios, indicadores e
  período) restaurada automaticamente.
- **Página de APIs**: informações sobre as APIs consumidas.
- **Responsividade**: layout adaptado para desktop, tablet e mobile.

## Como rodar

```bash
# 1. Clone o repositório
git clone https://github.com/<seu-usuario>/opendata-brasil.git
cd opendata-brasil

# 2. Instale as dependências
npm install

# 3. Rode em desenvolvimento
npm run dev

# 4. Execute os testes
npm test

# 5. Faça o build de produção
npm run build
```

## Deploy no GitHub Pages

1. Certifique-se de que o repositório remoto está configurado:

```bash
git remote add origin https://github.com/<seu-usuario>/opendata-brasil.git
```

2. Execute o deploy:

```bash
npm run deploy
```

O script `gh-pages` publicará o conteúdo da pasta `dist` na branch
`gh-pages` do repositório. Ative o GitHub Pages nas configurações do
repositório para servir a partir dessa branch.

> O projeto usa `HashRouter` do React Router para funcionar corretamente
> com hospedagem estática no GitHub Pages.

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm test` | Executa a suíte de testes |
| `npm run lint` | Executa o linter (oxlint) |
| `npm run deploy` | Publica no GitHub Pages |

## Estrutura de pastas

```text
src/
├── assets/
├── components/
│   ├── common/
│   ├── cards/
│   ├── charts/
│   ├── tables/
│   ├── forms/
│   ├── map/
│   └── layout/
├── pages/
├── services/
│   ├── api/
│   ├── dataset/
│   ├── export/
│   └── storage/
├── controllers/
├── models/
├── hooks/
├── utils/
├── config/
├── styles/
├── workers/
└── main.jsx
```

## Licença

MIT. Dados fornecidos por órgãos públicos brasileiros, via APIs
oficiais.

## Contato

Abra uma issue no GitHub para sugerir novas APIs, indicadores ou
melhorias.
