package com.vitalistech.sosrotas.dto;

import com.vitalistech.sosrotas.model.enums.GravidadeOcorrencia;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO de entrada para abertura e triagem de uma nova ocorrência de emergência")
public class OcorrenciaRequest {

    @Schema(description = "Natureza clínica ou traumática do chamado", example = "Parada Cardiorrespiratória")
    private String tipo;

    @Schema(description = "Nível de gravidade que dita as prioridades de SLA regulamentar")
    private GravidadeOcorrencia gravidade;

    @Schema(description = "ID do bairro onde o incidente está ocorrendo (Mapeamento estável de 1 a 20)", example = "4")
    private Integer bairroId;

    @Schema(description = "Detalhes clínicos ou observações adicionais coletadas pelo atendente", example = "Paciente idoso caído na via pública")
    private String observacao;

    public OcorrenciaRequest() {}

    public OcorrenciaRequest(String tipo, GravidadeOcorrencia gravidade, Integer bairroId, String observacao) {
        this.tipo = tipo;
        this.gravidade = gravidade;
        this.bairroId = bairroId;
        this.observacao = observacao;
    }

    // Getters e Setters
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public GravidadeOcorrencia getGravidade() { return gravidade; }
    public void setGravidade(GravidadeOcorrencia gravidade) { this.gravidade = gravidade; }

    public Integer getBairroId() { return bairroId; }
    public void setBairroId(Integer bairroId) { this.bairroId = bairroId; }

    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}