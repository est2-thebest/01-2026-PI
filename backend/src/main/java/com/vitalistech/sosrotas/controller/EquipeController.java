package com.vitalistech.sosrotas.controller;

import com.vitalistech.sosrotas.dto.EquipeRequest;
import com.vitalistech.sosrotas.dto.EquipeResponse;
import com.vitalistech.sosrotas.service.EquipeService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/equipes")
public class EquipeController {

    private final EquipeService equipeService;

    public EquipeController(EquipeService equipeService) {
        this.equipeService = equipeService;
    }

    @GetMapping
    public ResponseEntity<List<EquipeResponse>> listarTodas() {
        return ResponseEntity.ok(equipeService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipeResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(equipeService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<EquipeResponse> salvar(@RequestBody EquipeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipeService.salvar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipeResponse> atualizar(
            @PathVariable Integer id,
            @RequestBody EquipeRequest request) {
        return ResponseEntity.ok(equipeService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        equipeService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "Operação não permitida."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneral(Exception ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", msg));
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<EquipeResponse> inativar(@PathVariable Integer id) {
        return ResponseEntity.ok(equipeService.inativarEquipe(id));
    }

    @PatchMapping("/{id}/reativar")
    public ResponseEntity<EquipeResponse> reativar(@PathVariable Integer id) {
        return ResponseEntity.ok(equipeService.reativarEquipe(id));
    }
}