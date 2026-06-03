# Baselines do Projeto

**Projeto:** SOS Rota — Eng5 2026/1  
**Responsável GCS:** Gabriella Pio  
**Última atualização:** 03/06/2026

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
| IC29 | Configuração de ambiente  | `.env.example` — a criar       |
| IC30 | .gitignore                | Criado                         |
| IC32 | README                    | Criado                         |
| IC33 | CHANGELOG                 | v0.1.0 registrado              |
| IC34 | Catálogo de ICs           | v1.3 — criado                  |
| IC35 | Baselines (este arquivo)  | v1.0 — criado                  |
| IC36 | Política de Versionamento | A criar (branch docs/fundacao) |
| IC37 | RFC-001                   | A criar (branch docs/fundacao) |

### Critérios de estabilidade da BL0

- [x] Repositório criado e acessível publicamente no GitHub
- [x] Branch `main` protegida contra push direto
- [x] Branch `develop` criada
- [x] `.gitignore`, `README.md` e `CHANGELOG.md` presentes na `main`
- [x] Pipeline de CI criado (`.github/workflows/ci.yml`)
- [x] Tag `v0.1.0` criada e publicada
- [x] Templates de Issue e PR configurados
- [x] Milestones BL0 e BL1 criadas no GitHub
- [ ] Documentação GCS completa commitada (`docs/GCS/`)

> A BL0 foi estabelecida com a tag `v0.1.0`. Os documentos GCS pendentes serão commitados na branch `feature/docs-gcs-fundacao` e mergeados via PR — esse merge não altera a BL0, pois ela já está tagueada.

---

## BL1 — Baseline Funcional

**Tag:** `v1.0.0`  
**Data prevista:** 12/06/2026  
**Status:** 🔄 Em construção

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
| IC27      | Simulação do analisador léxico e sintático      | Consulta avançada implementada no código                                    |
| IC28      | Pipeline de CI                                  | CI passando verde para backend e frontend                                   |
| IC32      | README                                          | Atualizado com instruções finais                                            |
| IC33      | CHANGELOG                                       | v1.0.0 registrado                                                           |
| IC34      | Catálogo de ICs                                 | Todos os campos preenchidos                                                 |
| IC38      | Matriz de Rastreabilidade                       | Completa — todos os requisitos rastreados                                   |
| IC39      | ERS                                             | Atualizado com artefatos do Eng5                                            |
| IC40      | Documento AWS                                   | Arquitetura e custos documentados                                           |
| IC41      | Documento Padrões de Projeto                    | Tabela de padrões completa                                                  |

### Critérios de estabilidade da BL1

- [ ] Build do backend passa no CI sem erros (`mvn verify`)
- [ ] Build do frontend passa no CI sem erros (`ng build`)
- [ ] Todas as telas principais funcionando: Login, Dashboard, Ocorrências, Ambulâncias, Equipes, Despacho, Relatórios
- [ ] Integração Angular ↔ Spring Boot validada ponta a ponta
- [ ] Todos os 6 padrões de projeto identificados e comentados no código
- [ ] REGEX implementadas no código com tabela e gramática documentada
- [ ] Matriz de rastreabilidade completa
- [ ] CHANGELOG atualizado com v1.0.0
- [ ] Todas as Issues do milestone BL1 fechadas ou justificadas como "won't do"
- [ ] Tag `v1.0.0` criada na `main` após merge do último PR

---

## Histórico de revisões

| Versão | Data       | Alteração                         | Autor     |
| ------ | ---------- | --------------------------------- | --------- |
| 1.0    | 03/06/2026 | Criação do documento de baselines | Gabriella |
