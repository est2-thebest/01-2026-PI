package com.vitalistech.sosrotas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.vitalistech.sosrotas.dto.RelatorioResponse;
import com.vitalistech.sosrotas.model.enums.StatusOcorrencia;
import com.vitalistech.sosrotas.service.RelatorioService;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping
    public ResponseEntity<RelatorioResponse> obterRelatorioAvancado(
            @RequestParam(required = false) String gravidade,
            @RequestParam(required = false) StatusOcorrencia status) {
        
        return ResponseEntity.ok(relatorioService.gerarRelatorioAvancado(gravidade, status));
    }
}