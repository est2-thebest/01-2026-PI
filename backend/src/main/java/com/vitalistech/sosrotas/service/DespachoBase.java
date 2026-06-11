package com.vitalistech.sosrotas.service;

import com.vitalistech.sosrotas.model.Ambulancia;
import com.vitalistech.sosrotas.model.Ocorrencia;

/**
 * [PADRÃO DE PROJETO: TEMPLATE METHOD]
 * Estruturado através de uma classe base com passos predefinidos.
 * Justificativa: Fixa a ordem de execução do fluxo de despacho emergencial, deixando que subclasses especializadas customizem apenas o método primitivo de checagem do SLA de tempo por gravidade.
 */
public abstract class DespachoBase {

    public final void executarDespacho(Ocorrencia ocorrencia, Ambulancia ambulancia) {
        buscarViatura(ambulancia);
        calcularRota(ocorrencia, ambulancia);
        validarSla(ocorrencia, ambulancia);
        gravarRegistro(ocorrencia, ambulancia);
    }

    private void buscarViatura(Ambulancia ambulancia) {
        // Fluxo comum: busca de viatura no sistema
    }

    private void calcularRota(Ocorrencia ocorrencia, Ambulancia ambulancia) {
        // Fluxo comum: cálculo de rotas e distância
    }

    protected abstract boolean validarSla(Ocorrencia ocorrencia, Ambulancia ambulancia);

    private void gravarRegistro(Ocorrencia ocorrencia, Ambulancia ambulancia) {
        // Fluxo comum: gravação de histórico de auditoria
    }
}
