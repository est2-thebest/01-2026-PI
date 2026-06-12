# Padrões de Projeto — SOS Rota

**Projeto:** SOS Rota — Eng5 2026/1  
**Responsável GCS:** Gabriella Pio  
**Última atualização:** 12/06/2026

---

Documento de rastreabilidade dos padrões de projeto identificados e aplicados no sistema SOS Rota, conforme exigência da disciplina de Padrões de Projeto (Eng5 — 2026/1).

Cada padrão foi identificado no código-fonte, comentado no arquivo correspondente e mapeado nesta tabela.

---

## Tabela de Rastreabilidade

| #   | Padrão               | Camada   | Arquivo                                                                                | Linha aprox. | Responsável |
| --- | -------------------- | -------- | -------------------------------------------------------------------------------------- | ------------ | ----------- |
| 1   | Singleton            | Frontend | `/frontend/src/app/core/services/auth.service.ts`                                      | 1            | Eduarda     |
| 2   | Adapter              | Frontend | `/frontend/src/app/shared/adapters/date.adapter.ts`                                    | 1            | Eduarda     |
| 2   | Adapter (uso)        | Frontend | `/frontend/src/app/shared/helpers/date.helper.ts`                                      | 1            | Eduarda     |
| 3   | Decorator            | Frontend | `/frontend/src/app/shared/decorators/bairro-cache.service.ts`                          | 1            | Eduarda     |
| 3   | Decorator (uso)      | Frontend | `/frontend/src/app/features/ambulancias/ambulancias.component.ts`                      | 11           | Eduarda     |
| 3   | Decorator (uso)      | Frontend | `/frontend/src/app/features/ocorrencias/ocorrencias.component.ts`                      | 11           | Eduarda     |
| 4   | Iterator             | Backend  | `/backend/src/main/java/com/vitalistech/sosrotas/service/DespachoService.java`         | 9            | Luiz        |
| 5   | Template Method      | Backend  | `/backend/src/main/java/com/vitalistech/sosrotas/service/DespachoBase.java`            | 1            | Luiz        |
| 6   | Factory Method       | Backend  | `/backend/src/main/java/com/vitalistech/sosrotas/geraRelatorios/RelatorioFactory.java` | 1            | Luiz        |
| 6   | Factory Method (CSV) | Backend  | `/backend/src/main/java/com/vitalistech/sosrotas/service/CsvRelatorioService.java`     | 1            | Luiz        |
| 6   | Factory Method (PDF) | Backend  | `/backend/src/main/java/com/vitalistech/sosrotas/service/PdfRelatorioService.java`     | 1            | Luiz        |

---

## Detalhamento por Padrão

### 1. Singleton

**Arquivo:** `/frontend/src/app/core/services/auth.service.ts`

**Definição:** Garante que uma classe tenha apenas uma instância durante todo o ciclo de vida da aplicação e fornece um ponto global de acesso a ela.

**Implementação:** A anotação `providedIn: 'root'` instrui o injetor de dependências do Angular a criar uma única instância do `AuthService` e reutilizá-la em todos os componentes que a injetam. O atributo estático `_instanciasCriadas` demonstra que o construtor é invocado uma única vez, independentemente de quantos componentes injetam o serviço.

**Justificativa:** O `AuthService` mantém o estado da sessão do usuário via `BehaviorSubject` e armazena o token JWT no `localStorage`. Múltiplas instâncias causariam estados de autenticação inconsistentes entre componentes (um componente poderia enxergar o usuário como autenticado enquanto outro o veria como não autenticado).

**Analogia com o backend:** No Spring Boot, todo bean anotado com `@Service` é singleton por padrão no escopo do `ApplicationContext` — o mesmo princípio aplicado no Angular com `providedIn: 'root'`.

---

### 2. Adapter

**Arquivo principal:** `/frontend/src/app/shared/adapters/date.adapter.ts`
**Arquivo de uso:** `/frontend/src/app/shared/helpers/date.helper.ts`

**Definição:** Converte a interface de uma classe em outra interface que os clientes esperam. Permite que classes com interfaces incompatíveis trabalhem juntas sem modificar nenhuma delas.

**Problema resolvido:** O backend Spring Boot serializa `LocalDateTime` em dois formatos distintos dependendo da configuração do Jackson:

- **Formato A — Array:** `[2025, 6, 3, 14, 30, 0]` (padrão Jackson com `write-dates-as-timestamps=true`)
- **Formato B — String ISO 8601:** `"2025-06-03T14:30:00"` (com `write-dates-as-timestamps=false`)

**Implementação:**

| Elemento             | Papel                                                                  |
| -------------------- | ---------------------------------------------------------------------- |
| `IDateAdapter`       | Interface comum — define o contrato `toDate()` e `formatar()`          |
| `ArrayDateAdapter`   | Adapter concreto para o formato array do Jackson                       |
| `IsoDateAdapter`     | Adapter concreto para o formato string ISO 8601                        |
| `DateAdapterFactory` | Factory que detecta o formato em runtime e instancia o adapter correto |

**Justificativa:** Sem o padrão, cada componente precisaria repetir a lógica `if (Array.isArray(data)) { ... } else { new Date(data) }`. Com o Adapter, os componentes chamam apenas `formatarData(data)` sem saber qual formato chegou do backend.

**Analogia com o backend:** O backend usa Factory Method com `RelatorioFactory` para criar CSV ou PDF pela mesma interface (`criarRelatorio()`). O `DateAdapterFactory` aplica o mesmo princípio: cria `ArrayDateAdapter` ou `IsoDateAdapter` pela mesma interface `IDateAdapter`.

---

### 3. Decorator

**Arquivo:** `/frontend/src/app/shared/decorators/bairro-cache.service.ts`
**Componentes que o utilizam:** `ambulancias.component.ts`, `ocorrencias.component.ts`

**Definição:** Adiciona responsabilidades a um objeto dinamicamente, sem modificar sua classe original. É uma alternativa flexível à herança: em vez de estender, envolve (_wraps_) o componente.

**Problema resolvido:** `BairroService.listar()` realiza uma requisição HTTP a cada chamada. Como os bairros são dados estáticos (carregados de CSV no backend), essa requisição se repete desnecessariamente a cada abertura de modal de ambulância ou de ocorrência.

**Implementação:**

```
BairroServiceComCache          <- Decorator
  ├── injeta → BairroService   <- Componente original (não modificado)
  ├── + cache: Bairro[]        <- responsabilidade adicionada
  ├── + ultimaAtualizacao      <- responsabilidade adicionada
  └── listar()                 <- mesma interface; comportamento estendido
```

**Fluxo do `listar()`:**

- 1ª chamada → cache vazio/expirado → delega ao `BairroService` → salva resultado no cache
- 2ª a Nth chamada (< 5 min) → retorna `of(cache)` sem HTTP
- Após 5 minutos → cache expirado → delega novamente ao `BairroService`

**Justificativa:** Os componentes substituem `BairroService` por `BairroServiceComCache` no construtor sem alterar nenhuma outra linha de código. O cache é completamente transparente para quem usa a interface.

**Analogia com o backend:** O backend usa Template Method em `DespachoBase` para definir um fluxo fixo com passo variável (`validarSla`). O Decorator segue lógica semelhante: fluxo fixo (verificar cache → delegar se necessário → armazenar resultado), com o passo variável delegado ao componente original.

---

### 4. Iterator

**Arquivo:** `/backend/src/main/java/com/vitalistech/sosrotas/service/DespachoService.java`

**Definição:** Fornece uma maneira de acessar sequencialmente os elementos de um objeto agregado sem expor sua representação subjacente.

**Implementação:** Aplicado via Java Streams API (`.stream().filter().collect()`). O método `filtrarAmbulanciasDisponiveis` percorre a coleção de ambulâncias de forma sequencial e transparente para aplicar o filtro de status `DISPONIVEL`.

```java
return frota.stream()
    .filter(amb -> StatusAmbulancia.DISPONIVEL.equals(amb.getStatus()))
    .collect(Collectors.toList());
```

**Justificativa:** A API de Streams do Java é uma implementação do padrão Iterator: encapsula a lógica de percurso da coleção, permitindo que o código de negócio (a regra de filtragem por status) seja declarado sem se preocupar com a estrutura interna da lista ou o mecanismo de iteração.

---

### 5. Template Method

**Arquivo:** `/backend/src/main/java/com/vitalistech/sosrotas/service/DespachoBase.java`

**Definição:** Define o esqueleto de um algoritmo em uma classe base, delegando a implementação de alguns passos às subclasses. As subclasses podem redefinir certos passos do algoritmo sem alterar sua estrutura geral.

**Implementação:** `DespachoBase` fixa a ordem de execução do fluxo de despacho emergencial no método `executarDespacho`:

```
executarDespacho()        <- método template (final — não pode ser sobrescrito)
  ├── buscarViatura()     <- passo fixo (privado)
  ├── calcularRota()      <- passo fixo (privado)
  ├── validarSla()        <- passo variável (abstract — subclasses implementam)
  └── gravarRegistro()    <- passo fixo (privado)
```

**Justificativa:** Fixa a sequência obrigatória do despacho emergencial, garantindo que `buscarViatura`, `calcularRota` e `gravarRegistro` sempre ocorram na ordem correta. Apenas a regra de SLA por gravidade — que varia entre tipos de ocorrência — é delegada às subclasses via `validarSla`.

---

### 6. Factory Method

**Arquivos:**

- `/backend/src/main/java/com/vitalistech/sosrotas/geraRelatorios/RelatorioFactory.java` (interface)
- `/backend/src/main/java/com/vitalistech/sosrotas/service/CsvRelatorioService.java` (implementação CSV)
- `/backend/src/main/java/com/vitalistech/sosrotas/service/PdfRelatorioService.java` (implementação PDF)
- `/backend/src/main/java/com/vitalistech/sosrotas/controller/RelatorioController.java` (consumidor)

**Definição:** Define uma interface para criar um objeto, mas deixa as subclasses decidirem qual classe instanciar. O Factory Method permite que uma classe adie a instanciação para as subclasses.

**Implementação:**

| Elemento              | Papel                                                                  |
| --------------------- | ---------------------------------------------------------------------- |
| `RelatorioFactory`    | Produto abstrato — define `criarRelatorio(): byte[]`                   |
| `CsvRelatorioService` | Produto concreto — gera relatório em formato CSV                       |
| `PdfRelatorioService` | Produto concreto — gera relatório em formato PDF                       |
| `RelatorioController` | Consumidor — chama `criarRelatorio()` sem depender do formato concreto |

**Justificativa:** O `RelatorioController` permanece desacoplado das particularidades de formatação de cada tipo de relatório. Para adicionar um novo formato (ex: XLSX), basta criar uma nova implementação de `RelatorioFactory` sem modificar o controlador.

---

## Histórico de revisões

| Versão | Data       | Alteração                                                                                                                 | Autor     |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1.0    | 11/06/2026 | Criação do documento com mapeamento dos padrões do backend                                                                | Luiz      |
| 1.1    | 12/06/2026 | Reestruturação do documento: inclusão dos padrões do frontend (Singleton, Adapter, Decorator) e padronização do documento | Gabriella |
