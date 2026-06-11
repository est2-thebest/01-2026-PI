package com.vitalistech.sosrotas.dto;

public class AmbulanciaOpcao {
    private Integer id;
    private String placa;
    private String tipo;
    private String bairroBase;
    private Integer tempoEstimado;

    public AmbulanciaOpcao() {}

    public AmbulanciaOpcao(Integer id, String placa, String tipo, String bairroBase, Integer tempoEstimado) {
        this.id = id;
        this.placa = placa;
        this.tipo = tipo;
        this.bairroBase = bairroBase;
        this.tempoEstimado = tempoEstimado;
    }

    // Getters e Setters tradicionais
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getBairroBase() { return bairroBase; }
    public void setBairroBase(String bairroBase) { this.bairroBase = bairroBase; }
    public Integer getTempoEstimado() { return tempoEstimado; }
    public void setTempoEstimado(Integer tempoEstimado) { this.tempoEstimado = tempoEstimado; }
}