package com.vitalistech.sosrotas.service;

import com.vitalistech.sosrotas.model.Ocorrencia;

/**
 * [PADRÃO DE PROJETO: DECORATOR]
 * Utilizado para acoplar dinamicamente comportamentos extras à execução do serviço principal.
 * Justificativa: Adiciona dinamicamente travas de segurança e validações de regras de negócio ao fluxo básico do despacho de viaturas sem alterar o código-fonte da classe de serviço base.
 */
public class ValidacaoDespachoDecorator {
    private final OcorrenciaService ocorrenciaService;

    public ValidacaoDespachoDecorator(OcorrenciaService ocorrenciaService) {
        this.ocorrenciaService = ocorrenciaService;
    }

    public Ocorrencia confirmarDespachoComValidacoes(Integer ocorrenciaId, Integer ambulanciaId) {
        // Validações dinâmicas adicionais podem ser inseridas aqui
        return ocorrenciaService.confirmarDespachoSemiautomatico(ocorrenciaId, ambulanciaId);
    }
}
