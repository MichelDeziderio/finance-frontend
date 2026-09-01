# Sistema de Controle Financeiro - Frontend

## Objetivo

Interface Angular para cadastro, consulta e visualizacao de dados financeiros organizados por carteira.

## Tecnologias

- Angular
- TypeScript
- PrimeNG
- SCSS

## Como executar

```bash
npm install
npm start
```

A aplicacao fica disponivel em `http://localhost:4200`.

## Build

```bash
npm run build
```

## Estrutura

```text
src/app/
  core/       Servicos e guardas
  features/   Telas de carteiras, categorias e movimentacoes
  layout/     Estrutura visual da aplicacao
  models/     Contratos da API
```

## Entregas academicas

### AC1 - Cadastro de Movimentacoes

- Layout principal e navegacao.
- Carteiras com selecao da carteira ativa.
- Categorias e criacao rapida no formulario.
- Cadastro de receitas e despesas.
- Validacoes com Reactive Forms.
- Integracao HTTP inicial com a API.

Status: concluida.

### AC2 - Historico de Movimentacoes

- Listagem paginada de movimentacoes.
- Busca por descricao.
- Filtros por tipo, categoria e periodo.
- Edicao e exclusao de movimentacoes.

Status: concluida.

### AC3 - Dashboard Financeiro

- Resumo de receitas, despesas e saldo.
- Graficos de receitas x despesas e despesas por categoria.
- Comparacao com o periodo anterior.
- Filtro de periodo.
- Secao com as 10 ultimas movimentacoes.

Status: concluida.

Status da AC1: concluida.

Status da AC2: concluida.

Status da AC3: concluida.
