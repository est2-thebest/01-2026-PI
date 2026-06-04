package com.vitalistech.sosrotas.repository;

import com.vitalistech.sosrotas.model.Rota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RotaRepository extends JpaRepository<Rota, Long> {}
