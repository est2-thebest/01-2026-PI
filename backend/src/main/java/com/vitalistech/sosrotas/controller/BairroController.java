package com.vitalistech.sosrotas.controller;

import com.vitalistech.sosrotas.dto.BairroRequest;
import com.vitalistech.sosrotas.dto.BairroResponse;
import com.vitalistech.sosrotas.model.Bairro;
import com.vitalistech.sosrotas.service.BairroService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/bairros")
public class BairroController {

    private final BairroService service;

    public BairroController(BairroService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<BairroResponse>> listarTodos() {
        List<BairroResponse> responses = service.listarTodos()
                .stream()
                .map(BairroResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BairroResponse> buscarPorId(@PathVariable Integer id) {
        Bairro bairro = service.buscarPorId(id);
        if (bairro == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new BairroResponse(bairro));
    }

    @PostMapping
    public ResponseEntity<BairroResponse> criar(@RequestBody BairroRequest request) {
        Bairro novo = service.salvar(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new BairroResponse(novo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BairroResponse> atualizar(
            @PathVariable Integer id,
            @RequestBody BairroRequest request) {

        Bairro atualizado = service.atualizar(id, request);
        return ResponseEntity.ok(new BairroResponse(atualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}