package com.vitalistech.sosrotas.service;

import com.vitalistech.sosrotas.model.Bairro;
import com.vitalistech.sosrotas.repository.IBairroRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BairroService {

    private final IBairroRepository repository;

    public BairroService(
            IBairroRepository repository) {

        this.repository = repository;
    }

    public List<Bairro> listarTodos() {
        return repository.findAll();
    }

    public Bairro buscarPorId(Integer id) {

        return repository.findById(id)
                .orElse(null);
    }

    public Bairro salvar(Bairro bairro) {

        return repository.save(bairro);
    }

    public Bairro atualizar(
            Integer id,
            Bairro bairro) {

        Bairro existente =
                repository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Bairro não encontrado"
                                )
                        );

        existente.setNome(
                bairro.getNome()
        );

        return repository.save(existente);
    }

    public void deletar(Integer id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException(
                    "Bairro não encontrado"
            );
        }

        repository.deleteById(id);
    }
}