package com.vitalistech.sosrotas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.vitalistech.sosrotas.model.Ocorrencia;
import com.vitalistech.sosrotas.model.enums.StatusOcorrencia;

import java.util.List;

@Repository
public interface IOcorrenciaRepository extends JpaRepository<Ocorrencia, Integer> {
    
    /**
     * Recupera ocorrências filtradas por estado (Ex: Buscar todas as ocorrências 'ABERTA' aguardando viatura).
     */
    List<Ocorrencia> findByStatus(StatusOcorrencia status);
}