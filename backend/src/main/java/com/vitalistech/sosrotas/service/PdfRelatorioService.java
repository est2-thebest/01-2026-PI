package com.vitalistech.sosrotas.service;

import org.springframework.stereotype.Service;
import com.vitalistech.sosrotas.geraRelatorios.RelatorioFactory;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import java.io.ByteArrayOutputStream;
import java.util.List;


/**
 * [PADRÃO DE PROJETO: FACTORY METHOD]
 * Implementação concreta do RelatorioFactory para geração de relatórios em formato PDF.
 * Justificativa: Fornece uma implementação específica para PDF, permitindo que o controlador de relatórios permaneça desacoplado das particularidades de formatação e geração do arquivo.
 */

@Service
public class PdfRelatorioService implements RelatorioFactory {

    private final RelatorioService relatorioService;

    public PdfRelatorioService(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @Override
    public byte[] criarRelatorio() {
        List<Object[]> dados = relatorioService.getAtendimentosPorBairro();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            // Título
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            document.add(new Paragraph("SOS Rotas - Relatorio Gerencial de Atendimentos", titleFont));
            document.add(new Paragraph(" "));

            // Tabela
            PdfPTable tabela = new PdfPTable(2);
            tabela.setWidthPercentage(100);
            tabela.setWidths(new float[]{3f, 1.5f}); // proporcao das colunas

            // Cabeçalho
            tabela.addCell(new Phrase("BAIRRO OPERACIONAL"));
            tabela.addCell(new Phrase("TOTAL DE OCORRENCIAS"));

            // Dados
            if (dados != null && !dados.isEmpty()) {
                for (Object[] linha : dados) {
                    tabela.addCell(linha[0] != null ? linha[0].toString() : "N/A");
                    tabela.addCell(linha[1] != null ? linha[1].toString() : "0");
                }
            } else {
                tabela.addCell("Nenhum dado encontrado");
                tabela.addCell("-");
            }

            document.add(tabela);

        } catch (Exception e) {
            throw new RuntimeException("Erro ao construir PDF: " + e.getMessage(), e);
        } finally {
            // Garante fechamento mesmo se houver exception
            if (document.isOpen()) {
                document.close();
            }
        }

        return out.toByteArray();
    }
}  
