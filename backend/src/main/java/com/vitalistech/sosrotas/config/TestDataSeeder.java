package com.vitalistech.sosrotas.config;

import com.vitalistech.sosrotas.model.*;
import com.vitalistech.sosrotas.model.enums.*;
import com.vitalistech.sosrotas.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(3)
public class TestDataSeeder implements CommandLineRunner {

    private final IUserRepository userRepository;
    private final IAmbulanciaRepository ambulanciaRepository;
    private final IProfissionalRepository profissionalRepository;
    private final IEquipeRepository equipeRepository;
    private final IOcorrenciaRepository ocorrenciaRepository;
    private final IOcorrenciaHistoricoRepository historicoRepository;
    private final IBairroRepository bairroRepository;
    private final PasswordEncoder passwordEncoder;

    public TestDataSeeder(IUserRepository userRepository,
                          IAmbulanciaRepository ambulanciaRepository,
                          IProfissionalRepository profissionalRepository,
                          IEquipeRepository equipeRepository,
                          IOcorrenciaRepository ocorrenciaRepository,
                          IOcorrenciaHistoricoRepository historicoRepository,
                          IBairroRepository bairroRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.ambulanciaRepository = ambulanciaRepository;
        this.profissionalRepository = profissionalRepository;
        this.equipeRepository = equipeRepository;
        this.ocorrenciaRepository = ocorrenciaRepository;
        this.historicoRepository = historicoRepository;
        this.bairroRepository = bairroRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // ── Usuário padrão ──────────────────────────────────────────────────────
        User admin = new User("Admin", "admin@sosrotas.com", passwordEncoder.encode("admin123"), Role.ADMIN);
        userRepository.save(admin);

        // ── Bairros de referência ──────────────────────────────────────────────
        Bairro centro      = bairroRepository.findById(2).orElse(null);   // Centro
        Bairro colina      = bairroRepository.findById(13).orElse(null);  // Colina
        Bairro lagoAzul    = bairroRepository.findById(17).orElse(null);  // Lago Azul
        Bairro novaAlvorada= bairroRepository.findById(11).orElse(null);  // Nova Alvorada
        Bairro vilaNovaB   = bairroRepository.findById(4).orElse(null);   // Vila Nova
        Bairro moradaSol   = bairroRepository.findById(15).orElse(null);  // Morada Sol

        // ── Ambulâncias ────────────────────────────────────────────────────────
        Ambulancia amb1 = new Ambulancia();
        amb1.setPlaca("SOS-0001");
        amb1.setTipo(TipoAmbulancia.USA);
        amb1.setStatus(StatusAmbulancia.DISPONIVEL);
        amb1.setBairroBase(centro);
        ambulanciaRepository.save(amb1);

        Ambulancia amb2 = new Ambulancia();
        amb2.setPlaca("SOS-0002");
        amb2.setTipo(TipoAmbulancia.USB);
        amb2.setStatus(StatusAmbulancia.DISPONIVEL);
        amb2.setBairroBase(colina);
        ambulanciaRepository.save(amb2);

        Ambulancia amb3 = new Ambulancia();
        amb3.setPlaca("SOS-0003");
        amb3.setTipo(TipoAmbulancia.USA);
        amb3.setStatus(StatusAmbulancia.SEM_EQUIPE);
        amb3.setBairroBase(lagoAzul);
        ambulanciaRepository.save(amb3);

        // ── Profissionais ──────────────────────────────────────────────────────
        Profissional med1 = criarProfissional("Dr. Carlos Silva",    "(41) 99100-0001", FuncaoProfissional.MEDICO,     Turno.MATUTINO,   true, "111.111.111-11", null);
        Profissional enf1 = criarProfissional("Ana Oliveira",        "(41) 99100-0002", FuncaoProfissional.ENFERMEIRO, Turno.MATUTINO,   true, "222.222.222-22", null);
        Profissional mot1 = criarProfissional("Roberto Santos",      "(41) 99100-0003", FuncaoProfissional.MOTORISTA,  Turno.MATUTINO,   true, "333.333.333-33", null);
        Profissional med2 = criarProfissional("Dra. Lucia Ferreira", "(41) 99100-0004", FuncaoProfissional.MEDICO,     Turno.VESPERTINO, true, "444.444.444-44", null);
        Profissional enf2 = criarProfissional("Paulo Costa",         "(41) 99100-0005", FuncaoProfissional.ENFERMEIRO, Turno.VESPERTINO, true, "555.555.555-55", null);
        Profissional mot2 = criarProfissional("Marcos Lima",         "(41) 99100-0006", FuncaoProfissional.MOTORISTA,  Turno.VESPERTINO, true, "666.666.666-66", null);
        profissionalRepository.saveAll(List.of(med1, enf1, mot1, med2, enf2, mot2));

        // ── Equipes ────────────────────────────────────────────────────────────
        Equipe eq1 = new Equipe();
        eq1.setDescricao("Alpha Matutino");
        eq1.setTurno(Turno.MATUTINO);
        eq1.setStatus(StatusEquipe.DISPONIVEL);
        eq1.setAmbulancia(amb1);
        eq1.setProfissionais(List.of(med1, enf1, mot1));
        equipeRepository.save(eq1);

        Equipe eq2 = new Equipe();
        eq2.setDescricao("Beta Vespertino");
        eq2.setTurno(Turno.VESPERTINO);
        eq2.setStatus(StatusEquipe.DISPONIVEL);
        eq2.setAmbulancia(amb2);
        eq2.setProfissionais(List.of(med2, enf2, mot2));
        equipeRepository.save(eq2);

        // ── Ocorrências ────────────────────────────────────────────────────────
        criarOcorrencia("Parada Cardiorrespiratoria", GravidadeOcorrencia.ALTA,  novaAlvorada, "Paciente inconsciente na calcada");
        criarOcorrencia("Acidente de Transito",       GravidadeOcorrencia.MEDIA, vilaNovaB,    "Colisao entre dois veiculos, ferido consciente");
        criarOcorrencia("Queda de idoso",             GravidadeOcorrencia.BAIXA, moradaSol,    "Idosa caiu no banheiro, possivel fratura");

        System.out.println("TestDataSeeder: dados de teste carregados com sucesso.");
        System.out.println("  Login: admin@sosrotas.com / admin123");
    }

    private Profissional criarProfissional(String nome, String contato, FuncaoProfissional funcao,
                                           Turno turno, boolean ativo, String cpf, String cnpj) {
        Profissional p = new Profissional();
        p.setNome(nome);
        p.setContato(contato);
        p.setFuncao(funcao);
        p.setTurno(turno);
        p.setAtivo(ativo);
        p.setCpf(cpf);
        p.setCnpj(cnpj);
        return p;
    }

    private void criarOcorrencia(String tipo, GravidadeOcorrencia gravidade, Bairro bairro, String obs) {
        Ocorrencia oc = new Ocorrencia();
        oc.setTipo(tipo);
        oc.setGravidade(gravidade);
        oc.setBairro(bairro);
        oc.setObservacao(obs);
        oc.setStatus(StatusOcorrencia.ABERTA);
        oc.setDataHoraAbertura(LocalDateTime.now());
        Ocorrencia saved = ocorrenciaRepository.save(oc);

        OcorrenciaHistorico hist = new OcorrenciaHistorico();
        hist.setOcorrencia(saved);
        hist.setStatusAnterior(null);
        hist.setStatusNovo(StatusOcorrencia.ABERTA);
        hist.setDataHora(LocalDateTime.now());
        hist.setObservacao("Chamado aberto automaticamente pelo seeder de testes");
        historicoRepository.save(hist);
    }
}