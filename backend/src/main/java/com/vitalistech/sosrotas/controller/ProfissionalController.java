package com.vitalistech.sosrotas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vitalistech.sosrotas.model.Profissional;
import com.vitalistech.sosrotas.service.ProfissionalService;

@RestController
@RequestMapping("/profissionais")
public class ProfissionalController {

    private final ProfissionalService profissionalService;

    public ProfissionalController(
            ProfissionalService profissionalService) {

        this.profissionalService = profissionalService;
    }

    /**
     * Lista todos os profissionais.
     *
     * GET /profissionais
     */
    @GetMapping
    public ResponseEntity<List<Profissional>> listarTodos() {

        List<Profissional> profissionais =
                profissionalService.listarTodos();

        return ResponseEntity.ok(profissionais);
    }

    /**
     * Busca profissional por ID.
     *
     * GET /profissionais/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Profissional> buscarPorId(
            @PathVariable Integer id) {

        Profissional profissional =
                profissionalService.buscarPorId(id);

        if (profissional == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(profissional);
    }

    /**
     * Cadastra um novo profissional.
     *
     * POST /profissionais
     */
    @PostMapping
    public ResponseEntity<Profissional> salvar(
            @RequestBody Profissional profissional) {

        Profissional novoProfissional =
                profissionalService.salvar(profissional);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(novoProfissional);
    }

    /**
     * Atualiza um profissional existente.
     *
     * PUT /profissionais/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Profissional> atualizar(
            @PathVariable Integer id,
            @RequestBody Profissional profissional) {

        Profissional profissionalAtualizado =
                profissionalService.atualizar(
                        id,
                        profissional
                );

        return ResponseEntity.ok(
                profissionalAtualizado
        );
    }

    /**
     * Remove um profissional.
     *
     * DELETE /profissionais/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Integer id) {

        profissionalService.deletar(id);

        return ResponseEntity.noContent().build();
    }
}