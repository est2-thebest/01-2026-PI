package com.vitalistech.sosrotas.dto;

import com.vitalistech.sosrotas.model.enums.Turno;
import java.util.List;

/**
 * DTO de entrada para criação e atualização de equipes.
 * [RF03] Cadastro de Equipes.
 */
public record EquipeRequest(
        String descricao,
        Integer ambulanciaId,
        Turno turno,
        List<Integer> profissionalIds
) {
}