# Catálogo de Itens de Configuração (ICs)

**Projeto:** SOS Rota — Eng5 2026/1  
**Responsável GCS:** Gabriella Pio  
**Última atualização:** 03/06/2026

---

## O que é um Item de Configuração?

Um Item de Configuração (IC) é qualquer elemento do projeto que precisa ser identificado,
controlado e rastreado ao longo do desenvolvimento. Mudanças em ICs devem passar pelo
processo formal de controle de mudanças (RFC + Issue + PR).

---

## Catálogo

### 1. Código-fonte — Backend

| ID   | Nome                         | Tipo         | Localização no Repositório                           | Responsável |
| ---- | ---------------------------- | ------------ | ---------------------------------------------------- | ----------- |
| IC01 | Aplicação Spring Boot        | Código-fonte | `/backend/`                                          | Luiz        |
| IC02 | Controllers REST             | Código-fonte | `/backend/src/.../controller/`                       | Luiz        |
| IC03 | Services (regras de negócio) | Código-fonte | `/backend/src/.../service/`                          | Luiz        |
| IC04 | Repositories (JPA)           | Código-fonte | `/backend/src/.../repository/`                       | Luiz        |
| IC05 | Entidades / Models           | Código-fonte | `/backend/src/.../model/`                            | Luiz        |
| IC06 | DTOs (Data Transfer Objects) | Código-fonte | `/backend/src/.../dto/`                              | Luiz        |
| IC07 | Configurações da aplicação   | Configuração | `/backend/src/main/resources/application.properties` | Luiz        |
| IC08 | Arquivo de build Maven       | Configuração | `/backend/pom.xml`                                   | Luiz        |

> ⚠️ Os caminhos com `...` serão atualizados assim que o Luiz definir o pacote base (ex: `com.vitalistech.sosrota`).

---

### 2. Código-fonte — Frontend

| ID   | Nome                    | Tipo         | Localização no Repositório                     | Responsável |
| ---- | ----------------------- | ------------ | ---------------------------------------------- | ----------- |
| IC09 | Aplicação Angular       | Código-fonte | `/frontend/`                                   | Eduarda     |
| IC10 | Componentes Angular     | Código-fonte | `/frontend/src/app/components/`                | Eduarda     |
| IC11 | Serviços Angular (HTTP) | Código-fonte | `/frontend/src/app/services/`                  | Eduarda     |
| IC12 | Módulos de roteamento   | Código-fonte | `/frontend/src/app/app.routes.ts`              | Eduarda     |
| IC13 | Configuração de build   | Configuração | `/frontend/angular.json`                       | Eduarda     |
| IC14 | Dependências do projeto | Configuração | `/frontend/package.json` e `package-lock.json` | Eduarda     |

---

### 3. Banco de Dados

| ID   | Nome                     | Tipo         | Localização no Repositório                            | Responsável |
| ---- | ------------------------ | ------------ | ----------------------------------------------------- | ----------- |
| IC15 | Configuração do banco H2 | Configuração | `/backend/src/main/resources/application.properties`  | Luiz        |
| IC16 | Scripts de inicialização | Dados        | `/backend/src/main/resources/data.sql` _(se existir)_ | Luiz        |

> A escolha do H2 em memória como banco de dados do projeto está registrada e justificada na RFC-001.

---

### 4. Padrões de Projeto

Exigência explícita do PI Eng5: identificar e comentar no código onde cada padrão está aplicado (Singleton, Adapter, Iterator, Template Method, Factory Method, Decorator).

| ID   | Nome                   | Tipo         | Localização no Repositório           | Responsável |
| ---- | ---------------------- | ------------ | ------------------------------------ | ----------- |
| IC17 | Padrão Singleton       | Código-fonte | A preencher pelo Luiz até 05/06/2026 | Luiz        |
| IC18 | Padrão Adapter         | Código-fonte | A preencher pelo Luiz até 05/06/2026 | Luiz        |
| IC19 | Padrão Iterator        | Código-fonte | A preencher pelo Luiz até 05/06/2026 | Luiz        |
| IC20 | Padrão Template Method | Código-fonte | A preencher pelo Luiz até 05/06/2026 | Luiz        |
| IC21 | Padrão Factory Method  | Código-fonte | A preencher pelo Luiz até 05/06/2026 | Luiz        |
| IC22 | Padrão Decorator       | Código-fonte | A preencher pelo Luiz até 05/06/2026 | Luiz        |

---

### 5. Linguagens Formais e Autômatos (LFA)

Exigência explícita do PI Eng5: validações REGEX implementadas no código, 3 autômatos finitos, gramática livre de contexto e simulação do analisador léxico/sintático.

| ID   | Nome                                            | Tipo         | Localização no Repositório                   | Responsável |
| ---- | ----------------------------------------------- | ------------ | -------------------------------------------- | ----------- |
| IC23 | Implementação REGEX no código                   | Código-fonte | Backend ou frontend (a definir com Caio)     | Caio        |
| IC24 | Tabela de REGEX + comentários                   | Documento    | `/docs/LFA/regex-e-automatos.md`             | Caio        |
| IC25 | Diagramas dos 3 Autômatos Finitos               | Documento    | `/docs/LFA/automatos.md` ou imagens na pasta | Caio        |
| IC26 | Gramática Livre de Contexto (consulta avançada) | Documento    | `/docs/LFA/gramatica-consulta.md`            | Caio        |
| IC27 | Simulação do analisador léxico e sintático      | Código-fonte | A definir com Caio até 10/06/2026            | Caio        |

---

### 6. Infraestrutura e Pipeline

| ID   | Nome                     | Tipo         | Localização no Repositório                                                    | Responsável |
| ---- | ------------------------ | ------------ | ----------------------------------------------------------------------------- | ----------- |
| IC28 | Pipeline de CI           | Configuração | `.github/workflows/ci.yml`                                                    | Gabriella   |
| IC29 | Configuração de ambiente | Configuração | `.env.example`                                                                | Gabriella   |
| IC30 | .gitignore               | Configuração | `.gitignore`                                                                  | Gabriella   |
| IC31 | docker-compose.yml       | Configuração | `/docker-compose.yml` _(a confirmar com Luiz até 05/06/2026 se será mantido)_ | Luiz        |

---

### 7. Documentação

| ID   | Nome                              | Tipo      | Localização no Repositório           | Responsável |
| ---- | --------------------------------- | --------- | ------------------------------------ | ----------- |
| IC32 | README                            | Documento | `/README.md`                         | Gabriella   |
| IC33 | CHANGELOG                         | Documento | `/CHANGELOG.md`                      | Gabriella   |
| IC34 | Catálogo de ICs (este arquivo)    | Documento | `/docs/GCS/itens-de-configuracao.md` | Gabriella   |
| IC35 | Baselines (BL0 e BL1)             | Documento | `/docs/GCS/baselines.md`             | Gabriella   |
| IC36 | Política de Versionamento         | Documento | `/docs/GCS/versionamento.md`         | Gabriella   |
| IC37 | RFC-001 (Decisão de uso do H2)    | Documento | `/docs/GCS/rfc-001.md`               | Gabriella   |
| IC38 | Matriz de Rastreabilidade         | Documento | `/docs/GCS/rastreabilidade.md`       | Gabriella   |
| IC39 | ERS — Especificação de Requisitos | Documento | `/docs/ERS.md`                       | Eduarda     |
| IC40 | Documento AWS — Arquitetura       | Documento | `/docs/AWS/arquitetura-aws.md`       | Gabriella   |
| IC41 | Documento Padrões de Projeto      | Documento | `/docs/padroes-de-projeto.md`        | Luiz        |

---

## Regras de controle

1. Qualquer alteração em um IC deve ser rastreada por uma **Issue** no GitHub.
2. Alterações em ICs de código devem ocorrer em **feature branches** e entrar via **Pull Request**.
3. Alterações em ICs de configuração crítica (`pom.xml`, `angular.json`, `ci.yml`, `application.properties`) devem ser descritas na RFC correspondente.
4. A cada nova **release/tag**, este catálogo deve ser revisado para refletir novos ICs ou mudanças de localização.
5. ICs marcados como "a preencher" ou "a confirmar" devem ser atualizados até **05/06/2026**.

---

## Histórico de revisões

| Versão | Data       | Alteração                   | Autor     |
| ------ | ---------- | --------------------------- | --------- |
| 1.0    | 03/06/2026 | Criação inicial do catálogo | Gabriella |
