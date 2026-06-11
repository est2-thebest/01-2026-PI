package com.vitalistech.sosrotas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.vitalistech.sosrotas.model.Ocorrencia;
import com.vitalistech.sosrotas.model.OcorrenciaHistorico;

import java.util.List;

@Repository
public interface IOcorrenciaHistoricoRepository extends JpaRepository<OcorrenciaHistorico, Integer> {
    
    /**
     * Retorna a linha do tempo de transições de uma determinada ocorrência ordenada da mais recente para a mais antiga.
     */
    List<OcorrenciaHistorico> findByOcorrenciaOrderByDataHoraDesc(Ocorrencia ocorrencia);
}