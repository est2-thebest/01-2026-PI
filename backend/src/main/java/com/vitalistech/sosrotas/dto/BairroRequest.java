package com.vitalistech.sosrotas.dto;

public class BairroRequest {

    private Integer id; // Obrigatório para bater com o mapeamento 1-20 do SVG
    private String nome;

    public BairroRequest() {}

    public BairroRequest(Integer id, String nome) {
        this.id = id;
        this.nome = nome;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}