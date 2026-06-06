package com.vitalistech.sosrotas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vitalistech.sosrotas.model.Ambulancia;
import com.vitalistech.sosrotas.service.AmbulanciaService;

@RestController
@RequestMapping("/ambulancias")
public class AmbulanciaController {

    private final AmbulanciaService ambulanciaService;

    public AmbulanciaController(AmbulanciaService ambulanciaService) {
        this.ambulanciaService = ambulanciaService;
    }

    /**
     * Lista todas as ambulâncias.
     *
     * GET /ambulancias
     */
    @GetMapping
    public ResponseEntity<List<Ambulancia>> listarTodas() {

        List<Ambulancia> ambulancias =
                ambulanciaService.listarTodas();

        return ResponseEntity.ok(ambulancias);
    }

    /**
     * Busca ambulância por ID.
     *
     * GET /ambulancias/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Ambulancia> buscarPorId(
            @PathVariable Integer id) {

        Ambulancia ambulancia =
                ambulanciaService.buscarPorId(id);

        if (ambulancia == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(ambulancia);
    }

    /**
     * Cadastra nova ambulância.
     *
     * POST /ambulancias
     */
    @PostMapping
    public ResponseEntity<Ambulancia> salvar(
            @RequestBody Ambulancia ambulancia) {

            System.out.println("POST CHEGOU NO CONTROLLER");

        Ambulancia novaAmbulancia =
                ambulanciaService.salvar(ambulancia);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(novaAmbulancia);
    }

    /**
     * Atualiza uma ambulância existente.
     *
     * PUT /ambulancias/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Ambulancia> atualizar(
            @PathVariable Integer id,
            @RequestBody Ambulancia ambulancia) {

        Ambulancia ambulanciaAtualizada =
                ambulanciaService.atualizar(
                        id,
                        ambulancia
                );

        return ResponseEntity.ok(
                ambulanciaAtualizada
        );
    }

    /**
     * Remove uma ambulância.
     *
     * DELETE /ambulancias/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Integer id) {

        ambulanciaService.deletar(id);

        return ResponseEntity.noContent().build();
    }

}
