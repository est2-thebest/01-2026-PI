package com.vitalistech.sosrotas.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vitalistech.sosrotas.model.Ocorrencia;
import com.vitalistech.sosrotas.model.OcorrenciaHistorico;
import com.vitalistech.sosrotas.model.SugestaoDespacho;
import com.vitalistech.sosrotas.dto.OcorrenciaDetalhes;
import com.vitalistech.sosrotas.dto.OcorrenciaRequest;
import com.vitalistech.sosrotas.dto.OcorrenciaResponse;
import com.vitalistech.sosrotas.service.OcorrenciaService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ocorrencias")
public class OcorrenciaController {

    private static final Logger logger = LoggerFactory.getLogger(OcorrenciaController.class);

    private final OcorrenciaService ocorrenciaService;

    public OcorrenciaController(OcorrenciaService ocorrenciaService) {
        this.ocorrenciaService = ocorrenciaService;
    }

    @GetMapping
    public List<Ocorrencia> findAll() {
        List<Ocorrencia> lista = ocorrenciaService.findAll();
        lista.sort((o1, o2) -> {
            if (o1.getDataHoraAbertura() == null) return 1;
            if (o2.getDataHoraAbertura() == null) return -1;
            return o2.getDataHoraAbertura().compareTo(o1.getDataHoraAbertura());
        });
        return lista;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ocorrencia> findById(@PathVariable Integer id) {
        Ocorrencia ocorrencia = ocorrenciaService.findById(id);
        if (ocorrencia != null) {
            return ResponseEntity.ok(ocorrencia);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<OcorrenciaResponse> openOccurrence(@RequestBody OcorrenciaRequest request) {
        logger.info("Nova requisicao HTTP POST de chamada emergencial capturada.");
        Ocorrencia novaOcorrencia = ocorrenciaService.openOccurrence(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new OcorrenciaResponse(novaOcorrencia));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OcorrenciaResponse> updateOccurrence(@PathVariable Integer id, @RequestBody OcorrenciaRequest request) {
        Ocorrencia atualizada = ocorrenciaService.updateOccurrence(id, request);
        return ResponseEntity.ok(new OcorrenciaResponse(atualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOccurrence(@PathVariable Integer id) {
        ocorrenciaService.deleteOccurrence(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/detalhes")
    public ResponseEntity<OcorrenciaDetalhes> getOcorrenciaDetalhes(@PathVariable Integer id) {
        OcorrenciaDetalhes detalhes = ocorrenciaService.getOcorrenciaDetalhes(id);
        if (detalhes != null) {
            return ResponseEntity.ok(detalhes);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/historico")
    public ResponseEntity<List<OcorrenciaHistorico>> getHistorico(@PathVariable Integer id) {
        List<OcorrenciaHistorico> historico = ocorrenciaService.findHistoricoByOcorrenciaId(id);
        return ResponseEntity.ok(historico);
    }

    @GetMapping("/despacho/sugestao")
    public ResponseEntity<SugestaoDespacho> obterSugestaoDespacho(@RequestParam Integer ocorrenciaId) {
        SugestaoDespacho sugestao = ocorrenciaService.calcularSugestaoDespacho(ocorrenciaId);
        return ResponseEntity.ok(sugestao);
    }

    @PutMapping("/{id}/despachar")
    public ResponseEntity<Ocorrencia> despacharOcorrencia(@PathVariable Integer id, @RequestBody Map<String, Integer> body) {
        if (body == null || !body.containsKey("ambulanciaId")) {
            throw new IllegalArgumentException("O parametro 'ambulanciaId' deve ser fornecido no corpo da requisicao.");
        }
        Integer ambulanciaId = body.get("ambulanciaId");
        return ResponseEntity.ok(ocorrenciaService.confirmarDespachoSemiautomatico(id, ambulanciaId));
    }

    @PostMapping("/{ocorrenciaId}/despachar")
    public ResponseEntity<Ocorrencia> despachar(@PathVariable Integer ocorrenciaId, @RequestParam Integer ambulanciaId) {
        logger.info("Executando despacho direto para Ocorrencia ID: {} com Ambulancia ID: {}", ocorrenciaId, ambulanciaId);
        return ResponseEntity.ok(ocorrenciaService.confirmarDespachoSemiautomatico(ocorrenciaId, ambulanciaId));
    }

    @PostMapping("/{id}/confirmar-saida")
    public ResponseEntity<Ocorrencia> confirmarSaida(@PathVariable Integer id) {
        return ResponseEntity.ok(ocorrenciaService.confirmarSaida(id));
    }

    @PutMapping("/{id}/concluir")
    public ResponseEntity<OcorrenciaResponse> finishOccurrence(@PathVariable Integer id) {
        logger.info("Recebida requisicao HTTP PUT para concluir Ocorrencia ID: {}", id);
        Ocorrencia ocorrenciaConcluida = ocorrenciaService.finishOccurrence(id);
        return ResponseEntity.ok(new OcorrenciaResponse(ocorrenciaConcluida));
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelOccurrence(@PathVariable Integer id, @RequestBody(required = false) Map<String, String> payload) {
        String justificativa = (payload != null && payload.containsKey("justificativa"))
                ? payload.get("justificativa")
                : "Cancelamento operacional sem justificativa explicita";
        logger.info("Requisicao para interrupcao de chamado ID {} enviada para a camada de servicos.", id);
        ocorrenciaService.cancelOccurrence(id, justificativa);
        return ResponseEntity.ok().build();
    }

    @ExceptionHandler({IllegalStateException.class, RuntimeException.class})
    public ResponseEntity<Map<String, String>> handleErrors(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "Erro interno."));
    }
}