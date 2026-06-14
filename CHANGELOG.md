# Changelog

Todas as mudanças relevantes do projeto serão documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [v1.0.0] — 2026-06-14 — BL1: Sistema Funcional Completo

### Backend

- Configuração do projeto Spring Boot com banco H2 em memória (#4)
- Autenticação e autorização com JWT (#20)
- CRUD de Ocorrências (#5)
- CRUD de Ambulâncias (#9)
- CRUD de Equipes (#10)
- CRUD de Bairros (#21)
- CRUD de Profissionais (#22)
- Despacho e roteamento de ambulâncias com algoritmo de Dijkstra (#11)
- Endpoint de Dashboard com métricas em tempo real (#23)
- Endpoint de Relatórios (#12)

### Frontend

- Setup do projeto Angular com roteamento (#6)
- Tela de Login com autenticação JWT (#13)
- Dashboard principal com indicadores (#14)
- Tela de Ocorrências (#15)
- Tela de Ambulâncias (#16)
- Tela de Equipes (#17)
- Tela de Despacho (#18)
- Tela de Profissionais (#44)
- Tela de Relatórios (#19)
- Integração de validadores LFA (REGEX) nos componentes (#25)
- Integração completa Angular ↔ Spring Boot (#30)

### Padrões de Projeto

- Identificação e comentários dos 6 padrões no backend: Singleton, Adapter, Iterator, Template Method, Factory Method, Decorator (#24)
- Identificação e comentários dos padrões no frontend Angular (#24)
- Documento de rastreabilidade dos padrões de projeto (#24)

### LFA — Linguagens Formais e Autômatos

- Implementação de 6 expressões regulares de validação no código (`validators.ts`) (#25)
- Documentação com tabela de REGEX, 3 autômatos finitos (Graphviz DOT), GLC e simulação do analisador léxico/sintático LL(1) (#25)

### AWS — Arquitetura em Nuvem

- Documento de arquitetura AWS com diagrama de serviços (#28)
- Estimativa de custos AWS (#29)

### GCS — Gerência de Configuração

- Templates de Issue e PR (#1)
- Documentação GCS: catálogo de ICs, baselines e política de versionamento (#7)
- RFC-001: decisão de uso do banco H2 (#8)
- Matriz de rastreabilidade completa (#31)
- Arquivo `.env.example` com variáveis de ambiente necessárias (#1)

---

## [v0.1.0] — 2026-06-02 — BL0: Estrutura Inicial

### Adicionado

- README.md, CHANGELOG.md e .gitignore iniciais
- Estrutura de pastas repositório (`/docs`, `/frontend`, `/backend`, `/.github/workflows`)
- Pipeline de CI (.github/workflows/ci.yml) para backend (Java 21) e frontend (Node 20)
