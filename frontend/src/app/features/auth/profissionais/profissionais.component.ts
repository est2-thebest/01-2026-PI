import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ProfissionalService } from '../../../services/profissional.service';
import { Profissional } from '../../../shared/models';

@Component({
  selector: 'app-profissionais',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profissionais.component.html',
  styleUrl: './profissionais.component.scss'
})
export class ProfissionaisComponent implements OnInit {
  profissionais: Profissional[] = [];
  carregando = true;
  erro: string | null = null;

  form: FormGroup;
  mostraFormulario = false;
  editandoId: number | null = null;
  filtroFuncao = '';

  constructor(
    private profissionalService: ProfissionalService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      funcao: ['MEDICO', Validators.required],
      contato: [''],
      ativo: [true],
      turno: ['MATUTINO']
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.profissionalService.listar().subscribe({
      next: (profissionais) => {
        this.profissionais = profissionais;
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar profissionais:', err);
        this.erro = 'Erro ao carregar profissionais';
        this.carregando = false;
      }
    });
  }

  get profissionaisFiltrados(): Profissional[] {
    return this.profissionais.filter(p => 
      !this.filtroFuncao || p.funcao === this.filtroFuncao
    );
  }

  abrirFormulario(profissional?: Profissional): void {
    this.form.reset();
    this.mostraFormulario = true;
    if (profissional) {
      this.editandoId = profissional.id || null;
      this.form.patchValue({
        nome: profissional.nome,
        funcao: profissional.funcao,
        contato: profissional.contato,
        ativo: profissional.ativo,
        turno: profissional.turno
      });
    } else {
      this.editandoId = null;
      this.form.patchValue({ ativo: true, turno: 'MATUTINO' });
    }
  }

  fecharFormulario(): void {
    this.mostraFormulario = false;
    this.form.reset();
    this.editandoId = null;
  }

  salvar(): void {
    if (this.form.invalid) return;

    const dados: Profissional = this.form.value;

    if (this.editandoId) {
      this.profissionalService.atualizar(this.editandoId, dados).subscribe({
        next: () => {
          this.carregarDados();
          this.fecharFormulario();
        },
        error: (err) => {
          this.erro = 'Erro ao atualizar profissional';
        }
      });
    } else {
      this.profissionalService.criar(dados).subscribe({
        next: () => {
          this.carregarDados();
          this.fecharFormulario();
        },
        error: (err) => {
          this.erro = 'Erro ao criar profissional';
        }
      });
    }
  }

  excluir(id: number): void {
    if (confirm('Tem certeza que deseja excluir este profissional?')) {
      this.profissionalService.excluir(id).subscribe({
        next: () => {
          this.carregarDados();
        },
        error: (err) => {
          this.erro = 'Erro ao excluir profissional';
        }
      });
    }
  }

  getFuncaoLabel(funcao: string): string {
    const labels: Record<string, string> = {
      'MEDICO': '👨‍⚕️ Médico',
      'ENFERMEIRO': '🩺 Enfermeiro',
      'MOTORISTA': '🚗 Motorista'
    };
    return labels[funcao] || funcao;
  }

  getStatusColor(ativo: boolean): string {
    return ativo ? '#2ecc71' : '#e74c3c';
  }

  getStatusLabel(ativo: boolean): string {
    return ativo ? 'Ativo' : 'Inativo';
  }
}
