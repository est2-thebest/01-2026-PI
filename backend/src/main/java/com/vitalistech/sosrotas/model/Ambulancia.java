package com.vitalistech.sosrotas.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.vitalistech.sosrotas.model.enums.*;
import jakarta.persistence.*;

@Entity
@Table(name = "ambulancias")
public class Ambulancia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String placa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoAmbulancia tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAmbulancia status;

    @ManyToOne
    @JoinColumn(name = "bairro_id")
    private Bairro bairro;

    public Ambulancia() {
    }

    public Ambulancia(
            Integer id,
            String placa,
            TipoAmbulancia tipo,
            StatusAmbulancia status,
            Bairro bairro) {

        this.id = id;
        this.placa = placa;
        this.tipo = tipo;
        this.status = status;
        this.bairro = bairro;
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

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public TipoAmbulancia getTipo() {
        return tipo;
    }

    public void setTipo(TipoAmbulancia tipo) {
        this.tipo = tipo;
    }

    public StatusAmbulancia getStatus() {
        return status;
    }

    public void setStatus(StatusAmbulancia status) {
        this.status = status;
    }

    public Bairro getBairro() {
        return bairro;
    }

    public void setBairro(Bairro bairro) {
        this.bairro = bairro;
    }
}