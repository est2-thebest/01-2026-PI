package com.vitalistech.sosrotas.dto;

import com.vitalistech.sosrotas.model.enums.StatusAmbulancia;
import com.vitalistech.sosrotas.model.enums.TipoAmbulancia;

public class AmbulanciaRequest {

    private String placa;
    private TipoAmbulancia tipo;
    private StatusAmbulancia status;
    private Integer bairroBaseId; // Recebe apenas o ID do bairro do Frontend

    public AmbulanciaRequest() {}

    public AmbulanciaRequest(String placa, TipoAmbulancia tipo, StatusAmbulancia status, Integer bairroBaseId) {
        this.placa = placa;
        this.tipo = tipo;
        this.status = status;
        this.bairroBaseId = bairroBaseId;
    }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public TipoAmbulancia getTipo() { return tipo; }
    public void setTipo(TipoAmbulancia tipo) { this.tipo = tipo; }

    public StatusAmbulancia getStatus() { return status; }
    public void setStatus(StatusAmbulancia status) { this.status = status; }

    public Integer getBairroBaseId() { return bairroBaseId; }
    public void setBairroBaseId(Integer bairroBaseId) { this.bairroBaseId = bairroBaseId; }
}