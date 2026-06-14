package com.vitalistech.sosrotas.dto;

import java.util.List;
import com.vitalistech.sosrotas.model.Ocorrencia;

public class RelatorioResponse {
    private int totalResultados;
    private String filtrosAplicados;
    private List<Ocorrencia> ocorrencias;

    public RelatorioResponse(int totalResultados, String filtrosAplicados, List<Ocorrencia> ocorrencias) {
        this.totalResultados = totalResultados;
        this.filtrosAplicados = filtrosAplicados;
        this.ocorrencias = ocorrencias;
    }

    public int getTotalResultados() { 
        return totalResultados; 
    }
    public String getFiltrosAplicados() { 
        return filtrosAplicados; 
    }
    public List<Ocorrencia> getOcorrencias() { 
        return ocorrencias; 
    }
}