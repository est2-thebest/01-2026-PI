package com.vitalistech.sosrotas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vitalistech.sosrotas.model.enums.StatusAmbulancia;
import com.vitalistech.sosrotas.model.Ambulancia;

@Repository
public interface IAmbulanciaRepository extends JpaRepository<Ambulancia, Integer> {

    /**
     * Busca ambulâncias por status.
     *
     * Exemplo:
     * repository.findByStatus(StatusAmbulancia.DISPONIVEL);
     */
    List<Ambulancia> findByStatus(StatusAmbulancia status);

    /**
     * Verifica se já existe uma ambulância com a placa informada.
     */
    boolean existsByPlaca(String placa);

    /**
     * Busca uma ambulância pela placa.
     */
    Ambulancia findByPlaca(String placa);

    /**
     * ATUALIZAÇÃO: Verifica se a ambulância possui histórico associado na tabela de atendimentos.
     */
    @Query("SELECT COUNT(at) > 0 FROM Atendimento at WHERE at.ambulancia.id = :ambulanciaId")
    boolean existsHistoricoByAmbulanciaId(@Param("ambulanciaId") Integer ambulanciaId);

}