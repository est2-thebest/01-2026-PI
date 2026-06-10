package com.vitalistech.sosrotas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.vitalistech.sosrotas.model.Atendimento;
import com.vitalistech.sosrotas.model.Ambulancia;
import com.vitalistech.sosrotas.model.Ocorrencia;

@Repository
public interface IAtendimentoRepository extends JpaRepository<Atendimento, Integer> {
    boolean existsByAmbulancia(Ambulancia ambulancia);
    Atendimento findFirstByOcorrenciaOrderByIdDesc(Ocorrencia ocorrencia);
}