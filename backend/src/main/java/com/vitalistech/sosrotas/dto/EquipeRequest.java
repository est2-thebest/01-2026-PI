package com.vitalistech.sosrotas.dto;

import com.vitalistech.sosrotas.model.enums.Turno;
import com.vitalistech.sosrotas.model.enums.StatusEquipe;
import java.util.List;

/**
 * DTO de entrada para criação e atualização de equipes.
 * [RF03] Cadastro de Equipes.
 */
public record EquipeRequest(
        String descricao,
        Integer ambulanciaId,
        Turno turno,
        StatusEquipe status, // Recebe o status do formulário (ex: DISPONIVEL ou INATIVA)
        List<Integer> profissionalIds
) {
}