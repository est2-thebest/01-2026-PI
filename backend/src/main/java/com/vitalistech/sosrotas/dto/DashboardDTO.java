package com.vitalistech.sosrotas.dto;

public record DashboardDTO(
        int ocorrenciasAbertas,
        int atendimentosHoje,
        int ambulanciasDisponiveis,
        int ambulanciasTotal,
        int equipesAtivas,
        int profissionaisCadastrados
) {}
