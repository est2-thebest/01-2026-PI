# Seção de Engenharia de Requisitos: Validação de Dados via Autômatos Finitos

## 1. Fundamentação Teórica e Escopo

Para garantir a integridade, consistência e segurança dos dados de entrada no sistema, foi implementada uma camada de validação baseada na Teoria de Linguagens Formais e Autômatos. As strings de entrada são tratadas como sentenças de uma linguagem regular, validadas através de **Expressões Regulares (REGEX)**, que mapeiam diretamente para **Autômatos Finitos Determinísticos (AFD)**.

Esta validação garante que dados mal formatados sejam rejeitados na camada de apresentação (Angular Forms) antes de qualquer processamento posterior ou persistência em banco de dados.

## 2. Tabela de Expressões Regulares de Validação

A tabela abaixo consolida todas as expressões regulares utilizadas nos validadores do sistema:

|**Campo**|**Expressão Regular (REGEX)**|**Descrição / Padrão Esperado**|
|---|---|---|
|**Placa Mercosul**|`^[A-Z]{3}[0-9][A-Z][0-9]{2}$`|3 letras, 1 número, 1 letra, 2 números (Ex: AAA1A11)|
|**Placa Antiga (BR)**|`^[A-Z]{3}[0-9]{4}$`|3 letras seguidas de 4 números (Ex: AAA1111)|
|**CPF**|`^\d{3}\.\d{3}\.\d{3}-\d{2}$`|Máscara obrigatória: 000.000.000-00|
|**CNPJ**|`^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$`|Máscara obrigatória: 00.000.000/0001-00|
|**Telefone (Geral)**|`^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$`|Aceita celular com 9 e fixo, com ou sem parênteses/hífen|
|**E-mail**|`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`|Validação padrão de endereço eletrônico|

## 3. Modelagem dos Autômatos Finitos (Graphviz DOT)

Abaixo estão as especificações formais em formato `digraph` (Graphviz) para os 3 autômatos escolhidos para a documentação, espelhando fielmente o comportamento lógico do código Typescript.

### AF1 — Validador de Placas (Unificado: Mercosul e Antiga)

Este autômato valida a lógica da função `placaValidator()`, aceitando tanto o formato antigo quanto o modelo Mercosul após a normalização da string.

Code snippet

```
digraph PlacaAutomaton {
    rankdir=LR;
    size="12,6"
    node [shape = doublecircle]; Placa_Match;
    node [shape = circle];
    
    Start -> P1 [label="[A-Z]"];
    P1 -> P2 [label="[A-Z]"];
    P2 -> P3 [label="[A-Z]"];
    P3 -> P4 [label="[0-9]"];
    
    // Caminho 1: Placa Antiga (Mais 3 dígitos numéricos)
    P4 -> PA5 [label="[0-9]"];
    PA5 -> PA6 [label="[0-9]"];
    PA6 -> Placa_Match [label="[0-9]"];
    
    // Caminho 2: Placa Mercosul (Letra seguida de 2 dígitos numéricos)
    P4 -> PM5 [label="[A-Z]"];
    PM5 -> PM6 [label="[0-9]"];
    PM6 -> Placa_Match [label="[0-9]"];
}
```

### AF2 — Validador de CPF (Estrito com Máscara)

Este autômato modela rigorosamente a expressão `REGEX.CPF` (`^\d{3}\.\d{3}\.\d{3}-\d{2}$`) exigida pelo validador do sistema.

Code snippet

```
digraph CPFAutomaton {
    rankdir=LR;
    size="12,4"
    node [shape = doublecircle]; CPF_Match;
    node [shape = circle];
    
    Start -> Q1 [label="\\d"];
    Q1 -> Q2 [label="\\d"];
    Q2 -> Q3 [label="\\d"];
    Q3 -> Q4_Dot [label="."];
    
    Q4_Dot -> Q5 [label="\\d"];
    Q5 -> Q6 [label="\\d"];
    Q6 -> Q7 [label="\\d"];
    Q7 -> Q8_Dot [label="."];
    
    Q8_Dot -> Q9 [label="\\d"];
    Q9 -> Q10 [label="\\d"];
    Q10 -> Q11 [label="\\d"];
    Q11 -> Q12_Dash [label="-"];
    
    Q12_Dash -> Q13 [label="\\d"];
    Q13 -> CPF_Match [label="\\d"];
}
```

### AF3 — Validador de Telefone

Este autômato modela a expressão `REGEX.TELEFONE` (`^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$`). Ele lida com os estados opcionais como os parênteses `()`, o espaço em branco `\s`, o dígito `9` do celular e o hífen `-`.

Code snippet

```
digraph TelefoneAutomaton {
    rankdir=LR;
    size="12,8"
    node [shape = doublecircle]; Telefone_Match;
    node [shape = circle];

    // Entrada do DDD (com ou sem parênteses)
    Start -> T_Pref [label="("];
    Start -> T1 [label="\\d"];
    T_Pref -> T1 [label="\\d"];
    T1 -> T2 [label="\\d"];
    T2 -> T_Suf [label=")"];
    
    // Transições pós-DDD (tratando espaço opcional)
    T2 -> T_Esp [label="\\s"];
    T_Suf -> T_Esp [label="\\s"];
    
    // Ligando para o bloco do prefixo numérico
    T2 -> T_Prefixo [label="[0-9]"];
    T_Suf -> T_Prefixo [label="[0-9]"];
    T_Esp -> T_Prefixo [label="[0-9]"];
    
    // O nó T_Prefixo captura o primeiro número do corpo do telefone (pode ser o 9 ou o primeiro de 4 dígitos)
    // Para simplificar o AFD do Regex híbrido, computamos a sequência de dígitos restantes
    T_Prefixo -> D2 [label="\\d"];
    D2 -> D3 [label="\\d"];
    D3 -> D4 [label="\\d"];
    
    // Cenário A: Era um número de 4 dígitos no bloco inicial (Fixo ou Celular antigo)
    D4 -> T_Hifen [label="-"];
    D4 -> S1 [label="\\d"]; // Se não tem hífen, vai direto pro próximo dígito
    
    // Cenário B: Era um número de 5 dígitos no bloco inicial (Celular moderno com 9)
    D4 -> D5 [label="\\d"];
    D5 -> T_Hifen [label="-"];
    D5 -> S1_Cel [label="\\d"];

    // Fluxo de Sufixo Pós-Hífen (4 dígitos finais)
    T_Hifen -> S1 [label="\\d"];
    S1 -> S2 [label="\\d"];
    S2 -> S3 [label="\\d"];
    S3 -> Telefone_Match [label="\\d"];
    
    // Fluxo de Sufixo Pós-Hífen para celular de 5 dígitos iniciais
    S1_Cel -> S2_Cel [label="\\d"];
    S2_Cel -> S3_Cel [label="\\d"];
    S3_Cel -> Telefone_Match [label="\\d"];
}
```

# Módulo de Consulta Avançada

**Objetivo:** Processamento de comandos e filtros personalizados para requisição de relatórios pelo usuário administrador.
**Exemplo de Comando Suportado:** `parametro.tipo = "xxx" AND parametro.setor = "yyy"`

---

## 1. Simulação do Analisador Léxico (Definição dos Tokens)

Antes da análise sintática, o analisador léxico processa a string de entrada e a converte em uma sequência de símbolos terminais (tokens). Os tokens mapeados para este sistema são:

* **id:** Representa os campos do sistema (ex: `parametro.tipo`, `parametro.setor`).
* **op:** Operadores relacionais (ex: `=`, `!=`, `>`, `<`).
* **val:** Valores de comparação (ex: `"xxx"`, `"yyy"`, `123`).
* **and / or:** Operadores lógicos.
* **( / ):** Parênteses para precedência.

**Exemplo de Simulação Léxica:**
A string original `parametro.tipo = "xxx" AND parametro.setor = "yyy"` é lida e convertida na seguinte fita de tokens para o analisador sintático:
`[id] [op] [val] [and] [id] [op] [val] [$]` *(O símbolo `$` representa o fim da cadeia).*

---

## 2. Gramática Livre de Contexto (GLC)

Para a implementação, a gramática foi fatorada e teve sua recursão à esquerda removida, garantindo compatibilidade com analisadores descendentes preditivos.

**Símbolos Não-Terminais:** $E$ (Expressão), $E'$ (Extensão de Expressão), $T$ (Termo), $T'$ (Extensão de Termo), $F$ (Fator).
**Símbolos Terminais:** $id$, $op$, $val$, $and$, $or$, $($, $)$

**Regras de Produção:**

$$E \to T \ E'$$

$$E' \to or \ T \ E' \mid \epsilon$$

$$T \to F \ T'$$

$$T' \to and \ F \ T' \mid \epsilon$$

$$F \to id \ op \ val \mid ( \ E \ )$$

*(Nota: O símbolo $\epsilon$ representa a palavra vazia ou transição nula).*

---

## 3. Técnica Escolhida: Análise Sintática LL(1)

**Técnica Escolhida:** Análise Sintática Descendente Preditiva Tabular (Top-Down LL(1)).

**Justificativa:** Esta técnica foi escolhida por permitir a construção de um analisador linear de complexidade $O(n)$ altamente eficiente. Utilizando uma pilha explícita e uma tabela de parsing preditiva, elimina-se a necessidade de retrocesso (*backtracking*), garantindo a validação rápida dos comandos inseridos pelo administrador.

### 3.1. Conjuntos FIRST e FOLLOW (Base para a Tabela)

O cálculo dos conjuntos define as regras de preenchimento da tabela sintática:

* **FIRST(E)** = { $id$, $($ } | **FOLLOW(E)** = { $\$$, $)$ }
* **FIRST(E')** = { $or$, $\epsilon$ } | **FOLLOW(E')** = { $\$$, $)$ }
* **FIRST(T)** = { $id$, $($ } | **FOLLOW(T)** = { $or$, $\$$, $)$ }
* **FIRST(T')** = { $and$, $\epsilon$ } | **FOLLOW(T')** = { $or$, $\$$, $)$ }
* **FIRST(F)** = { $id$, $($ } | **FOLLOW(F)** = { $and$, $or$, $\$$, $)$ }

### 3.2. Tabela de Parsing

*(Nota para o Google Docs: Ao colar, o Google Docs converterá automaticamente esta estrutura em uma tabela editável. Células vazias representam erros sintáticos, ou seja, se a entrada cair em uma célula vazia, o sistema acusa erro na consulta do administrador).*

| Não-Terminal | id | op | val | and | or | ( | ) | $ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **E** | $E \to T \ E'$ |  |  |  |  | $E \to T \ E'$ |  |  |
| **E'** |  |  |  |  | $E' \to or \ T \ E'$ |  | $E' \to \epsilon$ | $E' \to \epsilon$ |
| **T** | $T \to F \ T'$ |  |  |  |  | $T \to F \ T'$ |  |  |
| **T'** |  |  |  | $T' \to and \ F \ T'$ | $T' \to \epsilon$ |  | $T' \to \epsilon$ | $T' \to \epsilon$ |
| **F** | $F \to id \ op \ val$ |  |  |  |  | $F \to ( \ E \ )$ |  |  |

---

## 4. Simulação de Execução (Opcional)

Abaixo, a simulação do reconhecimento da cadeia do exemplo `id op val and id op val $`, demonstrando a validação bem-sucedida pelo sistema.

| Pilha (Topo à esquerda) | Entrada (Início à esquerda) | Ação (Regra Aplicada) |
| --- | --- | --- |
| $E \ \$$ | `id op val and id op val $` | Troca $E$ por $T \ E'$ |
| $T \ E' \ \$$ | `id op val and id op val $` | Troca $T$ por $F \ T'$ |
| $F \ T' \ E' \ \$$ | `id op val and id op val $` | Troca $F$ por $id \ op \ val$ |
| $id \ op \ val \ T' \ E' \ \$$ | `id op val and id op val $` | Consome `id` |
| $op \ val \ T' \ E' \ \$$ | `op val and id op val $` | Consome `op` |
| $val \ T' \ E' \ \$$ | `val and id op val $` | Consome `val` |
| $T' \ E' \ \$$ | `and id op val $` | Troca $T'$ por $and \ F \ T'$ |
| $and \ F \ T' \ E' \ \$$ | `and id op val $` | Consome `and` |
| $F \ T' \ E' \ \$$ | `id op val $` | Troca $F$ por $id \ op \ val$ |
| $id \ op \ val \ T' \ E' \ \$$ | `id op val $` | Consome `id` |
| $op \ val \ T' \ E' \ \$$ | `op val $` | Consome `op` |
| $val \ T' \ E' \ \$$ | `val $` | Consome `val` |
| $T' \ E' \ \$$ | `$` | Troca $T'$ por $\epsilon$ |
| $E' \ \$$ | `$` | Troca $E'$ por $\epsilon$ |
| $\$$ | `$` | **Cadeia Aceita (Sucesso)** |