import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AmbulanciaService } from '../../../services/ambulancia.service';
import { BairroService } from '../../../services/bairro.service';
import { Ambulancia, Bairro } from '../../../shared/models';

@Component({
  selector: 'app-ambulancias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ambulancias.component.html',
  styleUrl: './ambulancias.component.scss'
})
export class AmbulanciasComponent implements OnInit {
  ambulancias: Ambulancia[] = [];
  bairros: Bairro[] = [];
  carregando = true;
  erro: string | null = null;

  form: FormGroup;
  mostraFormulario = false;
  editandoId: number | null = null;

  constructor(
    private ambulanciaService: AmbulanciaService,
    private bairroService: BairroService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-\d{4}$/)]],
      tipo: ['USB', Validators.required],
      status: ['DISPONIVEL', Validators.required],
      bairroId: [null]
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.bairroService.listar().subscribe({
      next: (bairros) => {
        this.bairros = bairros;
      }
    });

    this.ambulanciaService.listar().subscribe({
      next: (ambulancias) => {
        this.ambulancias = ambulancias;
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar ambulâncias:', err);
        this.erro = 'Erro ao carregar ambulâncias';
        this.carregando = false;
      }
    });
  }

  abrirFormulario(ambulancia?: Ambulancia): void {
    this.form.reset();
    this.mostraFormulario = true;
    if (ambulancia) {
      this.editandoId = ambulancia.id || null;
      this.form.patchValue({
        placa: ambulancia.placa,
        tipo: ambulancia.tipo,
        status: ambulancia.status,
        bairroId: ambulancia.bairro?.id || null
      });
      this.form.get('placa')?.disable();
    } else {
      this.editandoId = null;
    }
  }

  fecharFormulario(): void {
    this.mostraFormulario = false;
    this.form.reset();
    this.editandoId = null;
  }

  salvar(): void {
    if (this.form.invalid) return;

    const bairro = this.bairros.find(b => b.id === this.form.get('bairroId')?.value);
    const dados: Ambulancia = {
      placa: this.form.get('placa')?.value,
      tipo: this.form.get('tipo')?.value,
      status: this.form.get('status')?.value,
      bairro
    };

    if (this.editandoId) {
      this.ambulanciaService.atualizar(this.editandoId, dados).subscribe({
        next: () => {
          this.carregarDados();
          this.fecharFormulario();
        },
        error: (err) => {
          this.erro = 'Erro ao atualizar ambulância';
        }
      });
    } else {
      this.ambulanciaService.criar(dados).subscribe({
        next: () => {
          this.carregarDados();
          this.fecharFormulario();
        },
        error: (err) => {
          this.erro = 'Erro ao criar ambulância';
        }
      });
    }
  }

  excluir(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta ambulância?')) {
      this.ambulanciaService.excluir(id).subscribe({
        next: () => {
          this.carregarDados();
        },
        error: (err) => {
          this.erro = 'Erro ao excluir ambulância';
        }
      });
    }
  }

  getStatusColor(status: string): string {
    const cores: Record<string, string> = {
      'DISPONIVEL': '#2ecc71',
      'EM_ATENDIMENTO': '#f39c12',
      'MANUTENCAO': '#e74c3c',
      'INATIVA': '#95a5a6',
      'SEM_EQUIPE': '#34495e'
    };
    return cores[status] || '#95a5a6';
  }
}
