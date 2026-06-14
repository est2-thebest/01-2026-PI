package com.vitalistech.sosrotas.dto;

import com.vitalistech.sosrotas.model.Ambulancia;

public class AmbulanciaResponse {

    private Integer id;
    private String placa;
    private String tipo;
    private String status;
    private BairroResumo bairro;

    public AmbulanciaResponse() {}

    public AmbulanciaResponse(Ambulancia ambulancia) {
        this.id = ambulancia.getId();
        this.placa = ambulancia.getPlaca();
        this.tipo = ambulancia.getTipo() != null ? ambulancia.getTipo().name() : null;
        this.status = ambulancia.getStatus() != null ? ambulancia.getStatus().name() : null;
        if (ambulancia.getBairroBase() != null) {
            this.bairro = new BairroResumo(ambulancia.getBairroBase().getId(), ambulancia.getBairroBase().getNome());
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BairroResumo getBairro() { return bairro; }
    public void setBairro(BairroResumo bairro) { this.bairro = bairro; }

    public static class BairroResumo {
        private Integer id;
        private String nome;

        public BairroResumo() {}
        public BairroResumo(Integer id, String nome) { this.id = id; this.nome = nome; }

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
    }
}