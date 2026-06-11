package com.vitalistech.sosrotas.model;

import com.vitalistech.sosrotas.model.enums.GravidadeOcorrencia;
import com.vitalistech.sosrotas.model.enums.StatusOcorrencia;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidade que representa unha ocorrencia de emerxencia.
 * Despacho automático guiado polo algoritmo de Dijkstra.
 */
@Entity
@Table(name = "ocorrencias")
@Schema(description = "Modelo de datos estruturado para chamados de emerxencia")
public class Ocorrencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Identificador único xerado polo banco de dados", example = "1")
    private Integer id;

    @Schema(description = "Tipo ou natureza do chamado", example = "Parada Cardiorrespiratória")
    private String tipo;
    
    @Enumerated(EnumType.STRING)
    @Schema(description = "Nivel de gravidade que dita as políticas de SLA")
    private GravidadeOcorrencia gravidade;

    @ManyToOne
    @JoinColumn(name = "bairro_id")
    @Schema(description = "Vínculo xeográfico do incidente")
    private Bairro bairro;

    @Column(name = "data_hora_abertura")
    @Schema(description = "Estampa de tempo do rexistro de entrada")
    private LocalDateTime dataHoraAbertura;

    @Enumerated(EnumType.STRING)
    @Schema(description = "Estado actual do ciclo de vida do chamado")
    private StatusOcorrencia status;
    
    @Column(name = "data_hora_fechamento")
    @Schema(description = "Estampa de tempo da resolución ou cancelación")
    private LocalDateTime dataHoraFechamento;

    @Schema(description = "Detalles clínicos ou operativos adicionais", example = "Paciente inconsciente no chan")
    private String observacao;

    public Ocorrencia() {
    }

    public Ocorrencia(Integer id, String tipo, GravidadeOcorrencia gravidade, Bairro bairro, 
                      LocalDateTime dataHoraAbertura, StatusOcorrencia status, 
                      LocalDateTime dataHoraFechamento, String observacao) {
        this.id = id;
        this.tipo = tipo;
        this.gravidade = gravidade;
        this.bairro = bairro;
        this.dataHoraAbertura = dataHoraAbertura;
        this.status = status;
        this.dataHoraFechamento = dataHoraFechamento;
        this.observacao = observacao;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public GravidadeOcorrencia getGravidade() { return gravidade; }
    public void setGravidade(GravidadeOcorrencia gravidade) { this.gravidade = gravidade; }

    public Bairro getBairro() { return bairro; }
    public void setBairro(Bairro bairro) { this.bairro = bairro; }

    public LocalDateTime getDataHoraAbertura() { return dataHoraAbertura; }
    public void setDataHoraAbertura(LocalDateTime dataHoraAbertura) { this.dataHoraAbertura = dataHoraAbertura; }

    public StatusOcorrencia getStatus() { return status; }
    public void setStatus(StatusOcorrencia status) { this.status = status; }

    public LocalDateTime getDataHoraFechamento() { return dataHoraFechamento; }
    public void setDataHoraFechamento(LocalDateTime dataHoraFechamento) { this.dataHoraFechamento = dataHoraFechamento; }

    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}