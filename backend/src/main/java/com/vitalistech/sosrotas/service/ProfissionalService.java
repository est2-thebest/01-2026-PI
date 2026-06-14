package com.vitalistech.sosrotas.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.vitalistech.sosrotas.repository.IProfissionalRepository;
import com.vitalistech.sosrotas.repository.IEquipeRepository;
import com.vitalistech.sosrotas.repository.IAmbulanciaRepository;
import com.vitalistech.sosrotas.model.Ambulancia;
import com.vitalistech.sosrotas.model.Profissional;
import com.vitalistech.sosrotas.model.Equipe;
import com.vitalistech.sosrotas.model.enums.StatusEquipe;
import com.vitalistech.sosrotas.model.enums.StatusAmbulancia;
import com.vitalistech.sosrotas.dto.ProfissionalRequest;
import com.vitalistech.sosrotas.dto.ProfissionalResponse;

@Service
public class ProfissionalService {

    private final IProfissionalRepository repository;
    private final IEquipeRepository equipeRepository;
    private final IAmbulanciaRepository ambulanciaRepository;

    public ProfissionalService(IProfissionalRepository repository,
                               IEquipeRepository equipeRepository,
                               IAmbulanciaRepository ambulanciaRepository) {
        this.repository = repository;
        this.equipeRepository = equipeRepository;
        this.ambulanciaRepository = ambulanciaRepository;
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

        Profissional profesional = new Profissional();
        copiarDadosParaEntidade(request, profesional);
        
        return toResponseDTO(repository.save(profesional));
    }

    @Transactional
    public ProfissionalResponse atualizar(Integer id, ProfissionalRequest request) {
        // REUTILIZA A MESMA REGRA: Se o JSON do PUT vier sem CPF e sem CNPJ, barra aqui
        validarDocumentos(request);
        
        Profissional existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profissional não encontrado"));

        // NOVA VALIDAÇÃO: Impede a edição caso o profissional esteja em empenho ativo
        validarSeEstaEmOcorrenciaAtiva(existente);

        boolean eraAtivo = Boolean.TRUE.equals(existente.getAtivo());

        existente.setNome(request.nome());
        existente.setContato(request.contato());
        if (request.ativo() != null) {
            existente.setAtivo(request.ativo());
        }
        boolean emEquipe = equipeRepository.existsByProfissionaisContaining(existente);

        if (emEquipe && request.funcao() != null && !request.funcao().equals(existente.getFuncao())) {
            throw new IllegalStateException("Nao e permitido alterar a funcao de um profissional vinculado a uma equipe.");
        }
        existente.setFuncao(request.funcao());

        if (emEquipe && request.turno() != null && !request.turno().equals(existente.getTurno())) {
            throw new IllegalStateException("Nao e permitido alterar o turno de um profissional vinculado a uma equipe.");
        }
        existente.setTurno(request.turno());
        existente.setCpf(request.cpf());
        existente.setCnpj(request.cnpj());

        Profissional salvo = repository.save(existente);

        if (eraAtivo && Boolean.FALSE.equals(salvo.getAtivo())) {
            desativarAmbulanciasDoProfissional(salvo);
        }

        return toResponseDTO(salvo);
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

    private void desativarAmbulanciasDoProfissional(Profissional profissional) {
        List<Equipe> equipes = equipeRepository.findByProfissionaisId(profissional.getId());
        for (Equipe equipe : equipes) {
            if (StatusEquipe.EM_ATENDIMENTO.equals(equipe.getStatus())) {
                continue;
            }

            Ambulancia ambulancia = equipe.getAmbulancia();

            // Remove o vínculo FK antes de salvar para liberar a unique constraint
            equipe.setStatus(StatusEquipe.INATIVA);
            equipe.setAmbulancia(null);
            equipeRepository.save(equipe);

            if (ambulancia != null && !StatusAmbulancia.EM_ATENDIMENTO.equals(ambulancia.getStatus())) {
                ambulancia.setStatus(StatusAmbulancia.SEM_EQUIPE);
                ambulanciaRepository.save(ambulancia);
            }
        }
    }

    private void validarSeEstaEmOcorrenciaAtiva(Profissional profissional) {
        // Busca as equipes associadas ao profissional para validar o estado reativo da máquina de atendimento
        List<Equipe> equipesDoProfissional = equipeRepository.findByProfissionaisId(profissional.getId());

        for (Equipe equipe : equipesDoProfissional) {
            if (StatusEquipe.EM_ATENDIMENTO.equals(equipe.getStatus())) {
                throw new IllegalStateException("Operação negada: O profissional está vinculado a uma equipe em atendimento ativo no momento.");
            }
        }
    }

    public ProfissionalResponse toResponseDTO(Profissional profissional) {
        List<Equipe> equipes = equipeRepository.findByProfissionaisId(profissional.getId());
        boolean emEquipe = !equipes.isEmpty();
        boolean emAtendimentoAtivo = equipes.stream()
                .anyMatch(e -> StatusEquipe.EM_ATENDIMENTO.equals(e.getStatus()));
        return new ProfissionalResponse(
                profissional.getId(),
                profissional.getNome(),
                profissional.getContato(),
                profissional.getAtivo(),
                profissional.getFuncao(),
                profissional.getTurno(),
                profissional.getCpf(),
                profissional.getCnpj(),
                emEquipe,
                emAtendimentoAtivo
        );
    }

    @Transactional
    public void deletar(Integer id) {
        Profissional existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profissional não encontrado"));

        // NOVA VALIDAÇÃO: Impede a exclusão caso o profissional esteja em empenho ativo
        validarSeEstaEmOcorrenciaAtiva(existente);
        
        repository.delete(existente);
    }
}