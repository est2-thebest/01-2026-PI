package com.vitalistech.sosrotas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vitalistech.sosrotas.model.Profissional;

@Repository
public interface IProfissionalRepository
        extends JpaRepository<Profissional, Integer> {
}