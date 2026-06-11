package com.vitalistech.sosrotas.service;

import com.vitalistech.sosrotas.dto.BairroRequest;
import com.vitalistech.sosrotas.model.Bairro;
import com.vitalistech.sosrotas.repository.IBairroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * [PADRÃO DE PROJETO: SINGLETON]
 * Aplicado via escopo nativo do Spring Framework através da anotação @Service.
 * Justificativa: Garante uma única instância centralizada do serviço de bairros gerenciando o acesso à malha urbana, assegurando a consistência dos dados de localidades consumidos pelas controllers e regras de despacho.
 */
@Service
public class BairroService {

    private final IBairroRepository repository;

    public BairroService(IBairroRepository repository) {
        this.repository = repository;
    }

    public List<Bairro> listarTodos() {
        return repository.findAll();
    }

    public Bairro buscarPorId(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional
    public Bairro salvar(BairroRequest dto) {
        // Validação extra para garantir a integridade do mapa SVG (1 a 20)
        if (dto.getId() == null || dto.getId() < 1 || dto.getId() > 20) {
            throw new IllegalArgumentException("O ID do bairro deve estar explicitamente entre 1 e 20 para compatibilidade com o mapa.");
        }
        
        if (repository.existsById(dto.getId())) {
            throw new RuntimeException("Já existe um bairro cadastrado com o ID " + dto.getId());
        }

        Bairro bairro = new Bairro(dto.getId(), dto.getNome());
        return repository.save(bairro);
    }

    @Transactional
    public Bairro atualizar(Integer id, BairroRequest dto) {
        Bairro existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bairro não encontrado"));

        existente.setNome(dto.getNome());

        return repository.save(existente);
    }

    @Transactional
    public void deletar(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Bairro não encontrado");
        }
        repository.deleteById(id);
    }
}