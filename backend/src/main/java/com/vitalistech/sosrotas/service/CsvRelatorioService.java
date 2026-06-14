package com.vitalistech.sosrotas.service;

import org.springframework.stereotype.Service;
import com.vitalistech.sosrotas.geraRelatorios.RelatorioFactory;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * [PADRÃO DE PROJETO: FACTORY METHOD]
 * Implementação concreta do RelatorioFactory para geração de relatórios em formato CSV.
 * Justificativa: Fornece uma implementação específica para CSV, permitindo que o controlador de relatórios permaneça desacoplado das particularidades de formatação e geração do arquivo.
 */

@Service
public class CsvRelatorioService implements RelatorioFactory {

    private final RelatorioService relatorioService;

    public CsvRelatorioService(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @Override
    public byte[] criarRelatorio() {
        List<Object[]> dados = relatorioService.getAtendimentosPorBairro();
        StringBuilder csv = new StringBuilder();
        csv.append("Bairro,Quantidade_Atendimentos\n");
        
        if (dados != null) {
            for (Object[] linha : dados) {
                csv.append(linha[0]).append(",").append(linha[1]).append("\n");
            }
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }
}