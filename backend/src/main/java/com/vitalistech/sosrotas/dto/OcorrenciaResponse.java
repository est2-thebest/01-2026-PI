package com.vitalistech.sosrotas.dto;

import com.vitalistech.sosrotas.model.Ocorrencia;
import java.time.LocalDateTime;

public class OcorrenciaResponse {

    private Integer id;
    private String tipo;
    private String gravidade;
    private String status;
    private Integer bairroId;
    private String bairroNome;
    private LocalDateTime dataHoraAbertura;
    private LocalDateTime dataHoraFechamento;
    private String observacao;

    public OcorrenciaResponse() {}

    // Construtor de conveniência para converter a Entidade no DTO de Saída
    public OcorrenciaResponse(Ocorrencia ocorrencia) {
        this.id = ocorrencia.getId();
        this.tipo = ocorrencia.getTipo();
        this.gravidade = ocorrencia.getGravidade() != null ? ocorrencia.getGravidade().name() : null;
        this.status = ocorrencia.getStatus() != null ? ocorrencia.getStatus().name() : null;
        this.dataHoraAbertura = ocorrencia.getDataHoraAbertura();
        this.dataHoraFechamento = ocorrencia.getDataHoraFechamento();
        this.observacao = ocorrencia.getObservacao();
        
        if (ocorrencia.getBairro() != null) {
            this.bairroId = ocorrencia.getBairro().getId();
            this.bairroNome = ocorrencia.getBairro().getNome();
        }
    }

    // Getters e Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getGravidade() { return gravidade; }
    public void setGravidade(String gravidade) { this.gravidade = gravidade; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getBairroId() { return bairroId; }
    public void setBairroId(Integer bairroId) { this.bairroId = bairroId; }

    public String getBairroNome() { return bairroNome; }
    public void setBairroNome(String bairroNome) { this.bairroNome = bairroNome; }

    public LocalDateTime getDataHoraAbertura() { return dataHoraAbertura; }
    public void setDataHoraAbertura(LocalDateTime dataHoraAbertura) { this.dataHoraAbertura = dataHoraAbertura; }

    public LocalDateTime getDataHoraFechamento() { return dataHoraFechamento; }
    public void setDataHoraFechamento(LocalDateTime dataHoraFechamento) { this.dataHoraFechamento = dataHoraFechamento; }

    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}