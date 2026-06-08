package com.vitalistech.sosrotas.controller;

import com.vitalistech.sosrotas.dto.EquipeRequest;
import com.vitalistech.sosrotas.dto.EquipeResponse;
import com.vitalistech.sosrotas.service.EquipeService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
