package com.vitalistech.sosrotas.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.vitalistech.sosrotas.dto.EquipeRequest;
import com.vitalistech.sosrotas.dto.EquipeResponse;
import com.vitalistech.sosrotas.dto.ProfissionalResponse;
import com.vitalistech.sosrotas.model.Equipe;
import com.vitalistech.sosrotas.model.Ambulancia;
import com.vitalistech.sosrotas.model.Profissional;
import com.vitalistech.sosrotas.model.enums.StatusAmbulancia;
import com.vitalistech.sosrotas.model.enums.StatusEquipe;
import com.vitalistech.sosrotas.repository.IAmbulanciaRepository;
import com.vitalistech.sosrotas.repository.IEquipeRepository;
import com.vitalistech.sosrotas.repository.IProfissionalRepository;

import java.util.List;

@Service
public class EquipeService {

    private static final Logger logger = LoggerFactory.getLogger(EquipeService.class);

    private final IEquipeRepository equipeRepository;
    private final IAmbulanciaRepository ambulanciaRepository;
    private final IProfissionalRepository profissionalRepository;

    public EquipeService(IEquipeRepository equipeRepository,
                         IAmbulanciaRepository ambulanciaRepository,
                         IProfissionalRepository profissionalRepository) {
        this.equipeRepository = equipeRepository;
        this.ambulanciaRepository = ambulanciaRepository;
        this.profissionalRepository = profissionalRepository;
    }

    public List<EquipeResponse> listarTodas() {
        return equipeRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public EquipeResponse buscarPorId(Integer id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipe não encontrada."));
        return toResponseDTO(equipe);
    }

    @Transactional
    public EquipeResponse salvar(EquipeRequest request) {
        Equipe equipe = new Equipe();
        equipe.setDescricao(request.descricao());
        equipe.setTurno(request.turno());
        
        // Se o front não passar um status inicial, define como DISPONIVEL
        equipe.setStatus(request.status() == null ? StatusEquipe.DISPONIVEL : request.status());

        if (request.ambulanciaId() != null) {
            Ambulancia amb = ambulanciaRepository.findById(request.ambulanciaId())
                    .orElseThrow(() -> new RuntimeException("Ambulância não encontrada."));
            
            if (StatusAmbulancia.EM_ATENDIMENTO == amb.getStatus()) {
                throw new IllegalStateException("Esta viatura já está em atendimento ativo.");
            }
            equipe.setAmbulancia(amb);
        }

        if (request.profissionalIds() != null && !request.profissionalIds().isEmpty()) {
            List<Profissional> profissionais = request.profissionalIds().stream()
                    .map(id -> profissionalRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Profissional ID " + id + " não encontrado.")))
                    .toList();
            equipe.setProfissionais(profissionais);
        }

        Equipe equipeSalva = equipeRepository.save(equipe);
        atualizarStatusAmbulanciaAoVincular(equipeSalva);

        return toResponseDTO(equipeSalva);
    }

    @Transactional
    public EquipeResponse atualizar(Integer id, EquipeRequest request) {
        Equipe existente = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipe não encontrada."));

        // VALIDAÇÃO COM O NOVO ENUM: Não deixa editar equipes em campo
        if (StatusEquipe.EM_ATENDIMENTO == existente.getStatus()) {
            throw new IllegalStateException("Não é permitido editar uma equipe que está Em Atendimento/Em campo.");
        }

        // NOVA VALIDAÇÃO PEDIDA PELO FRONT: Impede alteração se a equipe já estiver inativa
        if (StatusEquipe.INATIVA == existente.getStatus()) {
            throw new IllegalStateException("Não é permitido editar uma equipe que está Inativa.");
        }

        existente.setDescricao(request.descricao());
        existente.setTurno(request.turno());
        
        if (request.status() != null) {
            existente.setStatus(request.status());
        }

        Ambulancia ambulanciaAntiga = existente.getAmbulancia();
        Ambulancia ambulanciaNova = null;

        if (request.ambulanciaId() != null) {
            ambulanciaNova = ambulanciaRepository.findById(request.ambulanciaId())
                    .orElseThrow(() -> new RuntimeException("Ambulância não encontrada."));
        }

        if (ambulanciaAntiga != null && !ambulanciaAntiga.equals(ambulanciaNova)) {
            ambulanciaAntiga.setStatus(StatusAmbulancia.SEM_EQUIPE);
            ambulanciaRepository.save(ambulanciaAntiga);
        }

        existente.setAmbulancia(ambulanciaNova);

        if (request.profissionalIds() != null) {
            List<Profissional> profissionais = request.profissionalIds().stream()
                    .map(pid -> profissionalRepository.findById(pid)
                            .orElseThrow(() -> new RuntimeException("Profissional ID " + pid + " não encontrado.")))
                    .toList();
            // Modifica a coleção persistente em-lugar para garantir DELETE antes de INSERT no join table
            if (existente.getProfissionais() == null) {
                existente.setProfissionais(new java.util.ArrayList<>(profissionais));
            } else {
                existente.getProfissionais().clear();
                existente.getProfissionais().addAll(profissionais);
            }
        }

        Equipe equipeAtualizada = equipeRepository.save(existente);
        atualizarStatusAmbulanciaAoVincular(equipeAtualizada);

        return toResponseDTO(equipeAtualizada);
    }

    @Transactional
    public void deletar(Integer id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipe não encontrada."));
        
        // VALIDAÇÃO COM O NOVO ENUM: Não deixa deletar equipes em campo
        if (StatusEquipe.EM_ATENDIMENTO == equipe.getStatus()) {
            throw new IllegalStateException("Não é permitido excluir uma equipe que está Em Atendimento/Em campo.");
        }

        if (equipe.getAmbulancia() != null) {
            Ambulancia amb = equipe.getAmbulancia();
            amb.setStatus(StatusAmbulancia.SEM_EQUIPE);
            ambulanciaRepository.save(amb);
        }

        equipeRepository.delete(equipe);
    }

    private void atualizarStatusAmbulanciaAoVincular(Equipe equipe) {
        if (equipe.getAmbulancia() != null) {
            Ambulancia amb = equipe.getAmbulancia();
            
            // CORREÇÃO DE TESTE DO FRONT: Se a equipe estiver inativa, a ambulância obrigatoriamente fica SEM_EQUIPE
            if (StatusEquipe.INATIVA == equipe.getStatus()) {
                amb.setStatus(StatusAmbulancia.SEM_EQUIPE);
                ambulanciaRepository.save(amb);
                logger.info("Ambulância id={} forçada para SEM_EQUIPE porque a equipe vinculada está INATIVA.", amb.getId());
            } 
            // Caso contrário, se a ambulância estava vazia (SEM_EQUIPE), ela agora passa a estar DISPONIVEL
            else if (StatusAmbulancia.SEM_EQUIPE == amb.getStatus()) {
                amb.setStatus(StatusAmbulancia.DISPONIVEL);
                ambulanciaRepository.save(amb);
                logger.info("Ambulância id={} sincronizada.", amb.getId());
            }
        }
    }

    private EquipeResponse toResponseDTO(Equipe equipe) {
        List<ProfissionalResponse> profissionaisDTO = equipe.getProfissionais() == null
                ? List.of()
                : equipe.getProfissionais().stream()
                .map(p -> new ProfissionalResponse(
                        p.getId(),
                        p.getNome(),
                        p.getContato(),
                        p.getAtivo(),
                        p.getFuncao(),
                        p.getTurno(),
                        p.getCpf(),
                        p.getCnpj())
                )
                .toList();

        EquipeResponse.AmbulanciaResumo ambulanciaResumo = null;
        if (equipe.getAmbulancia() != null) {
            var amb = equipe.getAmbulancia();
            EquipeResponse.BairroResumo bairroResumo = amb.getBairroBase() != null
                    ? new EquipeResponse.BairroResumo(amb.getBairroBase().getId(), amb.getBairroBase().getNome())
                    : null;
            ambulanciaResumo = new EquipeResponse.AmbulanciaResumo(
                    amb.getId(),
                    amb.getPlaca(),
                    amb.getTipo() != null ? amb.getTipo().name() : null,
                    amb.getStatus() != null ? amb.getStatus().name() : null,
                    bairroResumo
            );
        }

        return new EquipeResponse(
                equipe.getId(),
                equipe.getDescricao(),
                equipe.getAmbulancia() != null ? equipe.getAmbulancia().getId() : null,
                ambulanciaResumo,
                equipe.getTurno(),
                equipe.getStatus(),
                profissionaisDTO);
    }

    @Transactional
    public EquipeResponse reativarEquipe(Integer id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipe não encontrada."));

        if (StatusEquipe.INATIVA != equipe.getStatus()) {
            throw new IllegalStateException("Apenas equipes INATIVAS podem ser reativadas.");
        }

        equipe.setStatus(StatusEquipe.DISPONIVEL);

        if (equipe.getAmbulancia() != null) {
            Ambulancia amb = equipe.getAmbulancia();
            if (StatusAmbulancia.SEM_EQUIPE == amb.getStatus()) {
                amb.setStatus(StatusAmbulancia.DISPONIVEL);
                ambulanciaRepository.save(amb);
            }
        }

        return toResponseDTO(equipeRepository.save(equipe));
    }

    @Transactional
    public EquipeResponse inativarEquipe(Integer id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipe não encontrada."));

        // Regra de segurança: Equipe em campo não pode ser inativada subitamente
        if (StatusEquipe.EM_ATENDIMENTO == equipe.getStatus()) {
            throw new IllegalStateException("Não é possível inativar uma equipe que está em atendimento ativo!");
        }

        equipe.setStatus(StatusEquipe.INATIVA);
        
        // Opcional: Se a equipe for inativada, talvez você queira liberar a ambulância dela
        if (equipe.getAmbulancia() != null) {
            Ambulancia amb = equipe.getAmbulancia();
            amb.setStatus(StatusAmbulancia.SEM_EQUIPE);
            ambulanciaRepository.save(amb);
            // equipe.setAmbulancia(null); // Desvincular se for regra de negócio
        }

        return toResponseDTO(equipeRepository.save(equipe));
    }
}