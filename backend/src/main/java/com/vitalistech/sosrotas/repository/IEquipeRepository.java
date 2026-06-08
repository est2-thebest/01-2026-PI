package com.vitalistech.sosrotas.repository;

import com.vitalistech.sosrotas.model.Ambulancia;
import com.vitalistech.sosrotas.model.Equipe;
import com.vitalistech.sosrotas.model.Profissional;
import com.vitalistech.sosrotas.model.enums.Turno;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IEquipeRepository
        extends JpaRepository<Equipe, Integer> {

    /**
     * Busca todas as equipes vinculadas a uma determinada ambulância.
     */
    List<Equipe> findByAmbulancia(Ambulancia ambulancia);

    /**
     * Busca equipes filtrando por ambulância e turno específico.
     */
    List<Equipe> findByAmbulanciaAndTurno(
            Ambulancia ambulancia,
            Turno turno
    );

    /**
     * Verifica se um profissional já está inserido/contido em alguma equipe.
     * Muito útil para validações de regras de negócio (ex: evitar profissional em duas equipes).
     */
    boolean existsByProfissionaisContaining(
            Profissional profissional
    );
}
