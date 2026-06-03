package com.vitalistech.sosrotas.controller;

import com.vitalistech.sosrotas.model.Rota;
import com.vitalistech.sosrotas.service.RotaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rotas")
@Tag(name = "Rotas", description = "Operações relacionadas a rotas")
public class RotaController {

    private final RotaService rotaService;

    public RotaController(RotaService rotaService) {
        this.rotaService = rotaService;
    }

    @GetMapping
    @Operation(summary = "Listar todas as rotas")
    public ResponseEntity<List<Rota>> listar() {
        return ResponseEntity.ok(rotaService.listarTodas());
    }

    @PostMapping
    @Operation(summary = "Criar uma nova rota")
    public ResponseEntity<Rota> criar(@RequestBody Rota rota) {
        return ResponseEntity.ok(rotaService.salvar(rota));
    }
}
