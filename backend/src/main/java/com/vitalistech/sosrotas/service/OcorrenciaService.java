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

        // Busca o bairro de 1 a 20 de forma segura para não quebrar o mapa SVG
        if (dto.getBairroId() != null) {
            Bairro bairro = bairroRepository.findById(dto.getBairroId())
                    .orElseThrow(() -> new RuntimeException("Bairro destino não localizado no mapa operacional."));
            ocorrencia.setBairro(bairro);
        }

        // Configurações automáticas de auditoria do sistema (O Frontend não dita isso)
        ocorrencia.setStatus(StatusOcorrencia.ABERTA);
        ocorrencia.setDataHoraAbertura(LocalDateTime.now());
        
        Ocorrencia saved = ocorrenciaRepository.save(ocorrencia);

        logger.info("Chamado registrado no barramento de emergências. ID: {}", saved.getId());
        saveHistory(saved, null, StatusOcorrencia.ABERTA, "Chamado de emergência classificado e aberto no sistema");

        return saved;
    }

    /**
     * Calcula e ordena os tempos de resposta usando o DTO limpo 'AmbulanciaOpcao'
     */
    public SugestaoDespacho calcularSugestaoDespacho(Integer ocorrenciaId) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(ocorrenciaId)
                .orElseThrow(() -> new RuntimeException("Ocorrência não encontrada"));

        Integer bairroDestinoId = ocorrencia.getBairro().getId();
        
        // Busca viaturas que possuem o Enum de disponíveis
        List<Ambulancia> disponiveis = ambulanciaRepository.findByStatus(StatusAmbulancia.DISPONIVEL);
        
        List<AmbulanciaOpcao> opcoes = new ArrayList<>();

        for (Ambulancia amb : disponiveis) {
            if (amb.getBairroBase() == null) {
                logger.warn("Aviso: Ambulância ID {} não possui Bairro Base vinculado.", amb.getId());
                continue;
            }
            
            Integer bairroOrigemId = amb.getBairroBase().getId();
            
            Integer tempo = distanciaBairroRepository.findTempoEntreBairros(bairroOrigemId, bairroDestinoId)
                    .map(DistanciaBairro::getTempoEstimadoMinutos)
                    .orElse(99); 

            // CORRIGIDO: Proteção de tipo (.toString() para Enums e garantia de Integer)
            opcoes.add(new AmbulanciaOpcao(
                    amb.getId(), 
                    amb.getPlaca(), 
                    amb.getTipo() != null ? amb.getTipo().toString() : null, 
                    amb.getBairroBase().getNome(), 
                    tempo
            ));
        }

        // Ordena pelo menor tempo estimado
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

    /**
     * Confirma o despacho operacional ajustando o cálculo do SLA de forma segura
     */
    @Transactional
    public Ocorrencia confirmarDespachoSemiautomatico(Integer ocorrenciaId, Integer ambulanciaId) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(ocorrenciaId)
                .orElseThrow(() -> new RuntimeException("Ocorrência inválida"));
                
        Ambulancia ambulancia = ambulanciaRepository.findById(ambulanciaId)
                .orElseThrow(() -> new RuntimeException("Ambulância inválida"));

        // Validação utilizando a tipagem forte do Enum de Ambulâncias
        if (StatusAmbulancia.DISPONIVEL != ambulancia.getStatus()) {
            throw new IllegalStateException("Esta viatura não está mais livre para alocação.");
        }

        // Sincroniza o status da equipe vinculada para EM_ATENDIMENTO (Pedido do Front)
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

        // Tratamento adaptável e seguro para a Gravidade do Chamado
        double slaPrevistoMinutos = 15.0;
        if (ocorrencia.getGravidade() != null) {
            String gravidadeString = String.valueOf(ocorrencia.getGravidade()).toUpperCase();
            switch (gravidadeString) {
                case "ALTA":
                    slaPrevistoMinutos = 8.0;
                    break;
                case "MEDIA":
                case "MÉDIA":
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

        logger.info("Despacho verificado. Viatura Prefixo {} encaminhada para Ocorrência {}", ambulancia.getId(), ocorrencia.getId());
        saveHistory(ocorrenciaSalva, statusAnterior, StatusOcorrencia.DESPACHADA, "Viatura Prefixo " + ambulancia.getId() + " despachada manualmente pelo operador.");
        
        return ocorrenciaSalva;
    }

    @Transactional
    public void cancelOccurrence(Integer id, String justificativa) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ocorrência não mapeada no banco de dados."));

        if (StatusOcorrencia.CONCLUIDA == ocorrencia.getStatus() || StatusOcorrencia.CANCELADA == ocorrencia.getStatus()) {
            throw new IllegalStateException("Regra de Negócio: Não é permitido alterar chamados já finalizados.");
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
                .orElseThrow(() -> new RuntimeException("Ocorrência inválida."));
        return historicoRepository.findByOcorrenciaOrderByDataHoraDesc(ocorrencia);
    }

    /**
     * Salva o registro de auditoria respeitando os Enums exigidos pela OcorrenciaHistorico
     */
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
                ambulancia.setStatus(StatusAmbulancia.DISPONIVEL);
                ambulanciaRepository.save(ambulancia);
                logger.info("Recurso Prefixo {} desalocado e reposicionado na sua base operacional.", ambulancia.getId());
            }
        }
    }

    /**
     * Finaliza a ocorrência e libera a ambulância.
     *
     * @param id Identificador da ocorrência
     * @return A entidade Ocorrencia updated
     * [RF06] Conclusão de ciclo de vida.
     */
    @Transactional
    public Ocorrencia finishOccurrence(Integer id) {
        logger.info("Tentando concluir Ocorrencia {}", id);
        
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ocorrência não encontrada com o ID fornecido."));

        // CORRIGIDO: Ocorrências em andamento usam o status DESPACHADA no seu sistema
        if (StatusOcorrencia.DESPACHADA.equals(ocorrencia.getStatus())) {
            StatusOcorrencia oldStatus = ocorrencia.getStatus();
            
            ocorrencia.setStatus(StatusOcorrencia.CONCLUIDA);
            ocorrencia.setDataHoraFechamento(LocalDateTime.now());
            
            Ocorrencia saved = ocorrenciaRepository.save(ocorrencia);
            
            // Grava na tabela de auditoria sequencial
            saveHistory(saved, oldStatus, StatusOcorrencia.CONCLUIDA, "Atendimento de emergência concluído com sucesso pelas equipes de rua.");
            
            logger.info("Ocorrencia {} concluída operacionalmente com sucesso.", id);

            // Sincroniza o status da equipe de volta para DISPONIVEL ao finalizar o chamado
            Atendimento atendimento = atendimentoRepository.findFirstByOcorrenciaOrderByIdDesc(saved);
            if (atendimento != null && atendimento.getAmbulancia() != null) {
                equipeRepository.findFirstByAmbulancia(atendimento.getAmbulancia()).ifPresent(equipe -> {
                    equipe.setStatus(StatusEquipe.DISPONIVEL);
                    equipeRepository.save(equipe);
                    logger.info("Equipe ID {} retornou ao status DISPONIVEL.", equipe.getId());
                });
            }

            // CORRIGIDO: Usando o método real 'liberarAmbulancia' que já existe na sua service
            liberarAmbulancia(saved);
            
            return saved;
        } else {
            logger.error("Falha ao concluir. Ocorrencia {} possui status inválido: {}", id, ocorrencia.getStatus());
            throw new IllegalStateException("Não é possível finalizar um chamado que não esteja com status ativo DESPACHADA.");
        }
    }
}