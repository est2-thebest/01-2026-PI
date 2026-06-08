package com.vitalistech.sosrotas.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vitalistech.sosrotas.model.enums.StatusAmbulancia;
import com.vitalistech.sosrotas.model.Ambulancia;
import com.vitalistech.sosrotas.repository.IAmbulanciaRepository;

@Service
public class AmbulanciaService {

    private final IAmbulanciaRepository repository;

    public AmbulanciaService(
            IAmbulanciaRepository repository) {

        this.repository = repository;
    }

    public List<Ambulancia> listarTodas() {
        return repository.findAll();
    }

    public Ambulancia buscarPorId(Integer id) {
        return repository.findById(id)
                .orElse(null);
    }

    public Ambulancia salvar(Ambulancia ambulancia) {

        validarPlaca(ambulancia);

        aplicarStatusInicial(ambulancia);

        return repository.save(ambulancia);
    }

    public Ambulancia atualizar(
            Integer id,
            Ambulancia ambulancia) {

        Ambulancia existente =
                repository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Ambulância não encontrada"
                                )
                        );

        validarTransicaoStatus(
                existente,
                ambulancia
        );

        existente.setPlaca(
                ambulancia.getPlaca()
        );

        existente.setTipo(
                ambulancia.getTipo()
        );

        existente.setStatus(
                ambulancia.getStatus()
        );

        existente.setBairro(
                ambulancia.getBairro()
        );

        return repository.save(existente);
    }

    public void deletar(Integer id) {

        Ambulancia ambulancia =
                buscarPorId(id);

        if (ambulancia == null) {
            throw new RuntimeException(
                    "Ambulância não encontrada"
            );
        }

        validarExclusao(
                ambulancia
        );

        repository.deleteById(id);
    }

    private void validarPlaca(
            Ambulancia ambulancia) {

        if (ambulancia.getId() == null &&
                repository.existsByPlaca(
                        ambulancia.getPlaca())) {

            throw new RuntimeException(
                    "Placa já cadastrada"
            );
        }
    }

    private void aplicarStatusInicial(
            Ambulancia ambulancia) {

        if (ambulancia.getId() == null) {

            ambulancia.setStatus(
                    StatusAmbulancia.SEM_EQUIPE
            );
        }
    }

    private void validarTransicaoStatus(
            Ambulancia atual,
            Ambulancia nova) {

        // será expandido quando Equipe
        // e Atendimento forem implementados
    }

    private void validarExclusao(
            Ambulancia ambulancia) {

        // será expandido quando Equipe
        // e Atendimento forem implementados
    }
}