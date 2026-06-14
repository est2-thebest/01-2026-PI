package com.vitalistech.sosrotas.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vitalistech.sosrotas.model.Ambulancia;
import com.vitalistech.sosrotas.model.Atendimento;
import com.vitalistech.sosrotas.model.Bairro;
import com.vitalistech.sosrotas.model.DistanciaBairro;
import com.vitalistech.sosrotas.model.Ocorrencia;
import com.vitalistech.sosrotas.model.OcorrenciaHistorico;
import com.vitalistech.sosrotas.model.SugestaoDespacho;
import com.vitalistech.sosrotas.model.Equipe;
import com.vitalistech.sosrotas.model.enums.StatusAmbulancia;
import com.vitalistech.sosrotas.model.enums.StatusOcorrencia;
import com.vitalistech.sosrotas.model.enums.StatusEquipe;
import com.vitalistech.sosrotas.dto.OcorrenciaDetalhes;
import com.vitalistech.sosrotas.dto.OcorrenciaRequest;
import com.vitalistech.sosrotas.dto.AmbulanciaOpcao;
import com.vitalistech.sosrotas.repository.IAmbulanciaRepository;
import com.vitalistech.sosrotas.repository.IAtendimentoRepository;
import com.vitalistech.sosrotas.repository.IOcorrenciaRepository;
import com.vitalistech.sosrotas.repository.IEquipeRepository;
import com.vitalistech.sosrotas.repository.IOcorrenciaHistoricoRepository;
import com.vitalistech.sosrotas.repository.IBairroRepository;
import com.vitalistech.sosrotas.repository.IDistanciaBairroRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OcorrenciaService {

    private static final Logger logger = LoggerFactory.getLogger(OcorrenciaService.class);

    private final IOcorrenciaRepository ocorrenciaRepository;
    private final IAmbulanciaRepository ambulanciaRepository;
    private final IAtendimentoRepository atendimentoRepository;
    private final IEquipeRepository equipeRepository;
    private final IOcorrenciaHistoricoRepository historicoRepository;
    private final IDistanciaBairroRepository distanciaBairroRepository;
    private final IBairroRepository bairroRepository;

    public OcorrenciaService(IOcorrenciaRepository ocorrenciaRepository,
                             IAmbulanciaRepository ambulanciaRepository,
                             IAtendimentoRepository atendimentoRepository,
                             IEquipeRepository equipeRepository,
                             IOcorrenciaHistoricoRepository historicoRepository,
                             IDistanciaBairroRepository distanciaBairroRepository,
                             IBairroRepository bairroRepository) {
        this.ocorrenciaRepository = ocorrenciaRepository;
        this.ambulanciaRepository = ambulanciaRepository;
        this.atendimentoRepository = atendimentoRepository;
        this.equipeRepository = equipeRepository;
        this.historicoRepository = historicoRepository;
        this.distanciaBairroRepository = distanciaBairroRepository;
        this.bairroRepository = bairroRepository;
    }

    public List<Ocorrencia> findAll() {
        return ocorrenciaRepository.findAll();
    }

    public Ocorrencia findById(Integer id) {
        return ocorrenciaRepository.findById(id).orElse(null);
    }

    @Transactional
    public Ocorrencia openOccurrence(OcorrenciaRequest dto) {
        Ocorrencia ocorrencia = new Ocorrencia();
        ocorrencia.setTipo(dto.getTipo());
        ocorrencia.setGravidade(dto.getGravidade());
        ocorrencia.setObservacao(dto.getObservacao());

        if (dto.getBairroId() != null) {
            Bairro bairro = bairroRepository.findById(dto.getBairroId())
                    .orElseThrow(() -> new RuntimeException("Bairro destino nao localizado no mapa operacional."));
            ocorrencia.setBairro(bairro);
        }

        ocorrencia.setStatus(StatusOcorrencia.ABERTA);
        ocorrencia.setDataHoraAbertura(LocalDateTime.now());

        Ocorrencia saved = ocorrenciaRepository.save(ocorrencia);

        logger.info("Chamado registrado no barramento de emergencias. ID: {}", saved.getId());
        saveHistory(saved, null, StatusOcorrencia.ABERTA, "Chamado de emergencia classificado e aberto no sistema");

        return saved;
    }

    @Transactional
    public void deleteOccurrence(Integer id) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ocorrencia nao encontrada"));

        if (StatusOcorrencia.ABERTA != ocorrencia.getStatus()) {
            throw new IllegalStateException("Apenas ocorrencias ABERTAS podem ser excluidas.");
        }

        Atendimento atendimento = atendimentoRepository.findFirstByOcorrenciaOrderByIdDesc(ocorrencia);
        if (atendimento != null) {
            throw new IllegalStateException("Nao e possivel excluir esta ocorrencia. Verifique se ha atendimento vinculado.");
        }

        List<OcorrenciaHistorico> historico = historicoRepository.findByOcorrenciaOrderByDataHoraDesc(ocorrencia);
        historicoRepository.deleteAll(historico);

        ocorrenciaRepository.deleteById(id);
    }

    @Transactional
    public Ocorrencia updateOccurrence(Integer id, OcorrenciaRequest dto) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ocorrencia nao encontrada"));

        if (StatusOcorrencia.ABERTA != ocorrencia.getStatus()) {
            throw new IllegalStateException("Apenas ocorrencias ABERTAS podem ser editadas.");
        }

        ocorrencia.setTipo(dto.getTipo());
        ocorrencia.setGravidade(dto.getGravidade());
        ocorrencia.setObservacao(dto.getObservacao());

        if (dto.getBairroId() != null) {
            Bairro bairro = bairroRepository.findById(dto.getBairroId())
                    .orElseThrow(() -> new RuntimeException("Bairro destino nao localizado no mapa operacional."));
            ocorrencia.setBairro(bairro);
        }

        return ocorrenciaRepository.save(ocorrencia);
    }

    public SugestaoDespacho calcularSugestaoDespacho(Integer ocorrenciaId) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(ocorrenciaId)
                .orElseThrow(() -> new RuntimeException("Ocorrencia nao encontrada"));

        Integer bairroDestinoId = ocorrencia.getBairro().getId();

        List<Ambulancia> disponiveis = ambulanciaRepository.findByStatus(StatusAmbulancia.DISPONIVEL);

        List<AmbulanciaOpcao> opcoes = new ArrayList<>();

        for (Ambulancia amb : disponiveis) {
            if (amb.getBairroBase() == null) {
                logger.warn("Aviso: Ambulancia ID {} nao possui Bairro Base vinculado.", amb.getId());
                continue;
            }

            Integer bairroOrigemId = amb.getBairroBase().getId();

            Integer tempo = distanciaBairroRepository.findTempoEntreBairros(bairroOrigemId, bairroDestinoId)
                    .map(DistanciaBairro::getTempoEstimadoMinutos)
                    .orElse(99);

            opcoes.add(new AmbulanciaOpcao(
                    amb.getId(),
                    amb.getPlaca(),
                    amb.getTipo() != null ? amb.getTipo().toString() : null,
                    amb.getBairroBase().getNome(),
                    tempo
            ));
        }

        opcoes.sort(java.util.Comparator.comparingInt(AmbulanciaOpcao::getTempoEstimado));

        AmbulanciaOpcao recomendada = null;
        List<AmbulanciaOpcao> extras = new ArrayList<>();

        if (!opcoes.isEmpty()) {
            recomendada = opcoes.get(0);
            if (opcoes.size() > 1) {
                extras = opcoes.subList(1, opcoes.size());
            }
        }

        return new SugestaoDespacho(ocorrencia, recomendada, extras);
    }

    @Transactional
    public Ocorrencia confirmarDespachoSemiautomatico(Integer ocorrenciaId, Integer ambulanciaId) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(ocorrenciaId)
                .orElseThrow(() -> new RuntimeException("Ocorrencia invalida"));

        Ambulancia ambulancia = ambulanciaRepository.findById(ambulanciaId)
                .orElseThrow(() -> new RuntimeException("Ambulancia invalida"));

        if (StatusAmbulancia.DISPONIVEL != ambulancia.getStatus()) {
            throw new IllegalStateException("Esta viatura nao esta mais livre para alocacao.");
        }

        equipeRepository.findFirstByAmbulancia(ambulancia).ifPresent(equipe -> {
            equipe.setStatus(StatusEquipe.EM_ATENDIMENTO);
            equipeRepository.save(equipe);
            logger.info("Equipe ID {} alterada para EM_ATENDIMENTO devido ao despacho.", equipe.getId());
        });

        StatusOcorrencia statusAnterior = ocorrencia.getStatus();

        ocorrencia.setStatus(StatusOcorrencia.DESPACHADA);
        ambulancia.setStatus(StatusAmbulancia.EM_ATENDIMENTO);

        ambulanciaRepository.save(ambulancia);
        Ocorrencia ocorrenciaSalva = ocorrenciaRepository.save(ocorrencia);

        Integer tempoEstimadoMinutos = distanciaBairroRepository.findTempoEntreBairros(ambulancia.getBairroBase().getId(), ocorrencia.getBairro().getId())
                .map(DistanciaBairro::getTempoEstimadoMinutos)
                .orElse(0);

        double slaPrevistoMinutos = 15.0;
        if (ocorrencia.getGravidade() != null) {
            String gravidadeString = String.valueOf(ocorrencia.getGravidade()).toUpperCase();
            switch (gravidadeString) {
                case "ALTA":
                    slaPrevistoMinutos = 8.0;
                    break;
                case "MEDIA":
                    slaPrevistoMinutos = 15.0;
                    break;
                case "BAIXA":
                    slaPrevistoMinutos = 30.0;
                    break;
            }
        }
        boolean foraDoSla = tempoEstimadoMinutos > slaPrevistoMinutos;

        Atendimento atendimento = new Atendimento();
        atendimento.setOcorrencia(ocorrenciaSalva);
        atendimento.setAmbulancia(ambulancia);
        atendimento.setDataHoraDespacho(LocalDateTime.now());
        atendimento.setDistanciaKm(0.0);
        atendimento.setTempoEstimado(tempoEstimadoMinutos.doubleValue());
        atendimento.setRota("Rota gerenciada e iluminada via Frontend (SVG)");
        atendimento.setSlaPrevisto(slaPrevistoMinutos);
        atendimento.setForaDoSla(foraDoSla);
        atendimentoRepository.save(atendimento);

        logger.info("Despacho verificado. Viatura Prefixo {} encaminhada para Ocorrencia {}", ambulancia.getId(), ocorrencia.getId());
        saveHistory(ocorrenciaSalva, statusAnterior, StatusOcorrencia.DESPACHADA, "Viatura Prefixo " + ambulancia.getId() + " despachada manualmente pelo operador.");

        return ocorrenciaSalva;
    }

    @Transactional
    public void cancelOccurrence(Integer id, String justificativa) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ocorrencia nao mapeada no banco de dados."));

        if (StatusOcorrencia.CONCLUIDA == ocorrencia.getStatus() || StatusOcorrencia.CANCELADA == ocorrencia.getStatus()) {
            throw new IllegalStateException("Regra de Negocio: Nao e permitido alterar chamados ja finalizados.");
        }

        StatusOcorrencia statusAnterior = ocorrencia.getStatus();
        ocorrencia.setStatus(StatusOcorrencia.CANCELADA);
        ocorrencia.setDataHoraFechamento(LocalDateTime.now());
        ocorrenciaRepository.save(ocorrencia);

        saveHistory(ocorrencia, statusAnterior, StatusOcorrencia.CANCELADA, "Chamado cancelado via console regulador. Motivo: " + justificativa);
        liberarAmbulancia(ocorrencia);
    }

    public OcorrenciaDetalhes getOcorrenciaDetalhes(Integer id) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id).orElse(null);
        if (ocorrencia == null) return null;

        Atendimento atendimento = atendimentoRepository.findFirstByOcorrenciaOrderByIdDesc(ocorrencia);

        Equipe equipe = null;
        if (atendimento != null && atendimento.getAmbulancia() != null) {
            equipe = equipeRepository.findFirstByAmbulancia(atendimento.getAmbulancia()).orElse(null);
        }

        List<OcorrenciaHistorico> historico = historicoRepository.findByOcorrenciaOrderByDataHoraDesc(ocorrencia);

        return new OcorrenciaDetalhes(ocorrencia, atendimento, equipe, historico);
    }

    public List<OcorrenciaHistorico> findHistoricoByOcorrenciaId(Integer id) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ocorrencia invalida."));
        return historicoRepository.findByOcorrenciaOrderByDataHoraDesc(ocorrencia);
    }

    private void saveHistory(Ocorrencia ocorrencia, StatusOcorrencia anterior, StatusOcorrencia novo, String descricao) {
        OcorrenciaHistorico historico = new OcorrenciaHistorico();
        historico.setOcorrencia(ocorrencia);
        historico.setStatusAnterior(anterior);
        historico.setStatusNovo(novo);
        historico.setDataHora(LocalDateTime.now());
        historico.setObservacao(descricao);
        historicoRepository.save(historico);
    }

    private void liberarAmbulancia(Ocorrencia ocorrencia) {
        Atendimento atendimento = atendimentoRepository.findFirstByOcorrenciaOrderByIdDesc(ocorrencia);
        if (atendimento != null) {
            Ambulancia ambulancia = atendimento.getAmbulancia();
            if (ambulancia != null) {
                equipeRepository.findFirstByAmbulancia(ambulancia).ifPresent(equipe -> {
                    equipe.setStatus(StatusEquipe.DISPONIVEL);
                    equipeRepository.save(equipe);
                    logger.info("Equipe ID {} vinculada a Ambulancia retornou ao status DISPONIVEL.", equipe.getId());
                });

                ambulancia.setStatus(StatusAmbulancia.DISPONIVEL);
                ambulanciaRepository.save(ambulancia);
                logger.info("Recurso Prefixo {} desalocado e reposicionado na sua base operacional.", ambulancia.getId());
            }
        }
    }

    @Transactional
    public Ocorrencia confirmarSaida(Integer id) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ocorrencia nao encontrada."));

        if (StatusOcorrencia.DESPACHADA != ocorrencia.getStatus()) {
            throw new IllegalStateException("Apenas ocorrencias DESPACHADAS podem ter saida confirmada.");
        }

        StatusOcorrencia statusAnterior = ocorrencia.getStatus();
        ocorrencia.setStatus(StatusOcorrencia.EM_ATENDIMENTO);
        Ocorrencia saved = ocorrenciaRepository.save(ocorrencia);
        saveHistory(saved, statusAnterior, StatusOcorrencia.EM_ATENDIMENTO, "Saida da viatura confirmada pelo operador.");
        logger.info("Ocorrencia {} transitou de DESPACHADA para EM_ATENDIMENTO.", id);
        return saved;
    }

    @Transactional
    public Ocorrencia finishOccurrence(Integer id) {
        logger.info("Tentando concluir Ocorrencia {}", id);

        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ocorrencia nao encontrada com o ID fornecido."));

        boolean podeFechar = StatusOcorrencia.DESPACHADA.equals(ocorrencia.getStatus())
                || StatusOcorrencia.EM_ATENDIMENTO.equals(ocorrencia.getStatus());

        if (podeFechar) {
            StatusOcorrencia oldStatus = ocorrencia.getStatus();

            ocorrencia.setStatus(StatusOcorrencia.CONCLUIDA);
            ocorrencia.setDataHoraFechamento(LocalDateTime.now());

            Ocorrencia saved = ocorrenciaRepository.save(ocorrencia);

            saveHistory(saved, oldStatus, StatusOcorrencia.CONCLUIDA, "Atendimento de emergencia concluido com sucesso pelas equipes de rua.");

            logger.info("Ocorrencia {} concluida operacionalmente com sucesso.", id);

            liberarAmbulancia(saved);

            return saved;
        } else {
            logger.error("Falha ao concluir. Ocorrencia {} possui status invalido: {}", id, ocorrencia.getStatus());
            throw new IllegalStateException("Nao e possivel finalizar um chamado que nao esteja DESPACHADO ou EM_ATENDIMENTO.");
        }
    }
}