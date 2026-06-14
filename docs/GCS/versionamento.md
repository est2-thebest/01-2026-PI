# Política de Versionamento

**Projeto:** SOS Rota — Eng5 2026/1  
**Responsável GCS:** Gabriella Pio  
**Última atualização:** 14/06/2026

---

## Padrão adotado: Semantic Versioning (SemVer)

O projeto adota o padrão **MAJOR.MINOR.PATCH** conforme especificado em [semver.org](https://semver.org/lang/pt-BR/).

| Parte | Quando incrementar                                                           | Exemplo         |
| ----- | ---------------------------------------------------------------------------- | --------------- |
| MAJOR | Mudança que quebra compatibilidade ou refatoração arquitetural significativa | `1.0.0 → 2.0.0` |
| MINOR | Nova funcionalidade adicionada de forma retrocompatível                      | `1.0.0 → 1.1.0` |
| PATCH | Correção de bug ou ajuste sem nova funcionalidade                            | `1.0.0 → 1.0.1` |

### Releases do SOS Rota

O projeto adota apenas duas releases formais, correspondentes às duas baselines definidas:

| Situação                                               | Versão    |
| ------------------------------------------------------ | --------- |
| Estrutura inicial do repositório (BL0)                 | `v0.1.0`  |
| Sistema funcional completo para apresentação (BL1)     | `v1.0.0`  |

> O projeto não possui releases intermediárias (MINOR ou PATCH) por ser um projeto acadêmico de escopo fechado e prazo curto. Correções e ajustes foram feitos diretamente nas feature branches antes do merge, sem necessidade de tags de patch.

---

## Regras do grupo

### Quem cria as tags

A responsabilidade de criar e publicar tags é da **Gabriella (GCS)**, após validação de que os critérios de estabilidade da baseline correspondente foram atingidos.

### Quando criar uma tag

1. Todos os critérios de estabilidade da baseline estão cumpridos
2. O `CHANGELOG.md` foi atualizado com a nova versão
3. O commit de atualização do CHANGELOG foi mergeado na `main`
4. O CI está passando verde na `main`

### Como criar uma tag

Sempre usar **tag anotada** com mensagem descritiva:

```bash
# Atualizar CHANGELOG e commitar na main
git add CHANGELOG.md
git commit -m "chore: atualiza CHANGELOG para vX.Y.Z"
git push origin main

# Criar tag anotada
git tag -a vX.Y.Z -m "Descrição da baseline ou release"
git push origin vX.Y.Z
```

### Onde criar

Tags são criadas **exclusivamente na branch `main`**, após merge do último PR da release.  
Nunca tagar em `develop` ou feature branches.

---

## Padrão de mensagens de commit

O projeto adota o padrão **Conventional Commits**.  
Formato: `tipo: descrição curta no imperativo (#numero-da-issue)`

| Tipo       | Quando usar                                            | Exemplo                                                     |
| ---------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| `feat`     | Nova funcionalidade                                    | `feat: CRUD de ocorrências (#6)`                            |
| `fix`      | Correção de bug                                        | `fix: erro no endpoint de despacho (#9)`                    |
| `docs`     | Criação ou atualização de documentação                 | `docs: adiciona política de versionamento (#2)`             |
| `chore`    | Configuração, infraestrutura, sem impacto funcional    | `chore: configura .gitignore e README (#1)`                 |
| `ci`       | Alterações no pipeline de CI                           | `ci: adiciona pipeline GitHub Actions (#1)`                 |
| `refactor` | Refatoração sem nova funcionalidade ou correção de bug | `refactor: extrai lógica de despacho para service (#9)`     |
| `test`     | Adição ou correção de testes                           | `test: adiciona testes unitários no OcorrenciaService (#6)` |

### Regras

- Descrição sempre em **letras minúsculas**
- Descrição no **imperativo** ("adiciona", "corrige", "cria" — não "adicionado" ou "adicionando")
- Sempre referenciar a **Issue** correspondente ao final (`(#numero)`)

---

## Histórico de releases

| Versão   | Data                        | Baseline | Descrição                                      | Status       |
| -------- | --------------------------- | -------- | ---------------------------------------------- | ------------ |
| `v0.1.0` | 02/06/2026 | BL0      | Estrutura inicial do repositório e pipeline CI | ✅ Publicada |
| `v1.0.0` | 14/06/2026 | BL1      | Sistema funcional completo                     | ✅ Publicada |

---

## Histórico de revisões do documento

| Versão | Data       | Alteração                                                                   | Autor     |
| ------ | ---------- | --------------------------------------------------------------------------- | --------- |
| 1.0    | 03/06/2026 | Criação do documento                                                        | Gabriella |
| 1.1    | 13/06/2026 | Substitui exemplos hipotéticos por releases reais; corrige data da v1.0.0  | Gabriella |
| 1.2    | 14/06/2026 | Marca v1.0.0 como publicada após criação da tag BL1                         | Gabriella |
