package com.vitalistech.sosrotas.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;
import com.vitalistech.sosrotas.service.CsvRelatorioService;
import com.vitalistech.sosrotas.service.PdfRelatorioService;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {

    private final CsvRelatorioService csvService;
    private final PdfRelatorioService pdfService;

    public RelatorioController(CsvRelatorioService csvService, PdfRelatorioService pdfService) {
        this.csvService = csvService;
        this.pdfService = pdfService;
    }

    @GetMapping(value = "/exportar/csv", produces = "text/csv")
    public @ResponseBody byte[] exportarCsv(HttpServletResponse response) {
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio-bairros.csv");
        return csvService.criarRelatorio();
    }

    @GetMapping(value = "/exportar/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public @ResponseBody byte[] exportarPdf(HttpServletResponse response) {
        try {
            response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio-bairros.pdf");
            return pdfService.criarRelatorio();
        } catch (Exception e) {
            // Loga o erro COMPLETO no console
            e.printStackTrace();
            
            // Retorna 500 com mensagem legível em vez de 403 mudo
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("text/plain");
            try {
                response.getWriter().write("ERRO: " + e.getClass().getName() + " - " + e.getMessage());
            } catch (IOException ignored) {}
            return null;
        }
    }
}