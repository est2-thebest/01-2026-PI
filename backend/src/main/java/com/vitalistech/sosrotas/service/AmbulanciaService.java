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
        
        // ATUALIZAÇÃO: Quando cadastra uma ambulância nova, seu status inicial é sempre SEM_EQUIPE
        ambulancia.setStatus(StatusAmbulancia.SEM_EQUIPE);
        
        vincularBairroBase(ambulancia, dto.getBairroBaseId());
        
        validarPlaca(ambulancia);
        aplicarStatusInicial(ambulancia);
        
        return repository.save(ambulancia);
    }

    @Transactional
    public Ambulancia atualizar(Integer id, AmbulanciaRequest dto) {
        Ambulancia existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ambulância não encontrada"));

        // ATUALIZAÇÃO: Não pode editar ambulâncias que estiverem com ocorrências abertas/ativas
        validarEdicao(existente);

        // ATUALIZAÇÃO: Só pode editar a placa se estiver com o status de INATIVA ou SEM_EQUIPE
        if (dto.getPlaca() != null && !dto.getPlaca().equalsIgnoreCase(existente.getPlaca())) {
            if (!StatusAmbulancia.INATIVA.equals(existente.getStatus()) && 
                !StatusAmbulancia.SEM_EQUIPE.equals(existente.getStatus())) {
                throw new IllegalStateException("Alteração de placa negada: A placa só pode ser alterada se a ambulância estiver com o status INATIVA ou SEM_EQUIPE.");
            }
        }

        // Valida as regras de transição antes de aplicar o novo status
        validarTransicaoStatus(existente, dto.getStatus());

        existente.setPlaca(dto.getPlaca());
        existente.setTipo(dto.getTipo());
        existente.setStatus(dto.getStatus());
        
        vincularBairroBase(existente, dto.getBairroBaseId());

        return repository.save(existente);
    }

    @Transactional
    public void deletar(Integer id) {
        Ambulancia ambulancia = buscarPorId(id);
        if (ambulancia == null) {
            throw new RuntimeException("Ambulância não encontrada");
        }

        // Executa a validação base de exclusão
        validarExclusao(ambulancia);
        
        // ATUALIZAÇÃO: Só pode excluir se o status estiver como SEM_EQUIPE e não tiver histórico. 
        // Se tiver histórico, passa para INATIVA (Soft Delete)
        if (StatusAmbulancia.SEM_EQUIPE.equals(ambulancia.getStatus())) {
            boolean possuiHistorico = repository.existsHistoricoByAmbulanciaId(id);
            if (possuiHistorico) {
                ambulancia.setStatus(StatusAmbulancia.INATIVA);
                repository.save(ambulancia);
            } else {
                repository.deleteById(id);
            }
        } else {
            throw new IllegalStateException("Exclusão negada: Só é permitido excluir ambulâncias com o status SEM_EQUIPE.");
        }
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

    // ATUALIZAÇÃO: Passando a receber o novoStatus diretamente para validar as restrições
    private void validarTransicaoStatus(Ambulancia atual, StatusAmbulancia novoStatus) {
        // Regras associativas de Equipe e Atendimento
        
        // ATUALIZAÇÃO: Com os status INATIVA ou MANUTENÇÃO, só pode passar para SEM_EQUIPE
        if (StatusAmbulancia.INATIVA.equals(atual.getStatus()) || StatusAmbulancia.MANUTENCAO.equals(atual.getStatus())) {
            if (novoStatus != null && !novoStatus.equals(atual.getStatus()) && !StatusAmbulancia.SEM_EQUIPE.equals(novoStatus)) {
                throw new IllegalStateException("Transição inválida: Ambulâncias em MANUTENÇÃO ou INATIVAS só podem passar para o status SEM_EQUIPE.");
            }
        }
        
        // ATUALIZAÇÃO: Quando vincula uma equipe ela passa para DISPONIVEL (Essa regra rodará aqui se o novoStatus for enviado via atualização)
    }

    /**
     * Valida se a ambulância pode sofrer alterações cadastrais.
     */
    private void validarEdicao(Ambulancia ambulancia) {
        // ATUALIZAÇÃO: Bloqueia caso esteja em atendimento de ocorrência ativa
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