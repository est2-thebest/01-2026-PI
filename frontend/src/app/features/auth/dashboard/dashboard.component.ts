import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { DashboardService } from '../../../services/dashboard.service';
import { OcorrenciaService } from '../../../services/ocorrencia.service';
import { AmbulanciaService } from '../../../services/ambulancia.service';
import { EquipeService } from '../../../services/equipe.service';
import { DashboardStats, Ocorrencia, Ambulancia, Equipe } from '../../../shared/models';

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
  ambulanciasEmAtendimento: { ambulancia: Ambulancia; equipe: Equipe | null }[] = [];
  carregando = true;
  erro: string | null = null;

  constructor(
    private dashboardService: DashboardService,
    private ocorrenciaService: OcorrenciaService,
    private ambulanciaService: AmbulanciaService,
    private equipeService: EquipeService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.erro = null;

    this.dashboardService.getStats().subscribe({
      next: (dados) => { this.stats = dados; },
      error: () => { this.erro = 'Erro ao carregar dashboard'; }
    });

    forkJoin({
      ocorrencias: this.ocorrenciaService.listarTodas(),
      ambulancias: this.ambulanciaService.listar(),
      equipes:     this.equipeService.listar()
    }).subscribe({
      next: ({ ocorrencias, ambulancias, equipes }) => {
        this.historicoOcorrencias = ocorrencias
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 10);

        this.ambulanciasEmAtendimento = ambulancias
          .filter(a => a.status === 'EM_ATENDIMENTO')
          .map(a => ({
            ambulancia: a,
            equipe: equipes.find(e => e.ambulancia?.id === a.id) ?? null
          }));

        this.carregando = false;
      },
      error: () => { this.carregando = false; }
    });
  }



  converterData(data: string | number[]): Date {
    if (Array.isArray(data)) {
      return new Date(data[0], data[1] - 1, data[2], data[3], data[4], data[5] || 0);
    }
    return new Date(data);
  }
}
