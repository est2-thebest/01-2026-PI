import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { RelatorioService } from '../../../services/relatorio.service';
import { Ocorrencia, AtendimentoPorBairro } from '../../../shared/models';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorios.component.html',
  styleUrl: './relatorios.component.scss'
})
export class RelatoriosComponent implements OnInit {
  ocorrencias: Ocorrencia[]          = [];
  porBairro:   AtendimentoPorBairro[] = [];

  carregando = true;
  erro: string | null = null;

  filtroBusca     = '';
  filtroStatus    = '';
  filtroGravidade = '';
  filtroBairro    = '';

  readonly STATUS_LABELS: Record<string, string> = {
    ABERTA:         'Aberta',
    DESPACHADA:     'Despachada',
    EM_ATENDIMENTO: 'Em Atendimento',
    CONCLUIDA:      'Concluída',
    CANCELADA:      'Cancelada'
  };

  readonly GRAVIDADE_LABELS: Record<string, string> = {
    ALTA:  'Alta',
    MEDIA: 'Média',
    BAIXA: 'Baixa'
  };

  constructor(private relatorioService: RelatorioService) {}

  ngOnInit(): void { this.carregarDados(); }

  carregarDados(): void {
    this.carregando = true;
    this.erro = null;

    forkJoin({
      ocorrencias: this.relatorioService.listarOcorrencias(),
      porBairro:   this.relatorioService.listarPorBairro()
    }).subscribe({
      next: ({ ocorrencias, porBairro }) => {
        this.ocorrencias = ocorrencias;
        this.porBairro   = porBairro
          .filter(b => b.quantidade > 0)
          .sort((a, b) => b.quantidade - a.quantidade);
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar os dados. Verifique a conexão com o servidor.';
        this.carregando = false;
      }
    });
  }

  get ocorrenciasFiltradas(): Ocorrencia[] {
    const busca = this.filtroBusca.toLowerCase().trim();
    return this.ocorrencias.filter(oc => {
      const matchBusca     = !busca ||
        oc.tipo.toLowerCase().includes(busca) ||
        (oc.bairro?.nome || '').toLowerCase().includes(busca) ||
        (oc.observacao   || '').toLowerCase().includes(busca);
      const matchStatus    = !this.filtroStatus    || oc.status    === this.filtroStatus;
      const matchGravidade = !this.filtroGravidade || oc.gravidade === this.filtroGravidade;
      const matchBairro    = !this.filtroBairro    || (oc.bairro?.nome || '') === this.filtroBairro;
      return matchBusca && matchStatus && matchGravidade && matchBairro;
    });
  }

  get totalPorStatus(): Record<string, number> {
    const c: Record<string, number> = { ABERTA: 0, DESPACHADA: 0, EM_ATENDIMENTO: 0, CONCLUIDA: 0, CANCELADA: 0 };
    for (const oc of this.ocorrencias) c[oc.status] = (c[oc.status] || 0) + 1;
    return c;
  }

  get totalPorGravidade(): { chave: string; label: string; total: number; pct: number }[] {
    const base = this.ocorrencias.length || 1;
    return (['ALTA', 'MEDIA', 'BAIXA'] as const).map(g => ({
      chave: g,
      label: this.GRAVIDADE_LABELS[g],
      total: this.ocorrencias.filter(o => o.gravidade === g).length,
      pct:   Math.round(this.ocorrencias.filter(o => o.gravidade === g).length / base * 100)
    }));
  }

  get bairrosDisponiveis(): string[] {
    return [...new Set(
      this.ocorrencias.map(o => o.bairro?.nome).filter(Boolean) as string[]
    )].sort();
  }

  get maxBairro(): number {
    return this.porBairro[0]?.quantidade || 1;
  }

  converterData(data: string | number[]): Date {
    if (Array.isArray(data)) {
      return new Date(data[0], data[1] - 1, data[2], data[3] ?? 0, data[4] ?? 0, data[5] ?? 0);
    }
    return new Date(data);
  }

  limparFiltros(): void {
    this.filtroBusca = '';
    this.filtroStatus = '';
    this.filtroGravidade = '';
    this.filtroBairro = '';
  }

  exportarCSV(): void {
    const linhas = ['ID,Tipo,Gravidade,Status,Bairro,Data Abertura,Observação'];
    for (const oc of this.ocorrenciasFiltradas) {
      const d = this.converterData(oc.dataHoraAbertura);
      const data = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
      const obs = (oc.observacao || '').replace(/,/g, ';');
      linhas.push(`${oc.id},${oc.tipo},${oc.gravidade},${oc.status},${oc.bairro?.nome || ''},${data},${obs}`);
    }
    const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `relatorio-ocorrencias-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
