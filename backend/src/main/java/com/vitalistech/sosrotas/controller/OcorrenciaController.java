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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ocorrencias")
@Tag(name = "Ocorrências", description = "Endpoints para gerenciamento transacional de chamados de emergência e despacho de viaturas")
public class OcorrenciaController {

    private static final Logger logger = LoggerFactory.getLogger(OcorrenciaController.class);

    private final OcorrenciaService ocorrenciaService;

    public OcorrenciaController(OcorrenciaService ocorrenciaService) {
        this.ocorrenciaService = ocorrenciaService;
    }

    @GetMapping
    @Operation(summary = "Listar todas as ocorrências", description = "Recupera todas as ocorrências de emergência gravadas na base histórica")
    public List<Ocorrencia> findAll() {
        return ocorrenciaService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar ocorrência por identificador", description = "Retorna os dados cadastrais secos de uma ocorrência baseada no ID informado")
    @ApiResponse(responseCode = "200", description = "Ocorrência localizada com sucesso")
    @ApiResponse(responseCode = "404", description = "ID informado não corresponde a nenhum registro")
    public ResponseEntity<Ocorrencia> findById(@PathVariable Integer id) {
        Ocorrencia ocorrencia = ocorrenciaService.findById(id);
        if (ocorrencia != null) {
            return ResponseEntity.ok(ocorrencia);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    @Operation(summary = "Registrar nova ocorrência", description = "Cria um chamado de emergência em aberto no estado 'ABERTA'. O chamado aguardará a triagem e o despacho manual do operador.")
    public ResponseEntity<OcorrenciaResponse> openOccurrence(@RequestBody OcorrenciaRequest request) {
        logger.info("Nova requisição HTTP POST de chamada emergencial capturada.");
        
        // A service agora processa o DTO, busca o bairro e salva a entidade
        Ocorrencia novaOcorrencia = ocorrenciaService.openOccurrence(request);
        
        // Retorna o DTO de resposta limpo com status 201 Created
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new OcorrenciaResponse(novaOcorrencia));
    }

    @GetMapping("/{id}/detalhes")
    @Operation(summary = "Obter visualização detalhada e rotas", description = "Consolida dados cadastrais da ocorrência, o atendimento ativo (calculado via Matriz de tempos), a equipe médica atuante e a linha do tempo")
    public ResponseEntity<OcorrenciaDetalhes> getOcorrenciaDetalhes(@PathVariable Integer id) {
        OcorrenciaDetalhes detalhes = ocorrenciaService.getOcorrenciaDetalhes(id);
        if (detalhes != null) {
            return ResponseEntity.ok(detalhes);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar uma ocorrência ativa", description = "Interrompe o fluxo operacional do chamado, libera e disponibiliza a viatura vinculada na sua base operacional.")
    public ResponseEntity<Void> cancelOccurrence(@PathVariable Integer id, @RequestBody(required = false) Map<String, String> payload) {
        String justificativa = (payload != null && payload.containsKey("justificativa")) ? payload.get("justificativa") : "Cancelamento operacional sem justificativa explícita";
        logger.info("Requisição para interrupção de chamado ID {} enviada para a camada de serviços.", id);
        ocorrenciaService.cancelOccurrence(id, justificativa);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/historico")
    @Operation(summary = "Recuperar histórico de auditoria", description = "Retorna a linha do tempo sequencial e todas as transições de estados sofridas pelo chamado")
    public ResponseEntity<List<OcorrenciaHistorico>> getHistorico(@PathVariable Integer id) {
        List<OcorrenciaHistorico> historico = ocorrenciaService.findHistoricoByOcorrenciaId(id);
        return ResponseEntity.ok(historico);
    }

    @GetMapping("/despacho/sugestao")
    @Operation(summary = "Obter sugestões de ambulâncias", description = "Retorna uma lista ordenada com a viatura recomendada e opções extras com base na matriz de tempos estáticos entre bairros")
    public ResponseEntity<SugestaoDespacho> obterSugestaoDespacho(@RequestParam Integer ocorrenciaId) {
        // CORRIGIDO: Nome do DTO limpo sem o sufixo redundante
        SugestaoDespacho sugestao = ocorrenciaService.calcularSugestaoDespacho(ocorrenciaId);
        return ResponseEntity.ok(sugestao);
    }

    @PutMapping("/{id}/despachar")
    @Operation(summary = "Confirmar despacho semiautomático", description = "Efetiva o vínculo de uma ambulância selecionada à ocorrência, abrindo o Atendimento oficial e alterando os status das entidades")
    public ResponseEntity<Ocorrencia> despacharOcorrencia(@PathVariable Integer id, @RequestBody Map<String, Integer> body) {
        if (body == null || !body.containsKey("ambulanciaId")) {
            throw new IllegalArgumentException("O parâmetro 'ambulanciaId' deve ser fornecido no corpo da requisição.");
        }
        Integer ambulanciaId = body.get("ambulanciaId");
        Ocorrencia ocorrenciaAtualizada = ocorrenciaService.confirmarDespachoSemiautomatico(id, ambulanciaId);
        return ResponseEntity.ok(ocorrenciaAtualizada);
    }

    /**
     * Endpoint de despacho manual e direto regulado por ID via URL.
     * Mapeamento otimizado que remove artefatos corporativos ou payloads vazios (additionalProp) no Swagger UI.
     */
    @PostMapping("/{ocorrenciaId}/despachar")
    @Operation(summary = "Despachar ocorrência via parâmetros", description = "Efetiva o despacho operacional por ID sem necessidade de corpo JSON (Body), trafegando dados por Path e Query.")
    public ResponseEntity<Ocorrencia> despachar(
            @PathVariable Integer ocorrenciaId, 
            @RequestParam Integer ambulanciaId) {
        logger.info("Executando despacho direto para Ocorrencia ID: {} com Ambulancia ID: {}", ocorrenciaId, ambulanciaId);
        return ResponseEntity.ok(ocorrenciaService.confirmarDespachoSemiautomatico(ocorrenciaId, ambulanciaId));
    }

    /**
     * Conclui o atendimento de uma ocorrência.
     *
     * PUT /api/ocorrencias/{id}/concluir
     * [RF06] Finalização e liberação de recursos.
     */
    @PutMapping("/{id}/concluir")
    @Operation(summary = "Finalizar ocorrência ativa", description = "Conclui o ciclo de vida de um chamado em atendimento, registra o timestamp de fechamento e libera a viatura vinculada para o status DISPONIVEL.")
    public ResponseEntity<OcorrenciaResponse> finishOccurrence(@PathVariable Integer id) {
        logger.info("Recebida requisição HTTP PUT para concluir Ocorrencia ID: {}", id);
        
        // A service executa a regra e devolve a entidade Ocorrencia atualizada
        Ocorrencia ocorrenciaConcluida = ocorrenciaService.finishOccurrence(id);
        
        // Retorna o DTO de resposta formatado com status 200 OK
        return ResponseEntity.ok(new OcorrenciaResponse(ocorrenciaConcluida));
    }
}