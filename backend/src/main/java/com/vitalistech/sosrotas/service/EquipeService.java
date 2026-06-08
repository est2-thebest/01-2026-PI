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

        if (request.ambulanciaId() != null) {
            Ambulancia amb = ambulanciaRepository.findById(request.ambulanciaId())
                    .orElseThrow(() -> new RuntimeException("Ambulância não encontrada."));
            equipe.setAmbulancia(amb);
            atualizarStatusAmbulanciaAoVincular(equipe);
        }

        if (request.profissionalIds() != null && !request.profissionalIds().isEmpty()) {
            List<Profissional> profissionais = request.profissionalIds().stream()
                    .map(id -> profissionalRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Profissional ID " + id + " não encontrado.")))
                    .toList();
            equipe.setProfissionais(profissionais);
        }

        return toResponseDTO(equipeRepository.save(equipe));
    }

    @Transactional
    public EquipeResponse atualizar(Integer id, EquipeRequest request) {
        Equipe existente = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipe não encontrada."));

        existente.setDescricao(request.descricao());
        existente.setTurno(request.turno());

        if (request.ambulanciaId() != null) {
            Ambulancia amb = ambulanciaRepository.findById(request.ambulanciaId())
                    .orElseThrow(() -> new RuntimeException("Ambulância não encontrada."));
            existente.setAmbulancia(amb);
        } else {
            existente.setAmbulancia(null);
        }

        if (request.profissionalIds() != null) {
            List<Profissional> profissionais = request.profissionalIds().stream()
                    .map(pid -> profissionalRepository.findById(pid)
                            .orElseThrow(() -> new RuntimeException("Profissional ID " + pid + " não encontrado.")))
                    .toList();
            existente.setProfissionais(profissionais);
        }

        return toResponseDTO(equipeRepository.save(existente));
    }

    @Transactional
    public void deletar(Integer id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipe não encontrada."));
        equipeRepository.delete(equipe);
    }

    private void atualizarStatusAmbulanciaAoVincular(Equipe equipe) {
        if (equipe.getAmbulancia() != null && equipe.getAmbulancia().getStatus() == StatusAmbulancia.SEM_EQUIPE) {
            Ambulancia amb = equipe.getAmbulancia();
            amb.setStatus(StatusAmbulancia.DISPONIVEL);
            ambulanciaRepository.save(amb);
            logger.info("Ambulância id={} atualizada para DISPONIVEL.", amb.getId());
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
                        p.getTurno()))
                .toList();

        return new EquipeResponse(
                equipe.getId(),
                equipe.getDescricao(),
                equipe.getAmbulancia() != null ? equipe.getAmbulancia().getId() : null,
                equipe.getTurno(),
                profissionaisDTO);
    }
}