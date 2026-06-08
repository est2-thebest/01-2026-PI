package com.vitalistech.sosrotas.service;

import java.util.List;

import com.vitalistech.sosrotas.repository.IProfissionalRepository;
import com.vitalistech.sosrotas.model.Profissional;
import org.springframework.stereotype.Service;

@Service
public class ProfissionalService {

    private final IProfissionalRepository repository;

    public ProfissionalService(
            IProfissionalRepository repository) {

        this.repository = repository;
    }

    public List<Profissional> listarTodos() {
        return repository.findAll();
    }

    public Profissional buscarPorId(Integer id) {
        return repository.findById(id).orElse(null);
    }

    public Profissional salvar(
            Profissional profissional) {

        if (profissional.getAtivo() == null) {
            profissional.setAtivo(true);
        }

        return repository.save(profissional);
    }

    public Profissional atualizar(
            Integer id,
            Profissional profissional) {

        if (!repository.existsById(id)) {
            throw new RuntimeException(
                    "Profissional não encontrado"
            );
        }

        profissional.setId(id);

        return repository.save(profissional);
    }

    public void deletar(Integer id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException(
                    "Profissional não encontrado"
            );
        }

        repository.deleteById(id);
    }
}
