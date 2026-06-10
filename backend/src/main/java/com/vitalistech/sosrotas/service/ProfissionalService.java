package com.vitalistech.sosrotas.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.vitalistech.sosrotas.repository.IProfissionalRepository;
import com.vitalistech.sosrotas.model.Profissional;
import com.vitalistech.sosrotas.dto.ProfissionalRequest;
import com.vitalistech.sosrotas.dto.ProfissionalResponse;

@Service
public class ProfissionalService {

    private final IProfissionalRepository repository;

    public ProfissionalService(IProfissionalRepository repository) {
        this.repository = repository;
    }

    public List<ProfissionalResponse> listarTodos() {
        return repository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public ProfissionalResponse buscarPorId(Integer id) {
        Profissional profissional = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profissional não encontrado"));
        return toResponseDTO(profissional);
    }

    @Transactional
    public ProfissionalResponse salvar(ProfissionalRequest request) {
        // Validação de obrigatoriedade mínima
        validarDocumentos(request);

        Profissional profissional = new Profissional();
        copiarDadosParaEntidade(request, profissional);
        
        return toResponseDTO(repository.save(profissional));
    }

    @Transactional
    public ProfissionalResponse atualizar(Integer id, ProfissionalRequest request) {
        // REUTILIZA A MESMA REGRA: Se o JSON do PUT vier sem CPF e sem CNPJ, barra aqui
        validarDocumentos(request);
        
        Profissional existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profissional não encontrado"));

        existente.setNome(request.nome());
        existente.setContato(request.contato());
        if (request.ativo() != null) {
            existente.setAtivo(request.ativo());
        }
        existente.setFuncao(request.funcao());
        existente.setTurno(request.turno());
        
        // Atualiza os novos campos no banco
        existente.setCpf(request.cpf());
        existente.setCnpj(request.cnpj());

        return toResponseDTO(repository.save(existente));
    }

    // Método auxiliar para evitar repetição de código
    private void copiarDadosParaEntidade(ProfissionalRequest request, Profissional entidade) {
        entidade.setNome(request.nome());
        entidade.setContato(request.contato());
        entidade.setAtivo(request.ativo() == null ? true : request.ativo());
        entidade.setFuncao(request.funcao());
        entidade.setTurno(request.turno());
        entidade.setCpf(request.cpf());
        entidade.setCnpj(request.cnpj());
    }

    private void validarDocumentos(ProfissionalRequest request) {
        boolean cpfVazio = request.cpf() == null || request.cpf().isBlank();
        boolean cnpjVazio = request.cnpj() == null || request.cnpj().isBlank();

        if (cpfVazio && cnpjVazio) {
            throw new IllegalArgumentException("É obrigatório informar ao menos um documento (CPF ou CNPJ).");
        }
    }

    // Atualize também o mapeador de resposta
    public ProfissionalResponse toResponseDTO(Profissional profissional) {
        return new ProfissionalResponse(
                profissional.getId(),
                profissional.getNome(),
                profissional.getContato(),
                profissional.getAtivo(),
                profissional.getFuncao(),
                profissional.getTurno(),
                profissional.getCpf(),
                profissional.getCnpj()
        );
    }

    @Transactional
    public void deletar(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Profissional não encontrado");
        }
        repository.deleteById(id);
    }
}