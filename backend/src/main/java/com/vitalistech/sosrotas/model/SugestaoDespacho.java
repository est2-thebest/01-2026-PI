package com.vitalistech.sosrotas.model;

import java.util.List;

import com.vitalistech.sosrotas.dto.AmbulanciaOpcao;

public class SugestaoDespacho {
    private Ocorrencia ocorrencia;
    private AmbulanciaOpcao ambulanciaRecomendada;
    private List<AmbulanciaOpcao> outrasOpcoesDisponiveis;

    public SugestaoDespacho() {}

    public SugestaoDespacho(Ocorrencia ocorrencia, AmbulanciaOpcao ambulanciaRecomendada, List<AmbulanciaOpcao> outrasOpcoesDisponiveis) {
        this.ocorrencia = ocorrencia;
        this.ambulanciaRecomendada = ambulanciaRecomendada;
        this.outrasOpcoesDisponiveis = outrasOpcoesDisponiveis;
    }

    public Ocorrencia getOcorrencia() { 
        return ocorrencia; 
    }
    public void setOcorrencia(Ocorrencia ocorrencia) { 
        this.ocorrencia = ocorrencia; 
    }
    public AmbulanciaOpcao getAmbulanciaRecomendada() { 
        return ambulanciaRecomendada; 
    }
    public void setAmbulanciaRecomendada(AmbulanciaOpcao ambulanciaRecomendada) { 
        this.ambulanciaRecomendada = ambulanciaRecomendada; 
    }
    public List<AmbulanciaOpcao> getOutrasOpcoesDisponiveis() { 
        return outrasOpcoesDisponiveis; 
    }
    public void setOutrasOpcoesDisponiveis(List<AmbulanciaOpcao> outrasOpcoesDisponiveis) { 
        this.outrasOpcoesDisponiveis = outrasOpcoesDisponiveis; 
    }
}