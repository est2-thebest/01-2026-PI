package com.vitalistech.sosrotas.controller;

import com.vitalistech.sosrotas.model.Bairro;
import com.vitalistech.sosrotas.service.BairroService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bairros")
public class BairroController {

    private final BairroService service;

    public BairroController(
            BairroService service) {

        this.service = service;
    }

    @GetMapping
    public List<Bairro> listarTodos() {

        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bairro> buscarPorId(
            @PathVariable Integer id) {

        Bairro bairro =
                service.buscarPorId(id);

        if (bairro == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(bairro);
    }

    @PostMapping
    public ResponseEntity<Bairro> criar(
            @RequestBody Bairro bairro) {

        return ResponseEntity.ok(
                service.salvar(bairro)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bairro> atualizar(
            @PathVariable Integer id,
            @RequestBody Bairro bairro) {

        return ResponseEntity.ok(
                service.atualizar(id, bairro)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Integer id) {

        service.deletar(id);

        return ResponseEntity.noContent()
                .build();
    }
}