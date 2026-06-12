package com.vitalistech.sosrotas.geraRelatorios;

/**
 * [PADRÃO DE PROJETO: FACTORY METHOD]
 * Provido através de interfaces de fabricação abstrata para emissão de relatórios gerenciais.
 * Justificativa: Desacopla o controlador de relatórios das implementações físicas (PDF, CSV), delegando às subclasses a responsabilidade de instanciar o gerador correto.
 */

public abstract interface RelatorioFactory {
    byte[] criarRelatorio();
}