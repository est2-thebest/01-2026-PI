package com.vitalistech.sosrotas.dto;

import com.vitalistech.sosrotas.model.Ocorrencia;
import com.vitalistech.sosrotas.model.Atendimento;
import com.vitalistech.sosrotas.model.Equipe;
import com.vitalistech.sosrotas.model.OcorrenciaHistorico;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "DTO composto consolidando detalhes operacionais e rastreabilidade da ocorrência")
public record OcorrenciaDetalhes(
    @Schema(description = "Dados estruturados da ocorrência") Ocorrencia ocorrencia,
    @Schema(description = "Informações do atendimento e roteamento gerados pelo algoritmo") Atendimento atendimento,
    @Schema(description = "Equipe médica e operacional vinculada ao recurso despachado") Equipe equipe,
    @Schema(description = "Lista sequencial do histórico de transição de status do chamado") List<OcorrenciaHistorico> historico
) {}