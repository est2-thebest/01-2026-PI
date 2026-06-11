package com.vitalistech.sosrotas.model;

import jakarta.persistence.*;
import java.util.List;
import com.vitalistech.sosrotas.model.enums.Turno;
import com.vitalistech.sosrotas.model.enums.StatusEquipe; 


/**
 * Entidade que representa uma equipe de atendimento.
 * [RF03] Cadastro de Equipes.
 */

@Entity
@Table(name = "equipe")
public class Equipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String descricao;

    @OneToOne
    @JoinColumn(name = "ambulancia_id")
    private Ambulancia ambulancia;

    @Enumerated(EnumType.STRING)
    private Turno turno;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StatusEquipe status; // Novo campo solicitado pelo Front

    @ManyToMany
    @JoinTable(
            name = "equipe_profissional",
            joinColumns = @JoinColumn(name = "equipe_id"),
            inverseJoinColumns = @JoinColumn(name = "profissional_id")
    )
    private List<Profissional> profissionais;

    public Equipe() {
    }

    // Atualize o construtor
    public Equipe(Integer id, String descricao, Ambulancia ambulancia,
                  Turno turno, StatusEquipe status, List<Profissional> profissionais) {
        this.id = id;
        this.descricao = descricao;
        this.ambulancia = ambulancia;
        this.turno = turno;
        this.status = status;
        this.profissionais = profissionais;
    }

    // Getters e Setters do novo campo
    public StatusEquipe getStatus() {
        return status;
    }

    public void setStatus(StatusEquipe status) {
        this.status = status;
    }

    // ... Mantenha os outros getters e setters intocados ...
    public Integer getId() { 
        return id; 
    }
    public void setId(Integer id) { 
        this.id = id; 
    }
    public String getDescricao() { 
        return descricao; 
    }
    public void setDescricao(String descricao) { 
        this.descricao = descricao; 
    }
    public Ambulancia getAmbulancia() { 
        return ambulancia; 
    }
    public void setAmbulancia(Ambulancia ambulancia) { 
        this.ambulancia = ambulancia; 
    }
    public Turno getTurno() { 
        return turno; 
    }
    public void setTurno(Turno turno) { 
        this.turno = turno; 
    }
    public List<Profissional> getProfissionais() { 
        return profissionais; 
    }
    public void setProfissionais(List<Profissional> profissionais) { 
        this.profissionais = profissionais; 
    }
}