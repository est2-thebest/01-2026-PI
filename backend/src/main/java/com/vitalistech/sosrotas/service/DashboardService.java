package com.vitalistech.sosrotas.service;

import org.springframework.stereotype.Service;
import com.vitalistech.sosrotas.dto.DashboardDTO;
import com.vitalistech.sosrotas.model.enums.StatusAmbulancia;
import com.vitalistech.sosrotas.model.enums.StatusOcorrencia;
import com.vitalistech.sosrotas.model.enums.StatusEquipe;
import com.vitalistech.sosrotas.repository.IAmbulanciaRepository;
import com.vitalistech.sosrotas.repository.IEquipeRepository;
import com.vitalistech.sosrotas.repository.IOcorrenciaRepository;
import com.vitalistech.sosrotas.repository.IProfissionalRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DashboardService {

    private final IOcorrenciaRepository ocorrenciaRepository;
    private final IAmbulanciaRepository ambulanciaRepository;
    private final IEquipeRepository equipeRepository;
    private final IProfissionalRepository profissionalRepository;

    public DashboardService(IOcorrenciaRepository ocorrenciaRepository,
                            IAmbulanciaRepository ambulanciaRepository,
                            IEquipeRepository equipeRepository,
                            IProfissionalRepository profissionalRepository) {
        this.ocorrenciaRepository = ocorrenciaRepository;
        this.ambulanciaRepository = ambulanciaRepository;
        this.equipeRepository = equipeRepository;
        this.profissionalRepository = profissionalRepository;
    }

    public DashboardDTO getDashboardStats() {
        // 1. Ocorrências na fila de espera (Abertas)
        long abertas = ocorrenciaRepository.findAll().stream()
                .filter(o -> StatusOcorrencia.ABERTA.equals(o.getStatus()))
                .count();

        // 2. Demanda diária (Ocorrências abertas a partir das 00:00 de hoje)
        LocalDateTime inicioDoDia = LocalDate.now().atStartOfDay();
        long atendimentosHoje = ocorrenciaRepository.findAll().stream()
                .filter(o -> o.getDataHoraAbertura() != null && o.getDataHoraAbertura().isAfter(inicioDoDia))
                .count();

        // 3. Monitoramento de frota
        long totalAmbulancias = ambulanciaRepository.count();
        long disponiveis = ambulanciaRepository.findByStatus(StatusAmbulancia.DISPONIVEL).size();

        // 4. Recursos humanos (Equipes ativas/disponíveis para despacho e profissionais totais)
        long equipesAtivas = equipeRepository.findAll().stream()
                .filter(e -> StatusEquipe.DISPONIVEL.equals(e.getStatus()) || StatusEquipe.EM_ATENDIMENTO.equals(e.getStatus()))
                .count();
        long profissionaisTotal = profissionalRepository.count();

        return new DashboardDTO(
                (int) abertas,
                (int) atendimentosHoje,
                (int) disponiveis,
                (int) totalAmbulancias,
                (int) equipesAtivas,
                (int) profissionaisTotal
        );
    }
}