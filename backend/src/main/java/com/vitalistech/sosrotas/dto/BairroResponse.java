package com.vitalistech.sosrotas.dto;

import com.vitalistech.sosrotas.model.Bairro;

public class BairroResponse {

    private Integer id;
    private String nome;

    public BairroResponse() {}

    // Construtor que converte a entidade para a resposta da API
    public BairroResponse(Bairro bairro) {
        this.id = bairro.getId();
        this.nome = bairro.getNome();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}