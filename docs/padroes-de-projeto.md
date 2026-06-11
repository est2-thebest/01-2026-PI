# Documentação de Padrões de Projeto - SOS Rotas

Este documento apresenta o mapeamento e a justificativa para a aplicação de padrões de projeto (Design Patterns) no backend do sistema **SOS Rotas**, em conformidade com as diretrizes e critérios de avaliação do **Projeto Integrador (PI)**.

A arquitetura do backend do sistema adota injeção de dependência via construtor, banco de dados H2, APIs REST puras e declaração explícita de métodos acessores, modificadores e construtores (sem o uso de Lombok).

## Padrões de Projeto Implementados

A tabela a seguir apresenta de forma detalhada o mapeamento de cada padrão de projeto identificado no sistema, incluindo o arquivo correspondente, as linhas onde se encontram os comentários Javadoc comprobatórios e a justificativa arquitetural de sua aplicação.

| Padrão de Projeto | Arquivo / Classe Alvo | Linha Aproximada | Propósito no Sistema (Motivação) |
| :--- | :--- | :--- | :--- |
| **Singleton** | [BairroService.java](file:///home/luizgustavo/Área de trabalho/01-2026-PI/backend/src/main/java/com/vitalistech/sosrotas/service/BairroService.java) | 11-15 | O Spring gerencia o `@Service` como uma única instância (Singleton) em memória para centralizar o acesso à malha urbana (bairros 1 a 20), garantindo consistência total e evitando alocações redundantes. |
| **Adapter** | [PathResultDTO.java](file:///home/luizgustavo/Área de trabalho/01-2026-PI/backend/src/main/java/com/vitalistech/sosrotas/dto/PathResultDTO.java) | 5-9 | Atua convertendo as entidades internas e nós do backend em um payload higienizado e estruturado que o componente JavaScript de mapas do Frontend consiga renderizar. |
| **Iterator** | [DespachoService.java](file:///home/luizgustavo/Área de trabalho/01-2026-PI/backend/src/main/java/com/vitalistech/sosrotas/service/DespachoService.java) | 14-17 | O uso de Java Streams encapsula o Iterator nativamente para varrer a frota de ambulâncias sem expor diretamente a estrutura ou coleção interna da lista. |
| **Template Method** | [DespachoBase.java](file:///home/luizgustavo/Área de trabalho/01-2026-PI/backend/src/main/java/com/vitalistech/sosrotas/service/DespachoBase.java) | 6-10 | Define o esqueleto invariante do despacho (buscar viatura, calcular rota, validar SLA, gravar registro), delegando às subclasses por gravidade (Alta, Média, Baixa) apenas a variação da regra de validação do SLA. |
| **Factory Method** | [RelatorioFactory.java](file:///home/luizgustavo/Área de trabalho/01-2026-PI/backend/src/main/java/com/vitalistech/sosrotas/service/RelatorioFactory.java) | 3-7 | Provê o método abstrato `criarRelatorio()`, permitindo que as subclasses de relatórios concretos (como PDF, CSV) decidam qual tipo de documento instanciar, desacoplando o controlador das implementações físicas. |
| **Decorator** | [ValidacaoDespachoDecorator.java](file:///home/luizgustavo/Área de trabalho/01-2026-PI/backend/src/main/java/com/vitalistech/sosrotas/service/ValidacaoDespachoDecorator.java) | 5-9 | Adiciona responsabilidades e checagens de validações de regras de negócio extras (ex: equipe completa, travas de segurança) dinamicamente ao fluxo básico de despacho de viaturas sem alterar ou inflar a service base com condicionais aninhados. |
