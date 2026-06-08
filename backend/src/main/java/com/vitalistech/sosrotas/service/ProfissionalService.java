package com.vitalistech.sosrotas.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.vitalistech.sosrotas.repository.IProfissionalRepository;
import com.vitalistech.sosrotas.model.Profissional;
import com.vitalistech.sosrotas.dto.ProfissionalRequest;
import com.vitalistech.sosrotas.dto.ProfissionalResponse;

@Service
public class ProfissionalService {

    private final IProfissionalRepository repository;

    public ProfissionalService(IProfissionalRepository repository) {
        this.repository = repository;
    }

    public List<ProfissionalResponse> listarTodos() {
        return repository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public ProfissionalResponse buscarPorId(Integer id) {
        Profissional profissional = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profissional não encontrado"));
        return toResponseDTO(profissional);
    }

    @Transactional
    public ProfissionalResponse salvar(ProfissionalRequest request) {
        Profissional profissional = new Profissional();
        profissional.setNome(request.nome());
        profissional.setContato(request.contato());
        profissional.setAtivo(request.ativo() == null ? true : request.ativo());
        profissional.setFuncao(request.funcao());
        profissional.setTurno(request.turno());

        return toResponseDTO(repository.save(profissional));
    }

    @Transactional
    public ProfissionalResponse atualizar(Integer id, ProfissionalRequest request) {
        Profissional existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profissional não encontrado"));

        existente.setNome(request.nome());
        existente.setContato(request.contato());
        if (request.ativo() != null) {
            existente.setAtivo(request.ativo());
        }
        existente.setFuncao(request.funcao());
        existente.setTurno(request.turno());

        return toResponseDTO(repository.save(existente));
    }

    @Transactional
    public void deletar(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Profissional não encontrado");
        }
        repository.deleteById(id);
    }

    // Método utilitário de mapeamento interno
    public ProfissionalResponse toResponseDTO(Profissional profissional) {
        return new ProfissionalResponse(
                profissional.getId(),
                profissional.getNome(),
                profissional.getContato(),
                profissional.getAtivo(),
                profissional.getFuncao(),
                profissional.getTurno()
        );
    }
}