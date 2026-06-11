package com.vitalistech.sosrotas.service;

import org.springframework.stereotype.Service;
import com.vitalistech.sosrotas.dto.RelatorioResponse;
import com.vitalistech.sosrotas.model.Ocorrencia;
import com.vitalistech.sosrotas.model.enums.StatusOcorrencia;
import com.vitalistech.sosrotas.repository.IOcorrenciaRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RelatorioService {

    private final IOcorrenciaRepository ocorrenciaRepository;

    public RelatorioService(IOcorrenciaRepository ocorrenciaRepository) {
        this.ocorrenciaRepository = ocorrenciaRepository;
    }

    /**
     * Gera dados analíticos e filtrados de ocorrências para consumo avançado
     */
    public RelatorioResponse gerarRelatorioAvancado(String gravidade, StatusOcorrencia status) {
        List<Ocorrencia> todasOcorrencias = ocorrenciaRepository.findAll();

        List<Ocorrencia> ocorrenciasFiltradas = todasOcorrencias.stream()
                .filter(o -> gravidade == null || gravidade.trim().isEmpty() || o.getGravidade().toString().equalsIgnoreCase(gravidade))
                .filter(o -> status == null || o.getStatus() == status)
                .collect(Collectors.toList());

        String metadadosFiltros = "Filtros -> Gravidade: " + (gravidade != null ? gravidade : "TODAS") + 
                                  " | Status: " + (status != null ? status : "TODOS");

        return new RelatorioResponse(ocorrenciasFiltradas.size(), metadadosFiltros, ocorrenciasFiltradas);
    }
}