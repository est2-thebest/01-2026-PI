package com.vitalistech.sosrotas.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;

@Entity
@Table(name = "distancias_bairros")
@Schema(description = "Mapeia a matriz de tempo de resposta estimado entre as bases das ambulâncias e os bairros da cidade")
public class DistanciaBairro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "bairro_origem_id")
    @Schema(description = "ID do Bairro onde a Ambulância está baseada")
    private Bairro bairroOrigem;

    @ManyToOne
    @JoinColumn(name = "bairro_destino_id")
    @Schema(description = "ID do Bairro onde o acidente aconteceu")
    private Bairro bairroDestino;

    @Column(name = "tempo_estimado_minutos")
    @Schema(description = "Tempo estimado em minutos fixos para o trajeto", example = "8")
    private Integer tempoEstimadoMinutos;

    public DistanciaBairro() {}

    public DistanciaBairro(Long id, Bairro bairroOrigem, Bairro bairroDestino, Integer tempoEstimadoMinutos) {
        this.id = id;
        this.bairroOrigem = bairroOrigem;
        this.bairroDestino = bairroDestino;
        this.tempoEstimadoMinutos = tempoEstimadoMinutos;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Bairro getBairroOrigem() { return bairroOrigem; }
    public void setBairroOrigem(Bairro bairroOrigem) { this.bairroOrigem = bairroOrigem; }

    public Bairro getBairroDestino() { return bairroDestino; }
    public void setBairroDestino(Bairro bairroDestino) { this.bairroDestino = bairroDestino; }

    public Integer getTempoEstimadoMinutos() { return tempoEstimadoMinutos; }
    public void setTempoEstimadoMinutos(Integer tempoEstimadoMinutos) { this.tempoEstimadoMinutos = tempoEstimadoMinutos; }
}