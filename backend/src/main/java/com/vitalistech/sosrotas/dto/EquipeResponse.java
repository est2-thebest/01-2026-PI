package com.vitalistech.sosrotas.dto;

import com.vitalistech.sosrotas.model.enums.Turno;
import com.vitalistech.sosrotas.model.enums.StatusEquipe;
import java.util.List;

public record EquipeResponse(
        Integer id,
        String descricao,
        Integer ambulanciaId,
        AmbulanciaResumo ambulancia,
        Turno turno,
        StatusEquipe status,
        List<ProfissionalResponse> profissionais
) {
    public record AmbulanciaResumo(Integer id, String placa, String tipo, String status, BairroResumo bairro) {}
    public record BairroResumo(Integer id, String nome) {}
}