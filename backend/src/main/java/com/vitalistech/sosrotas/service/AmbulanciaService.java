package com.vitalistech.sosrotas.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vitalistech.sosrotas.dto.AmbulanciaRequest;
import com.vitalistech.sosrotas.model.Ambulancia;
import com.vitalistech.sosrotas.model.Bairro;
import com.vitalistech.sosrotas.model.enums.StatusAmbulancia;
import com.vitalistech.sosrotas.repository.IAmbulanciaRepository;
import com.vitalistech.sosrotas.repository.IBairroRepository; 

@Service
public class AmbulanciaService {

    private final IAmbulanciaRepository repository;
    private final IBairroRepository bairroRepository;

    public AmbulanciaService(IAmbulanciaRepository repository, IBairroRepository bairroRepository) {
        this.repository = repository;
        this.bairroRepository = bairroRepository;
    }

    public List<Ambulancia> listarTodas() {
        return repository.findAll();
    }

    public Ambulancia buscarPorId(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional
    public Ambulancia salvar(AmbulanciaRequest dto) {
        Ambulancia ambulancia = new Ambulancia();
        ambulancia.setPlaca(dto.getPlaca());
        ambulancia.setTipo(dto.getTipo());
        ambulancia.setStatus(dto.getStatus());
        
        vincularBairroBase(ambulancia, dto.getBairroBaseId());
        
        validarPlaca(ambulancia);
        aplicarStatusInicial(ambulancia);
        
        return repository.save(ambulancia);
    }

    @Transactional
    public Ambulancia atualizar(Integer id, AmbulanciaRequest dto) {
        Ambulancia existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ambulância não encontrada"));

        // VALIDAÇÃO: Impede qualquer edição se a viatura estiver em atendimento ativo nas ruas
        validarEdicao(existente);

        // Criação de cópia temporária para validação de transição de estado
        Ambulancia simulada = new Ambulancia();
        simulada.setStatus(dto.getStatus());
        validarTransicaoStatus(existente, simulada);

        existente.setPlaca(dto.getPlaca());
        existente.setTipo(dto.getTipo());
        existente.setStatus(dto.getStatus());
        
        vincularBairroBase(existente, dto.getBairroBaseId()); // Resolvido duplicidade estrutural

        return repository.save(existente);
    }

    @Transactional
    public void deletar(Integer id) {
        Ambulancia ambulancia = buscarPorId(id);
        if (ambulancia == null) {
            throw new RuntimeException("Ambulância não encontrada");
        }

        validarExclusao(ambulancia);
        repository.deleteById(id);
    }

    private void vincularBairroBase(Ambulancia amb, Integer bairroId) {
        if (bairroId != null) {
            Bairro bairro = bairroRepository.findById(bairroId)
                    .orElseThrow(() -> new RuntimeException("Bairro Base operacional inválido"));
            amb.setBairroBase(bairro);
        } else {
            amb.setBairroBase(null);
        }
    }

    private void validarPlaca(Ambulancia ambulancia) {
        if (ambulancia.getId() == null && repository.existsByPlaca(ambulancia.getPlaca())) {
            throw new RuntimeException("Placa já cadastrada");
        }
    }

    private void aplicarStatusInicial(Ambulancia ambulancia) {
        if (ambulancia.getId() == null && ambulancia.getStatus() == null) {
            ambulancia.setStatus(StatusAmbulancia.SEM_EQUIPE); 
        }
    }

    private void validarTransicaoStatus(Ambulancia atual, Ambulancia nova) {
        // Regras associativas de Equipe e Atendimento
    }

    /**
     * Valida se a ambulância pode sofrer alterações cadastrais.
     */
    private void validarEdicao(Ambulancia ambulancia) {
        if (StatusAmbulancia.EM_ATENDIMENTO.equals(ambulancia.getStatus())) {
            throw new IllegalStateException("Não é permitido editar os dados de uma viatura em atendimento ativo.");
        }
    }

    private void validarExclusao(Ambulancia ambulancia) {
        if (StatusAmbulancia.EM_ATENDIMENTO.equals(ambulancia.getStatus())) {
            throw new IllegalStateException("Não é permitido excluir uma viatura em atendimento ativo.");
        }
    }
}