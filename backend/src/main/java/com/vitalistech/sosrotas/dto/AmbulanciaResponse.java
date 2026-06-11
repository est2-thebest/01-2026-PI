package com.vitalistech.sosrotas.dto;

import com.vitalistech.sosrotas.model.Ambulancia;

public class AmbulanciaResponse {

    private Integer id;
    private String placa;
    private String tipo;
    private String status;
    private Integer bairroId;
    private String bairroNome;

    public AmbulanciaResponse() {}

    // Construtor de conveniência que mapeia diretamente a Entidade para o DTO de saída
    public AmbulanciaResponse(Ambulancia ambulancia) {
        this.id = ambulancia.getId();
        this.placa = ambulancia.getPlaca();
        this.tipo = ambulancia.getTipo() != null ? ambulancia.getTipo().name() : null;
        this.status = ambulancia.getStatus() != null ? ambulancia.getStatus().name() : null;
        if (ambulancia.getBairroBase() != null) {
            this.bairroId = ambulancia.getBairroBase().getId();
            this.bairroNome = ambulancia.getBairroBase().getNome();
        }
    }

    // Getters e Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getBairroId() { return bairroId; }
    public void setBairroId(Integer bairroId) { this.bairroId = bairroId; }
    public String getBairroNome() { return bairroNome; }
    public void setBairroNome(String bairroNome) { this.bairroNome = bairroNome; }
}