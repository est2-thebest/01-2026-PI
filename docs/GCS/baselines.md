# Baselines do Projeto

**Projeto:** SOS Rota — Eng5 2026/1  
**Responsável GCS:** Gabriella Pio  
**Última atualização:** 14/06/2026

---

## O que é uma Baseline?

Uma Baseline é um ponto de referência estável e formal no ciclo de vida do projeto. Ela representa um conjunto de ICs aprovados e congelados em um determinado momento, servindo como base para o controle de mudanças. Qualquer alteração após a definição de uma baseline deve passar pelo processo formal de RFC + Issue + PR.

---

## BL0 — Baseline Inicial

**Tag:** `v0.1.0`  
**Data:** 02/06/2026  
**Status:** ✅ Estabelecida

### Descrição

Estado inicial do repositório do projeto SOS Rota Eng5, contendo a estrutura base do repositório, configurações iniciais e documentação de fundação do GCS. Nenhuma funcionalidade do sistema está implementada neste ponto.

### Composição

| IC   | Nome                      | Versão / Estado                |
| ---- | ------------------------- | ------------------------------ |
| IC28 | Pipeline de CI            | ci.yml criado                  |
| IC29 | Configuração de ambiente  | `.env.example` — criado        |
| IC30 | .gitignore                | Criado                         |
| IC32 | README                    | Criado                         |
| IC33 | CHANGELOG                 | v0.1.0 registrado              |
| IC34 | Catálogo de ICs           | Criado                  |
| IC35 | Baselines (este arquivo)  | Criado                  |
| IC36 | Política de Versionamento | Criado — PR #33 mergeado       |
| IC37 | RFC-001                   | Criado — PR #34 mergeado       |

### Critérios de estabilidade da BL0

- [x] Repositório criado e acessível publicamente no GitHub
- [x] Branch `main` protegida contra push direto
- [x] Branch `develop` criada
- [x] `.gitignore`, `README.md` e `CHANGELOG.md` presentes na `main`
- [x] Pipeline de CI criado (`.github/workflows/ci.yml`)
- [x] Tag `v0.1.0` criada e publicada
- [x] Templates de Issue e PR configurados
- [x] Milestones BL0 e BL1 criadas no GitHub
- [x] Documentação GCS completa commitada (`docs/GCS/`)

> A BL0 foi estabelecida com a tag `v0.1.0`. Os documentos GCS pendentes serão commitados na branch `feature/docs-gcs-fundacao` e mergeados via PR — esse merge não altera a BL0, pois ela já está tagueada.

---

## BL1 — Baseline Funcional

**Tag:** `v1.0.0`  
**Data prevista:** 14/06/2026  
**Status:** ✅ Estabelecida

### Descrição

Primeira versão funcional do sistema SOS Rota, com todas as funcionalidades principais implementadas, integradas e validadas. O sistema deve estar pronto para implantação e apresentação.

### Composição prevista

| IC        | Nome                                            | Critério de inclusão                                                        |
| --------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| IC01      | Aplicação Spring Boot                           | Build Maven passando no CI                                                  |
| IC02      | Controllers REST                                | Todos os endpoints implementados e testados                                 |
| IC03      | Services                                        | Regras de negócio implementadas                                             |
| IC04      | Repositories (JPA)                              | Entidades mapeadas e persistindo no H2                                      |
| IC05      | Entidades / Models                              | Todas as entidades criadas                                                  |
| IC06      | DTOs                                            | Todos os DTOs necessários criados                                           |
| IC07      | Configurações da aplicação                      | application.properties final configurado                                    |
| IC08      | Arquivo de build Maven                          | pom.xml com todas as dependências                                           |
| IC09      | Aplicação Angular                               | Build Angular passando no CI                                                |
| IC10      | Componentes Angular                             | Todas as telas implementadas                                                |
| IC11      | Serviços Angular (HTTP)                         | Integração com backend validada                                             |
| IC12      | Módulos de roteamento                           | Navegação entre telas funcional                                             |
| IC13      | Configuração de build Angular                   | angular.json configurado para produção                                      |
| IC14      | Dependências do projeto                         | package-lock.json atualizado                                                |
| IC15      | Configuração do banco H2                        | H2 configurado e populado                                                   |
| IC17-IC22 | Padrões de Projeto                              | Todos os 6 padrões identificados e comentados                               |
| IC23      | Implementação REGEX                             | Validações implementadas no código                                          |
| IC24      | Tabela REGEX + código documentado               | Tabela com os dados validados e a ER correspondente e expressoes comentadas |
| IC25      | Diagrama dos 3 Automatos finitos                | Fazer em `/docs/LFA/automatos.md` ou imagens na pasta                       |
| IC26      | Gramática Livre de Contexto (Consulta Avançada) | `/docs/LFA/gramatica-consulta.md`                                           |
| IC27      | Simulação do analisador léxico e sintático      | Consulta avançada documentada                                    |
| IC28      | Pipeline de CI                                  | CI passando verde para backend e frontend                                   |
| IC32      | README                                          | Atualizado com instruções finais                                            |
| IC33      | CHANGELOG                                       | v1.0.0 registrado                                                           |
| IC34      | Catálogo de ICs                                 | Todos os campos preenchidos                                                 |
| IC38      | Matriz de Rastreabilidade                       | Completa — todos os requisitos rastreados                                   |
| IC39      | ERS                                             | Atualizado com artefatos do Eng5                                            |
| IC40      | Documento AWS                                   | Arquitetura e custos documentados                                           |
| IC41      | Documento Padrões de Projeto                    | Tabela de padrões completa                                                  |

### Critérios de estabilidade da BL1

- [x] Build do backend passa no CI sem erros (`mvn verify`)
- [x] Build do frontend passa no CI sem erros (`ng build`)
- [x] Todas as telas principais funcionando: Login, Dashboard, Ocorrências, Ambulâncias, Profissionais, Equipes, Despacho, Relatórios
- [x] Integração Angular ↔ Spring Boot validada ponta a ponta
- [x] Todos os 6 padrões de projeto identificados e comentados no código
- [x] REGEX implementadas no código e integradas nos componentes (PR #60 — `refactor/frontend-validators`)
- [x] Matriz de rastreabilidade completa
- [x] CHANGELOG atualizado com v1.0.0
- [x] Todas as Issues do milestone BL1 fechadas ou justificadas como "won't do"
- [x] Tag `v1.0.0` criada na `main` após merge do último PR

---

## Histórico de revisões

| Versão | Data       | Alteração                                                                              | Autor     |
| ------ | ---------- | -------------------------------------------------------------------------------------- | --------- |
| 1.0    | 03/06/2026 | Criação do documento de baselines                                                      | Gabriella |
| 1.1    | 06/06/2026 | Revisado de acordo com os requisitos implementados até o momento                       | Gabriella |
| 1.2    | 13/06/2026 | Corrige IC36/IC37 na BL0; atualiza critérios BL1 (REGEX, tela Profissionais); data revisada | Gabriella |
| 1.3    | 14/06/2026 | BL1 estabelecida: todos os critérios cumpridos, tag v1.0.0 publicada                  | Gabriella |
