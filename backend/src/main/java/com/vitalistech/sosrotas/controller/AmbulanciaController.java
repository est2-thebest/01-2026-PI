package com.vitalistech.sosrotas.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vitalistech.sosrotas.dto.AmbulanciaRequest;
import com.vitalistech.sosrotas.dto.AmbulanciaResponse;
import com.vitalistech.sosrotas.model.Ambulancia;
import com.vitalistech.sosrotas.service.AmbulanciaService;

@RestController
@RequestMapping("/ambulancias")
public class AmbulanciaController {

    private final AmbulanciaService ambulanciaService;

    public AmbulanciaController(AmbulanciaService ambulanciaService) {
        this.ambulanciaService = ambulanciaService;
    }

    @GetMapping
    public ResponseEntity<List<AmbulanciaResponse>> listarTodas() {
        List<AmbulanciaResponse> responses = ambulanciaService.listarTodas()
                .stream()
                .map(AmbulanciaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AmbulanciaResponse> buscarPorId(@PathVariable Integer id) {
        Ambulancia ambulancia = ambulanciaService.buscarPorId(id);
        if (ambulancia == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new AmbulanciaResponse(ambulancia));
    }

    @PostMapping
    public ResponseEntity<AmbulanciaResponse> salvar(@RequestBody AmbulanciaRequest request) {
        Ambulancia nova = ambulanciaService.salvar(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new AmbulanciaResponse(nova));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AmbulanciaResponse> atualizar(
            @PathVariable Integer id,
            @RequestBody AmbulanciaRequest request) {

        Ambulancia atualizada = ambulanciaService.atualizar(id, request);
        return ResponseEntity.ok(new AmbulanciaResponse(atualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        ambulanciaService.deletar(id);
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
}