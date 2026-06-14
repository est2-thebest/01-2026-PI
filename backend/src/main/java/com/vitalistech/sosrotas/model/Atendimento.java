package com.vitalistech.sosrotas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidade que registra o atendimento transacional de uma ocorrência por uma ambulância.
 * Resolve o relacionamento N:M armazenando métricas de roteamento e SLA obtidas via Dijkstra.
 */
@Entity
@Table(name = "atendimentos")
public class Atendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "ocorrencia_id")
    private Ocorrencia ocorrencia;

    @ManyToOne
    @JoinColumn(name = "ambulancia_id")
    private Ambulancia ambulancia;

    @Column(name = "data_hora_despacho")
    private LocalDateTime dataHoraDespacho;

    @Column(name = "data_hora_chegada")
    private LocalDateTime dataHoraChegada;

    @Column(name = "distancia_km")
    private Double distanciaKm;

    @Column(name = "tempo_estimado")
    private Double tempoEstimado;

    @Column(name = "rota", columnDefinition = "TEXT")
    private String rota;

    @Column(name = "fora_do_sla")
    private Boolean foraDoSla;

    @Column(name = "sla_previsto")
    private Double slaPrevisto;

    public Atendimento() {
    }

    public Atendimento(Integer id, Ocorrencia ocorrencia, Ambulancia ambulancia, LocalDateTime dataHoraDespacho, 
                       LocalDateTime dataHoraChegada, Double distanciaKm, Double tempoEstimado, String rota, 
                       Boolean foraDoSla, Double slaPrevisto) {
        this.id = id;
        this.ocorrencia = ocorrencia;
        this.ambulancia = ambulancia;
        this.dataHoraDespacho = dataHoraDespacho;
        this.dataHoraChegada = dataHoraChegada;
        this.distanciaKm = distanciaKm;
        this.tempoEstimado = tempoEstimado;
        this.rota = rota;
        this.foraDoSla = foraDoSla;
        this.slaPrevisto = slaPrevisto;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Ocorrencia getOcorrencia() { return ocorrencia; }
    public void setOcorrencia(Ocorrencia ocorrencia) { this.ocorrencia = ocorrencia; }

    public Ambulancia getAmbulancia() { return ambulancia; }
    public void setAmbulancia(Ambulancia ambulancia) { this.ambulancia = ambulancia; }

    public LocalDateTime getDataHoraDespacho() { return dataHoraDespacho; }
    public void setDataHoraDespacho(LocalDateTime dataHoraDespacho) { this.dataHoraDespacho = dataHoraDespacho; }

    public LocalDateTime getDataHoraChegada() { return dataHoraChegada; }
    public void setDataHoraChegada(LocalDateTime dataHoraChegada) { this.dataHoraChegada = dataHoraChegada; }

    public Double getDistanciaKm() { return distanciaKm; }
    public void setDistanciaKm(Double distanciaKm) { this.distanciaKm = distanciaKm; }

    public Double getTempoEstimado() { return tempoEstimado; }
    public void setTempoEstimado(Double tempoEstimado) { this.tempoEstimado = tempoEstimado; }

    public String getRota() { return rota; }
    public void setRota(String rota) { this.rota = rota; }

    public Boolean getForaDoSla() { return foraDoSla; }
    public void setForaDoSla(Boolean foraDoSla) { this.foraDoSla = foraDoSla; }

    public Double getSlaPrevisto() { return slaPrevisto; }
    public void setSlaPrevisto(Double slaPrevisto) { this.slaPrevisto = slaPrevisto; }
}