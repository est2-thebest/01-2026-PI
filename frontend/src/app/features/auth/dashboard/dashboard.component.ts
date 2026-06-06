import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../services/dashboard.service';
import { OcorrenciaService } from '../../../services/ocorrencia.service';
import { DashboardStats, Ocorrencia } from '../../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    ocorrenciasAbertas: 0,
    atendimentosHoje: 0,
    ambulanciasDisponiveis: 0,
    ambulanciasTotal: 0,
    equipesAtivas: 0,
    profissionaisCadastrados: 0
  };

  historicoOcorrencias: Ocorrencia[] = [];
  carregando = true;
  erro: string | null = null;

  constructor(
    private dashboardService: DashboardService,
    private ocorrenciaService: OcorrenciaService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.erro = null;
    
    this.dashboardService.getStats().subscribe({
      next: (dados) => {
        this.stats = dados;
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas:', err);
        this.erro = 'Erro ao carregar dashboard';
      }
    });

    this.ocorrenciaService.listarTodas().subscribe({
      next: (ocorrencias) => {
        this.historicoOcorrencias = ocorrencias
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 10);
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar ocorrências:', err);
        this.carregando = false;
      }
    });
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
  }
}
