package com.vitalistech.sosrotas.dto;

import com.vitalistech.sosrotas.model.enums.Turno;
import java.util.List;

/**
 * DTO de saída para retorno de dados de equipes.
 * [RF03] Consulta de Equipes.
 */
public record EquipeResponse(
        Integer id,
        String descricao,
        Integer ambulanciaId,
        Turno turno,
        List<ProfissionalResponse> profissionais
) {
}
