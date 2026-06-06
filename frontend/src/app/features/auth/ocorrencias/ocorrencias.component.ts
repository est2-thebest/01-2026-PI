import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { OcorrenciaService } from '../../../services/ocorrencia.service';
import { BairroService } from '../../../services/bairro.service';
import { Ocorrencia, Bairro } from '../../../shared/models';

@Component({
  selector: 'app-ocorrencias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ocorrencias.component.html',
  styleUrl: './ocorrencias.component.scss'
})
export class OcorrenciasComponent implements OnInit {
  ocorrencias: Ocorrencia[] = [];
  bairros: Bairro[] = [];
  carregando = true;
  erro: string | null = null;

  form: FormGroup;
  mostraFormulario = false;
  filtroBairro = '';
  filtroStatus = '';
  filtroGravidade = '';

  constructor(
    private ocorrenciaService: OcorrenciaService,
    private bairroService: BairroService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      tipo: ['', Validators.required],
      gravidade: ['MEDIA', Validators.required],
      bairroId: [null, Validators.required],
      observacao: ['']
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

    this.ocorrenciaService.listarTodas().subscribe({
      next: (ocorrencias) => {
        this.ocorrencias = ocorrencias;
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar ocorrências:', err);
        this.erro = 'Erro ao carregar ocorrências';
        this.carregando = false;
      }
    });
  }

  get ocorrenciasFiltradas(): Ocorrencia[] {
    return this.ocorrencias.filter(o => {
      const matchBairro = !this.filtroBairro || o.bairro?.nome?.toLowerCase().includes(this.filtroBairro.toLowerCase());
      const matchStatus = !this.filtroStatus || o.status === this.filtroStatus;
      const matchGravidade = !this.filtroGravidade || o.gravidade === this.filtroGravidade;
      return matchBairro && matchStatus && matchGravidade;
    });
  }

  abrirFormulario(): void {
    this.form.reset();
    this.mostraFormulario = true;
  }

  fecharFormulario(): void {
    this.mostraFormulario = false;
    this.form.reset();
  }

  criar(): void {
    if (this.form.invalid) return;

    const bairro = this.bairros.find(b => b.id === this.form.get('bairroId')?.value);
    const dados: Ocorrencia = {
      tipo: this.form.get('tipo')?.value,
      gravidade: this.form.get('gravidade')?.value,
      bairro,
      status: 'ABERTA',
      dataHoraAbertura: new Date().toLocaleString(),
      observacao: this.form.get('observacao')?.value
    };

    this.ocorrenciaService.criar(dados).subscribe({
      next: () => {
        this.carregarDados();
        this.fecharFormulario();
      },
      error: (err) => {
        this.erro = 'Erro ao criar ocorrência';
      }
    });
  }

  despachar(id: number): void {
    if (confirm('Deseja despachar esta ocorrência?')) {
      this.ocorrenciaService.confirmarSaida(id).subscribe({
        next: () => {
          this.carregarDados();
        },
        error: (err) => {
          this.erro = 'Erro ao despachar ocorrência';
        }
      });
    }
  }

  concluir(id: number): void {
    if (confirm('Deseja concluir este atendimento?')) {
      this.ocorrenciaService.concluirAtendimento(id).subscribe({
        next: () => {
          this.carregarDados();
        },
        error: (err) => {
          this.erro = 'Erro ao concluir atendimento';
        }
      });
    }
  }

  cancelar(id: number): void {
    const justificativa = prompt('Justificativa para cancelamento:');
    if (justificativa !== null) {
      this.ocorrenciaService.cancelar(id, justificativa).subscribe({
        next: () => {
          this.carregarDados();
        },
        error: (err) => {
          this.erro = 'Erro ao cancelar ocorrência';
        }
      });
    }
  }

  getStatusColor(status: string): string {
    const cores: Record<string, string> = {
      'ABERTA': '#ff6b6b',
      'DESPACHADA': '#ffd93d',
      'EM_ANDAMENTO': '#6bcf7f',
      'CONCLUIDA': '#4d96ff',
      'CANCELADA': '#95a5a6'
    };
    return cores[status] || '#95a5a6';
  }

  getGravidadeColor(gravidade: string): string {
    const cores: Record<string, string> = {
      'ALTA': '#ff6b6b',
      'MEDIA': '#ffd93d',
      'BAIXA': '#95a5a6'
    };
    return cores[gravidade] || '#95a5a6';
  }

  converterData(data: string | number[]): Date {
    if (Array.isArray(data)) {
      return new Date(data[0], data[1] - 1, data[2], data[3], data[4], data[5] || 0);
    }
    return new Date(data);
  }}