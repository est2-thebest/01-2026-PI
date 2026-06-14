package com.vitalistech.sosrotas.repository;

import com.vitalistech.sosrotas.model.Bairro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IBairroRepository
        extends JpaRepository<Bairro, Integer> {
}