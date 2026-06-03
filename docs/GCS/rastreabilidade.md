# Matriz de Rastreabilidade

**Projeto:** SOS Rota — Eng5 2026/1  
**Responsável GCS:** Gabriella Pio  
**Última atualização:** 03/06/2026

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

| Requisito                                                | Issue | Branch                         | Arquivo(s) principal(is)                                      | PR  | Release | Status |
| -------------------------------------------------------- | ----- | ------------------------------ | ------------------------------------------------------------- | --- | ------- | ------ |
| GCS01 — Templates de Issue e PR                          | #1    | `feature/templates-github`     | `.github/ISSUE_TEMPLATE/`, `.github/pull_request_template.md` | —   | v0.1.0  | ✅     |
| GCS02 — Documentação GCS (ICs, Baselines, Versionamento) | #7    | `feature/docs-gcs-fundacao`    | `docs/GCS/`                                                   | —   | v0.1.0  | 🔄     |
| GCS03 — RFC-001                                          | #8    | `feature/docs-rfc-001`         | `docs/GCS/rfc-001.md`                                         | —   | v0.1.0  | 🔄     |
| GCS04 — Pipeline de CI                                   | —     | —                              | `.github/workflows/ci.yml`                                    | —   | v0.1.0  | ✅     |
| GCS05 — Matriz de Rastreabilidade                        | #31   | `feature/docs-rastreabilidade` | `docs/GCS/rastreabilidade.md`                                 | —   | v1.0.0  | 🔄     |

---

### Backend — Spring Boot

| Requisito                            | Issue | Branch                          | Arquivo(s) principal(is)                                     | PR  | Release | Status |
| ------------------------------------ | ----- | ------------------------------- | ------------------------------------------------------------ | --- | ------- | ------ |
| RF01 — Configuração Spring Boot + H2 | #4    | `feature/backend-setup`         | `pom.xml`, `application.properties`                          | —   | —       | 🔄     |
| RF02 — Autenticação JWT              | #20   | `feature/backend-auth`          | `AuthController.java`, `AuthService.java`, `JwtService.java` | —   | —       | 🔄     |
| RF03 — CRUD de Ocorrências           | #5    | `feature/backend-ocorrencias`   | `OcorrenciaController.java`, `OcorrenciaService.java`        | —   | —       | 🔄     |
| RF04 — CRUD de Ambulâncias           | #9    | `feature/backend-ambulancias`   | `AmbulanciaController.java`, `AmbulanciaService.java`        | —   | —       | 🔄     |
| RF05 — CRUD de Equipes               | #10   | `feature/backend-equipes`       | `EquipeController.java`, `EquipeService.java`                | —   | —       | 🔄     |
| RF06 — CRUD de Bairros               | #21   | `feature/backend-bairros`       | `BairroController.java`, `BairroService.java`                | —   | —       | 🔄     |
| RF07 — CRUD de Profissionais         | #22   | `feature/backend-profissionais` | `ProfissionalController.java`, `ProfissionalService.java`    | —   | —       | 🔄     |
| RF08 — Despacho e roteamento         | #11   | `feature/backend-despacho`      | `DespachoController.java`, `DijkstraService.java`            | —   | —       | 🔄     |
| RF09 — Endpoint de Dashboard         | #23   | `feature/backend-dashboard`     | `DashboardController.java`, `DashboardService.java`          | —   | —       | 🔄     |
| RF10 — Endpoint de Relatórios        | #12   | `feature/backend-relatorios`    | `RelatorioController.java`, `RelatorioService.java`          | —   | —       | 🔄     |

---

### Frontend — Angular

| Requisito                  | Issue | Branch                         | Arquivo(s) principal(is)                         | PR  | Release | Status |
| -------------------------- | ----- | ------------------------------ | ------------------------------------------------ | --- | ------- | ------ |
| RF11 — Setup Angular       | #6    | `feature/frontend-setup`       | `angular.json`, `app.module.ts`, `app.routes.ts` | —   | —       | 🔄     |
| RF12 — Tela de Login       | #13   | `feature/frontend-login`       | `login.component.ts`, `auth.service.ts`          | —   | —       | 🔄     |
| RF13 — Dashboard           | #14   | `feature/frontend-dashboard`   | `dashboard.component.ts`                         | —   | —       | 🔄     |
| RF14 — Tela de Ocorrências | #15   | `feature/frontend-ocorrencias` | `ocorrencias.component.ts`                       | —   | —       | 🔄     |
| RF15 — Tela de Ambulâncias | #16   | `feature/frontend-ambulancias` | `ambulancias.component.ts`                       | —   | —       | 🔄     |
| RF16 — Tela de Equipes     | #17   | `feature/frontend-equipes`     | `equipes.component.ts`                           | —   | —       | 🔄     |
| RF17 — Tela de Despacho    | #18   | `feature/frontend-despacho`    | `despacho.component.ts`                          | —   | —       | 🔄     |
| RF19 — Tela de Relatórios  | #19   | `feature/frontend-relatorios`  | `relatorios.component.ts`                        | —   | —       | 🔄     |

---

### Padrões de Projeto

| Requisito                                     | Issue | Branch                       | Arquivo(s) principal(is)     | PR  | Release | Status |
| --------------------------------------------- | ----- | ---------------------------- | ---------------------------- | --- | ------- | ------ |
| PP01 — Mapeamento e comentários dos 6 padrões | #24   | `feature/padroes-de-projeto` | `docs/padroes-de-projeto.md` | —   | —       | 🔄     |

---

### LFA — Linguagens Formais e Autômatos

| Requisito                                 | Issue | Branch                  | Arquivo(s) principal(is)         | PR  | Release | Status |
| ----------------------------------------- | ----- | ----------------------- | -------------------------------- | --- | ------- | ------ |
| LFA01 — Implementação REGEX + tabela      | #25   | `feature/lfa-regex`     | `docs/LFA/regex-e-automatos.md`  | —   | —       | 🔄     |
| LFA02 — Diagramas dos 3 Autômatos Finitos | #26   | `feature/lfa-automatos` | `docs/LFA/automatos.md`          | —   | —       | 🔄     |
| LFA03 — GLC e analisador léxico/sintático | #27   | `feature/lfa-gramatica` | `docs/LFA/gramatica-consulta.md` | —   | —       | 🔄     |

---

### AWS — Arquitetura em Nuvem

| Requisito                          | Issue | Branch                    | Arquivo(s) principal(is)      | PR  | Release | Status |
| ---------------------------------- | ----- | ------------------------- | ----------------------------- | --- | ------- | ------ |
| AWS01 — Arquitetura e diagrama AWS | #28   | `feature/aws-arquitetura` | `docs/AWS/arquitetura-aws.md` | —   | —       | 🔄     |
| AWS02 — Estimativa de custos       | #29   | `feature/aws-custos`      | `docs/AWS/arquitetura-aws.md` | —   | —       | 🔄     |

---

### Integração e Documentação Final

| Requisito                                | Issue | Branch                          | Arquivo(s) principal(is) | PR  | Release | Status |
| ---------------------------------------- | ----- | ------------------------------- | ------------------------ | --- | ------- | ------ |
| INT01 — Integração Angular ↔ Spring Boot | #30   | `feature/integracao-front-back` | —                        | —   | v1.0.0  | 🔄     |
| DOC01 — Atualização do ERS               | #32   | `feature/docs-ers`              | `docs/ERS.md`            | —   | v1.0.0  | 🔄     |

---

## Legenda de status

| Ícone | Significado                                                 |
| ----- | ----------------------------------------------------------- |
| ✅    | Entregue — PR mergeado e release publicada                  |
| 🔄    | Em andamento — Issue aberta ou PR em revisão                |
| ❌    | Won't do — Descartado com justificativa registrada na Issue |

---

> ⚠️ **Instruções de atualização:** preencher as colunas PR e Release conforme os PRs forem mergeados e as tags publicadas. Atualizar o status de 🔄 para ✅ após cada merge na `main`. Esta matriz deve estar 100% preenchida antes da criação da tag `v1.0.0`.

---

## Histórico de revisões

| Versão | Data       | Alteração                      | Autor     |
| ------ | ---------- | ------------------------------ | --------- |
| 1.0    | 03/06/2026 | Criação do esqueleto da matriz | Gabriella |
