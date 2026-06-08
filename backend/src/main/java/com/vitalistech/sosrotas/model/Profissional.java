package com.vitalistech.sosrotas.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.vitalistech.sosrotas.model.enums.FuncaoProfissional;
import com.vitalistech.sosrotas.model.enums.Turno;

import jakarta.persistence.*;

@Entity
@Table(name = "profissionais")
public class Profissional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nome;

    private String contato;

    private Boolean ativo;

    @Enumerated(EnumType.STRING)
    private FuncaoProfissional funcao;

    @Enumerated(EnumType.STRING)
    private Turno turno;

    public Profissional() {
    }

    public Profissional(
            Integer id,
            String nome,
            String contato,
            Boolean ativo,
            FuncaoProfissional funcao,
            Turno turno) {

        this.id = id;
        this.nome = nome;
        this.contato = contato;
        this.ativo = ativo;
        this.funcao = funcao;
        this.turno = turno;
    }

    // getters e setters

    public Integer getId() {
        return id;
    }

    /** Ignorado na desserialização — ID é sempre gerado pelo banco. */
    @JsonIgnore
    public void setId(Integer id) {
        // ID é gerenciado pelo banco; não permite sobrescrita via JSON
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getContato() {
        return contato;
    }

    public void setContato(String contato) {
        this.contato = contato;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public FuncaoProfissional getFuncao() {
        return funcao;
    }

    public void setFuncao(FuncaoProfissional funcao) {
        this.funcao = funcao;
    }

    public Turno getTurno() {
        return turno;
    }

    public void setTurno(Turno turno) {
        this.turno = turno;
    }
}