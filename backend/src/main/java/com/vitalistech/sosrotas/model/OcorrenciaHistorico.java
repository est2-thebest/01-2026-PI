package com.vitalistech.sosrotas.model;

import com.vitalistech.sosrotas.model.enums.StatusOcorrencia;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidade de auditoria para rastreabilidade de transicións de estados das ocorrencias.
 */
@Entity
@Table(name = "ocorrencias_historico")
@Schema(description = "Rexistro cronolóxico de auditoria de estados da ocorrencia")
public class OcorrenciaHistorico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "ocorrencia_id")
    private Ocorrencia ocorrencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_anterior")
    private StatusOcorrencia statusAnterior;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_novo")
    private StatusOcorrencia statusNovo;

    @Column(name = "data_hora")
    private LocalDateTime dataHora;

    private String observacao;

    public OcorrenciaHistorico() {
    }

    public OcorrenciaHistorico(Integer id, Ocorrencia ocorrencia, StatusOcorrencia statusAnterior, 
                               StatusOcorrencia statusNovo, LocalDateTime dataHora, String observacao) {
        this.id = id;
        this.ocorrencia = ocorrencia;
        this.statusAnterior = statusAnterior;
        this.statusNovo = statusNovo;
        this.dataHora = dataHora;
        this.observacao = observacao;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Ocorrencia getOcorrencia() { return ocorrencia; }
    public void setOcorrencia(Ocorrencia ocorrencia) { this.ocorrencia = ocorrencia; }

    public StatusOcorrencia getStatusAnterior() { return statusAnterior; }
    public void setStatusAnterior(StatusOcorrencia statusAnterior) { this.statusAnterior = statusAnterior; }

    public StatusOcorrencia getStatusNovo() { return statusNovo; }
    public void setStatusNovo(StatusOcorrencia statusNovo) { this.statusNovo = statusNovo; }

    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }

    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}