import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { EquipeService } from '../../../services/equipe.service';
import { AmbulanciaService } from '../../../services/ambulancia.service';
import { ProfissionalService } from '../../../services/profissional.service';
import { Equipe, Ambulancia, Profissional } from '../../../shared/models';

@Component({
  selector: 'app-equipes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './equipes.component.html',
  styleUrl: './equipes.component.scss'
})
export class EquipesComponent implements OnInit {
  equipes: Equipe[] = [];
  ambulancias: Ambulancia[] = [];
  profissionaisDisponiveis: Profissional[] = [];
  
  carregando = true;
  erro: string | null = null;

  form: FormGroup;
  mostraFormulario = false;
  editandoId: number | null = null;
  filtroTurno = '';
  profissionaisSelecionados: Profissional[] = [];

  constructor(
    private equipeService: EquipeService,
    private ambulanciaService: AmbulanciaService,
    private profissionalService: ProfissionalService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      ambulanciaId: [null, Validators.required],
      turno: ['MATUTINO', Validators.required]
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    
    this.ambulanciaService.listar().subscribe({
      next: (ambul) => {
        this.ambulancias = ambul.filter(a => a.status === 'DISPONIVEL' || a.status === 'SEM_EQUIPE');
      }
    });

    this.profissionalService.listar().subscribe({
      next: (profs) => {
        this.profissionaisDisponiveis = profs.filter(p => p.ativo);
      }
    });

    this.equipeService.listar().subscribe({
      next: (equipes) => {
        this.equipes = equipes;
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar equipes:', err);
        this.erro = 'Erro ao carregar equipes';
        this.carregando = false;
      }
    });
  }

  get equipesFiltradas(): Equipe[] {
    return this.equipes.filter(e => 
      !this.filtroTurno || e.turno === this.filtroTurno
    );
  }

  abrirFormulario(equipe?: Equipe): void {
    this.form.reset();
    this.profissionaisSelecionados = [];
    this.mostraFormulario = true;

    if (equipe) {
      this.editandoId = equipe.id || null;
      this.form.patchValue({
        descricao: equipe.descricao,
        ambulanciaId: equipe.ambulancia?.id,
        turno: equipe.turno
      });
      this.profissionaisSelecionados = equipe.profissionais || [];
    } else {
      this.editandoId = null;
      this.form.patchValue({ turno: 'MATUTINO' });
    }
  }

  fecharFormulario(): void {
    this.mostraFormulario = false;
    this.form.reset();
    this.editandoId = null;
    this.profissionaisSelecionados = [];
  }

  toggleProfissional(profissional: Profissional): void {
    const index = this.profissionaisSelecionados.findIndex(p => p.id === profissional.id);
    if (index >= 0) {
      this.profissionaisSelecionados.splice(index, 1);
    } else {
      this.profissionaisSelecionados.push(profissional);
    }
  }

  isProfissionalSelecionado(profissional: Profissional): boolean {
    return this.profissionaisSelecionados.some(p => p.id === profissional.id);
  }

  validarEquipe(): string | null {
    if (this.profissionaisSelecionados.length === 0) {
      return 'Selecione pelo menos um profissional';
    }

    const ambulancia = this.ambulancias.find(a => a.id === this.form.get('ambulanciaId')?.value);
    if (!ambulancia) {
      return 'Selecione uma ambulância';
    }

    const medicos = this.profissionaisSelecionados.filter(p => p.funcao === 'MEDICO').length;
    const enfermeiros = this.profissionaisSelecionados.filter(p => p.funcao === 'ENFERMEIRO').length;
    const motoristas = this.profissionaisSelecionados.filter(p => p.funcao === 'MOTORISTA').length;

    if (ambulancia.tipo === 'USA') {
      if (medicos !== 1) return 'USA requer exatamente 1 Médico';
      if (enfermeiros !== 1) return 'USA requer exatamente 1 Enfermeiro';
      if (motoristas !== 1) return 'USA requer exatamente 1 Motorista';
    } else {
      if (medicos > 0) return 'USB não deve ter Médico';
      if (enfermeiros !== 1) return 'USB requer exatamente 1 Enfermeiro';
      if (motoristas !== 1) return 'USB requer exatamente 1 Motorista';
    }

    return null;
  }

  salvar(): void {
    if (this.form.invalid) return;

    const erro = this.validarEquipe();
    if (erro) {
      this.erro = erro;
      return;
    }

    const ambulancia = this.ambulancias.find(a => a.id === this.form.get('ambulanciaId')?.value);
    const dados: Equipe = {
      descricao: this.form.get('descricao')?.value,
      ambulancia,
      profissionais: this.profissionaisSelecionados,
      turno: this.form.get('turno')?.value
    };

    if (this.editandoId) {
      this.equipeService.atualizar(this.editandoId, dados).subscribe({
        next: () => {
          this.carregarDados();
          this.fecharFormulario();
        },
        error: (err) => {
          this.erro = 'Erro ao atualizar equipe';
        }
      });
    } else {
      this.equipeService.criar(dados).subscribe({
        next: () => {
          this.carregarDados();
          this.fecharFormulario();
        },
        error: (err) => {
          this.erro = 'Erro ao criar equipe';
        }
      });
    }
  }

  excluir(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta equipe?')) {
      this.equipeService.excluir(id).subscribe({
        next: () => {
          this.carregarDados();
        },
        error: (err) => {
          this.erro = 'Erro ao excluir equipe';
        }
      });
    }
  }

  getFuncaoEmoji(funcao: string): string {
    const emojis: Record<string, string> = {
      'MEDICO': '👨‍⚕️',
      'ENFERMEIRO': '🩺',
      'MOTORISTA': '🚗'
    };
    return emojis[funcao] || '👤';
  }
}
