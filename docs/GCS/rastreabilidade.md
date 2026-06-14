# Matriz de Rastreabilidade

**Projeto:** SOS Rota — Eng5 2026/1  
**Responsável GCS:** Gabriella Pio  
**Última atualização:** 14/06/2026

---

## O que é a Matriz de Rastreabilidade?

A Matriz de Rastreabilidade conecta cada requisito implementado aos artefatos correspondentes no repositório, garantindo que nenhum requisito fique sem implementação rastreável e que toda implementação esteja vinculada a um requisito formal.

---

## Como ler esta matriz

| Coluna                       | Descrição                                          |
| ---------------------------- | -------------------------------------------------- |
| **Requisito**                | Identificador e nome do requisito (RF = Funcional) |
| **Issue**                    | Número e link da Issue no GitHub                   |
| **Branch**                   | Branch criada para implementar o requisito         |
| **Arquivo(s) principal(is)** | Arquivo(s) mais relevante(s) da implementação      |
| **PR**                       | Número do Pull Request que mergeou a implementação |
| **Release**                  | Tag de release em que o requisito foi entregue     |
| **Status**                   | ✅ Entregue / 🔄 Em andamento / ❌ Won't do        |

---

## Matriz

### GCS — Gerência de Configuração

| Requisito                                                | Issue | Branch                         | Arquivo(s) principal(is)                                      | PR   | Release | Status |
| -------------------------------------------------------- | ----- | ------------------------------ | ------------------------------------------------------------- | ---- | ------- | ------ |
| GCS01 — Templates de Issue e PR                          | #1    | `chore/setup-templates`        | `.github/ISSUE_TEMPLATE/`, `.github/pull_request_template.md` | #2   | v0.1.0  | ✅     |
| GCS02 — Documentação GCS (ICs, Baselines, Versionamento) | #7    | `feature/docs-gcs-fundacao`    | `docs/GCS/`                                                   | #33  | v0.1.0  | ✅     |
| GCS03 — RFC-001                                          | #8    | `feature/docs-rfc-001`         | `docs/GCS/rfc-001.md`                                         | #34  | v0.1.0  | ✅     |
| GCS04 — Pipeline de CI                                   | #1    | —                              | `.github/workflows/ci.yml`                                    | #2   | v0.1.0  | ✅     |
| GCS05 — Matriz de Rastreabilidade                        | #31   | `feature/docs-rastreabilidade` | `docs/GCS/rastreabilidade.md`                                 | #62  | v1.0.0  | ✅     |

---

### Backend — Spring Boot

| Requisito                            | Issue | Branch                                 | Arquivo(s) principal(is)                                     | PR  | Release | Status |
| ------------------------------------ | ----- | -------------------------------------- | ------------------------------------------------------------ | --- | ------- | ------ |
| RF01 — Configuração Spring Boot + H2 | #4    | `feature/setup-backend`                | `pom.xml`, `application.properties`                          | #35 | v1.0.0  | ✅     |
| RF02 — Autenticação JWT              | #20   | `feature/backend-auth`                 | `AuthController.java`, `AuthService.java`, `JwtService.java` | #39 | v1.0.0  | ✅     |
| RF03 — CRUD de Ocorrências           | #5    | `chore/backend-ocorrencias`            | `OcorrenciaController.java`, `OcorrenciaService.java`        | #51 | v1.0.0  | ✅     |
| RF04 — CRUD de Ambulâncias           | #9    | `feature/backend-profissionais`        | `AmbulanciaController.java`, `AmbulanciaService.java`        | #42 | v1.0.0  | ✅     |
| RF05 — CRUD de Equipes               | #10   | `feature/backend-equipes`              | `EquipeController.java`, `EquipeService.java`                | #46 | v1.0.0  | ✅     |
| RF06 — CRUD de Bairros               | #21   | `feature/backend-bairros`              | `BairroController.java`, `BairroService.java`                | #40 | v1.0.0  | ✅     |
| RF07 — CRUD de Profissionais         | #22   | `feature/backend-profissionais`        | `ProfissionalController.java`, `ProfissionalService.java`    | #42 | v1.0.0  | ✅     |
| RF08 — Despacho e roteamento         | #11   | `feature/backend-dashboard/relatorios` | `DespachoController.java`, `DijkstraService.java`            | #53 | v1.0.0  | ✅     |
| RF09 — Endpoint de Dashboard         | #23   | `feature/backend-dashboard/relatorios` | `DashboardController.java`, `DashboardService.java`          | #53 | v1.0.0  | ✅     |
| RF10 — Endpoint de Relatórios        | #12   | `feature/backend-dashboard/relatorios` | `RelatorioController.java`, `RelatorioService.java`          | #53 | v1.0.0  | ✅     |

---

### Frontend — Angular

| Requisito                                         | Issue | Branch                          | Arquivo(s) principal(is)                                         | PR  | Release | Status |
| ------------------------------------------------- | ----- | ------------------------------- | ---------------------------------------------------------------- | --- | ------- | ------ |
| RF11 — Setup Angular                              | #6    | `feature/setup-frontend`        | `angular.json`, `app.routes.ts`                                  | #36 | v1.0.0  | ✅     |
| RF12 — Tela de Login                              | #13   | `feature/frontend-login`        | `login.component.ts`, `auth.service.ts`                          | #37 | v1.0.0  | ✅     |
| RF13 — Dashboard                                  | #14   | `feature/frontend-dashboard`    | `dashboard.component.ts`                                         | #38 | v1.0.0  | ✅     |
| RF14 — Tela de Ocorrências                        | #15   | `feature/frontend-ocorrencias`  | `ocorrencias.component.ts`                                       | #43 | v1.0.0  | ✅     |
| RF15 — Tela de Ambulâncias                        | #16   | `feature/frontend-ambulancias`  | `ambulancias.component.ts`                                       | #45 | v1.0.0  | ✅     |
| RF16 — Tela de Equipes                            | #17   | `feature/frontend-equipes`      | `equipes.component.ts`                                           | #48 | v1.0.0  | ✅     |
| RF17 — Tela de Despacho                           | #18   | `feature/frontend-despacho`     | `despacho.component.ts`                                          | #49 | v1.0.0  | ✅     |
| RF18 — Tela de Profissionais                      | #44   | `feature/frontend-profissionais`| `profissionais.component.ts`                                     | #47 | v1.0.0  | ✅     |
| RF19 — Tela de Relatórios                         | #19   | `feature/frontend-relatorios`   | `relatorios.component.ts`                                        | #54 | v1.0.0  | ✅     |
| RF20 — Integração validators LFA nos componentes  | #25   | `refactor/frontend-validators`  | `validators.ts`, `profissionais.component.ts`                    | #60 | v1.0.0  | ✅     |

---

### Padrões de Projeto

| Requisito                                          | Issue | Branch                          | Arquivo(s) principal(is)                                             | PR  | Release | Status |
| -------------------------------------------------- | ----- | ------------------------------- | -------------------------------------------------------------------- | --- | ------- | ------ |
| PP01 — Mapeamento e comentários no backend         | #24   | `feature/padroes-de-projeto`    | Arquivos Java anotados (`@Singleton`, `@Adapter`, etc.)              | #56 | v1.0.0  | ✅     |
| PP02 — Documento dos padrões de projeto            | #24   | `feature/padroes-de-projeto`    | `docs/padroes-de-projeto.md`                                         | #55 | v1.0.0  | ✅     |
| PP03 — Mapeamento e comentários no frontend        | #24   | `feature/frontend-padroes`      | Componentes Angular anotados                                         | #57 | v1.0.0  | ✅     |
| PP04 — Rastreabilidade dos padrões (doc atualizado)| #24   | `docs/padroes-de-projeto`       | `docs/GCS/rastreabilidade.md`, `docs/padroes-de-projeto.md`          | #58 | v1.0.0  | ✅     |

---

### LFA — Linguagens Formais e Autômatos

| Requisito                                      | Issue | Branch                  | Arquivo(s) principal(is)                                | PR  | Release | Status |
| ---------------------------------------------- | ----- | ----------------------- | ------------------------------------------------------- | --- | ------- | ------ |
| LFA01 — Implementação REGEX + validadores      | #25   | `refactor/frontend-validators` | `frontend/src/app/shared/utils/validators.ts`      | #60 | v1.0.0  | ✅     |
| LFA02 — Tabela de REGEX e 3 Autômatos Finitos  | #25   | `cb/create-lfac-docs`   | `docs/LFAC.md`                                          | #64 | v1.0.0  | ✅     |
| LFA03 — GLC, analisador léxico/sintático e consulta avançada | #25 | `cb/create-lfac-docs` | `docs/LFAC.md`                              | #64 | v1.0.0  | ✅     |

---

### AWS — Arquitetura em Nuvem

| Requisito                          | Issue | Branch                    | Arquivo(s) principal(is)      | PR  | Release | Status |
| ---------------------------------- | ----- | ------------------------- | ----------------------------- | --- | ------- | ------ |
| AWS01 — Arquitetura e diagrama AWS | #28   | `feature/aws-arquitetura` | `docs/AWS/arquitetura-aws.md` | #50 | v1.0.0  | ✅     |
| AWS02 — Estimativa de custos       | #29   | `feature/aws-custos`      | `docs/AWS/arquitetura-aws.md`, `docs/AWS/estimativa-custos-aws.pdf` | #52 | v1.0.0  | ✅     |

---

### Integração e Documentação Final

| Requisito                                | Issue | Branch                          | Arquivo(s) principal(is)                            | PR  | Release | Status |
| ---------------------------------------- | ----- | ------------------------------- | --------------------------------------------------- | --- | ------- | ------ |
| INT01 — Integração Angular ↔ Spring Boot | #30   | `feature/integracao-front-back` | `frontend/src/app/services/`, `backend/src/...`     | #63 | v1.0.0  | ✅     |
| GCS05 — .env.example                     | #1    | `chore/setup-env`               | `.env.example`                                      | #61 | v1.0.0  | ✅     |

---

## Legenda de status

| Ícone | Significado                                                 |
| ----- | ----------------------------------------------------------- |
| ✅    | Entregue — PR mergeado e release publicada                  |
| 🔄    | Em andamento — Issue aberta ou PR em revisão                |
| ❌    | Won't do — Descartado com justificativa registrada na Issue |

---

> ✅ **Matriz completa** — todos os requisitos implementados estão rastreados com Issue, Branch, PR e Release preenchidos. Esta matriz foi finalizada para a tag `v1.0.0` (BL1).

---

## Histórico de revisões

| Versão | Data       | Alteração                                                                                         | Autor     |
| ------ | ---------- | ------------------------------------------------------------------------------------------------- | --------- |
| 1.0    | 03/06/2026 | Criação do esqueleto da matriz                                                                    | Gabriella |
| 1.1    | 06/06/2026 | Atualização do andamento de requisitos                                                            | Gabriella |
| 1.2    | 13/06/2026 | Preenchimento de PRs; adição de RF18, RF20, PP02–PP04                                             | Gabriella |
| 1.3    | 14/06/2026 | Matriz finalizada: PRs e releases preenchidos para todos os requisitos; LFA, INT01 e AWS atualizados | Gabriella |
