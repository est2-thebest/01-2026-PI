package com.vitalistech.sosrotas.service;

import com.vitalistech.sosrotas.model.Rota;
import com.vitalistech.sosrotas.repository.RotaRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RotaService {

    private final RotaRepository rotaRepository;

    public RotaService(RotaRepository rotaRepository) {
        this.rotaRepository = rotaRepository;
    }

    public List<Rota> listarTodas() {
        return rotaRepository.findAll();
    }

    public Rota salvar(Rota rota) {
        return rotaRepository.save(rota);
    }
}
