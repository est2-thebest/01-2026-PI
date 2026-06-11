package com.vitalistech.sosrotas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.vitalistech.sosrotas.model.DistanciaBairro;
import java.util.Optional;

@Repository
public interface IDistanciaBairroRepository extends JpaRepository<DistanciaBairro, Long> {

    @Query("SELECT d FROM DistanciaBairro d WHERE d.bairroOrigem.id = :origemId AND d.bairroDestino.id = :destinoId")
    Optional<DistanciaBairro> findTempoEntreBairros(@Param("origemId") Integer origemId, @Param("destinoId") Integer destinoId);
}