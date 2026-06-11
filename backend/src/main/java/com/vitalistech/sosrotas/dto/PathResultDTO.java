package com.vitalistech.sosrotas.dto;

import java.util.List;

/**
 * [PADRÃO DE PROJETO: ADAPTER]
 * Implementado através da camada DTO (Data Transfer Object).
 * Justificativa: Converte os dados complexos das entidades relacionais do backend para um formato JSON simplificado e compatível com a API de mapas do Frontend React.
 */
public class PathResultDTO {
    private List<String> caminho;
    private double distanciaTotal;
    private double tempoEstimado;

    public PathResultDTO() {}

    public PathResultDTO(List<String> caminho, double distanciaTotal, double tempoEstimado) {
        this.caminho = caminho;
        this.distanciaTotal = distanciaTotal;
        this.tempoEstimado = tempoEstimado;
    }

    public List<String> getCaminho() {
        return caminho;
    }

    public void setCaminho(List<String> caminho) {
        this.caminho = caminho;
    }

    public double getDistanciaTotal() {
        return distanciaTotal;
    }

    public void setDistanciaTotal(double distanciaTotal) {
        this.distanciaTotal = distanciaTotal;
    }

    public double getTempoEstimado() {
        return tempoEstimado;
    }

    public void setTempoEstimado(double tempoEstimado) {
        this.tempoEstimado = tempoEstimado;
    }
}
