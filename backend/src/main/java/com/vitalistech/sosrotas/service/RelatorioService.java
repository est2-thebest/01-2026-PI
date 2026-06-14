package com.vitalistech.sosrotas.service;

import org.springframework.stereotype.Service;
import com.vitalistech.sosrotas.dto.RelatorioResponse;
import com.vitalistech.sosrotas.model.Ocorrencia;
import com.vitalistech.sosrotas.model.enums.StatusOcorrencia;
import com.vitalistech.sosrotas.repository.IOcorrenciaRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

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

    
    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Retorna a contagem de atendimentos agrupados por bairro.
     *
     * @return Lista de objetos [Nome do Bairro, Quantidade]
     * [RF07] Relatório de Ocorrências por Bairro.
     * [Teoria da Computacao - Demonstracao Numerica] Agregacao de dados para analise
     * [Banco de Dados II] Consulta que retorna valor.
     */
    public List<Object[]> getAtendimentosPorBairro() {
        String jpql = "SELECT b.nome, COUNT(o.id) " +
                    "FROM Ocorrencia o " +
                    "JOIN o.bairro b " +
                    "GROUP BY b.nome";
        return entityManager.createQuery(jpql).getResultList();
    }
}