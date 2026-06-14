import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { OcorrenciaService } from '../../../services/ocorrencia.service';
import { AmbulanciaService } from '../../../services/ambulancia.service';
import { EquipeService } from '../../../services/equipe.service';
import { ConfirmModalService } from '../../../shared/components/modals/confirm.service';
import { Ocorrencia, Ambulancia, Equipe } from '../../../shared/models';
import { formatarData } from '../../../shared/utils/date.helper';

// Arestas do grafo (bidirecional) — fonte: ruas_conexoes.csv  [origem, destino, km]
const ARESTAS: [number, number, number][] = [
  [9,16,6.4],[15,19,8.3],[17,7,1.2],[3,5,12.2],[12,4,14.0],
  [13,7,9.2],[13,6,19.2],[5,9,13.2],[16,3,3.4],[8,10,12.8],
  [20,1,14.4],[14,3,18.1],[2,18,1.9],[6,11,15.7],[1,17,14.5],
  [3,4,19.2],[14,19,18.9],[15,18,18.5],[20,2,14.7],[15,20,12.7],
  [17,15,7.9],[4,12,6.4],[5,15,8.6],[6,2,13.4],[14,15,9.4],
  [9,3,18.7],[18,7,1.7],[13,7,17.5],[18,9,9.0],[15,11,18.3],
  [3,4,3.0],[7,2,13.9],[20,4,7.7],[5,16,14.3],[13,4,12.8],
  [1,16,13.4],[14,3,14.3],[2,6,16.7],[11,8,16.6],[11,10,4.6],
  [4,1,7.0],[11,7,14.4],[13,5,6.2],[9,20,2.7],[13,15,8.3],
  [17,13,16.3],[10,14,7.9],[8,1,17.9],[9,2,19.3],[16,17,18.4],
  [6,14,9.0],[2,19,5.1],[6,5,1.3],[2,1,1.4],[20,19,3.7],
  [20,2,6.5],[4,8,13.1],[4,19,3.8],[16,11,2.8],[13,16,7.8]
];

// Dijkstra retornando distância e caminho
function dijkstra(origem: number, destino: number): { distancia: number; caminho: number[] } {
  if (!origem || !destino) return { distancia: 0, caminho: [] };
  if (origem === destino)  return { distancia: 0, caminho: [origem] };

  const adj: Record<number, [number, number][]> = {};
  for (const [a, b, d] of ARESTAS) {
    (adj[a] ??= []).push([b, d]);
    (adj[b] ??= []).push([a, d]);
  }

  const dist: Record<number, number> = { [origem]: 0 };
  const prev: Record<number, number> = {};
  const heap: [number, number][]     = [[0, origem]];

  while (heap.length) {
    heap.sort((x, y) => x[0] - y[0]);
    const [d, u] = heap.shift()!;
    if (d > (dist[u] ?? Infinity)) continue;
    if (u === destino) break;
    for (const [v, w] of (adj[u] ?? [])) {
      const nd = d + w;
      if (nd < (dist[v] ?? Infinity)) {
        dist[v] = nd;
        prev[v] = u;
        heap.push([nd, v]);
      }
    }
  }

  const caminho: number[] = [];
  let curr: number | undefined = destino;
  while (curr !== undefined) { caminho.unshift(curr); curr = prev[curr]; }

  if (caminho[0] !== origem) return { distancia: 999, caminho: [] };
  return { distancia: Math.round((dist[destino] ?? 999) * 10) / 10, caminho };
}

// Coordenadas (x,y) de cada bairro no SVG viewBox 0 0 560 420
const BAIRRO_POS: Record<number, [number, number]> = {
  1:  [185, 210],  // Jardim América
  2:  [285, 205],  // Centro
  3:  [460, 165],  // Setor Leste
  4:  [415, 295],  // Vila Nova
  5:  [145, 65],   // Alto da Serra
  6:  [90,  120],  // Setor Oeste
  7:  [525, 60],   // Distrito Industrial
  8:  [80,  380],  // Residencial Esperança
  9:  [375, 110],  // Recanto Verde
  10: [185, 385],  // Ecoparque Sul
  11: [405, 375],  // Nova Alvorada
  12: [510, 310],  // Setor das Palmeiras
  13: [215, 120],  // Colina Azul
  14: [490, 235],  // Bela Vista
  15: [315, 370],  // Morada do Sol
  16: [370, 185],  // Setor Central II
  17: [320, 65],   // Lago Azul
  18: [445, 70],   // Residencial Florença
  19: [505, 370],  // Setor Industrial Norte
  20: [325, 260],  // Vale do Cerrado
};

const BAIRROS_MAPA: { id: number; abrev: string }[] = [
  { id:  1, abrev: 'J.América'    },
  { id:  2, abrev: 'Centro'       },
  { id:  3, abrev: 'Leste'        },
  { id:  4, abrev: 'Vila Nova'    },
  { id:  5, abrev: 'Alto Serra'   },
  { id:  6, abrev: 'Oeste'        },
  { id:  7, abrev: 'Industrial'   },
  { id:  8, abrev: 'Esperança'    },
  { id:  9, abrev: 'Recanto'      },
  { id: 10, abrev: 'Ecoparque'    },
  { id: 11, abrev: 'N.Alvorada'   },
  { id: 12, abrev: 'Palmeiras'    },
  { id: 13, abrev: 'Colina'       },
  { id: 14, abrev: 'Bela Vista'   },
  { id: 15, abrev: 'Morada Sol'   },
  { id: 16, abrev: 'Central II'   },
  { id: 17, abrev: 'Lago Azul'    },
  { id: 18, abrev: 'Florença'     },
  { id: 19, abrev: 'Ind. Norte'   },
  { id: 20, abrev: 'Cerrado'      },
];

@Component({
  selector: 'app-despacho',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './despacho.component.html',
  styleUrl: './despacho.component.scss'
})
export class DespachoComponent implements OnInit {
  ocorrenciasAbertasData: Ocorrencia[] = [];
  ambulanciasDisponiveis: Ambulancia[] = [];
  private _equipes: Equipe[] = [];

  carregando  = true;
  despachando = false;
  erro:    string | null = null;
  sucesso: string | null = null;

  ocorrenciaSelecionada: Ocorrencia | null = null;
  ambulanciaRecomendada: Ambulancia | null = null;
  equipeRecomendada:     Equipe     | null = null;
  distanciaKm   = 0;
  tempoEstimado = 0;

  // Mapa
  readonly bairrosMapa  = BAIRROS_MAPA;
  readonly bairroPos    = BAIRRO_POS;
  rotaCaminho: number[] = [];
  private _rotaEdges    = new Set<string>();

  // Arestas únicas para visualização (menor distância entre par)
  readonly arestasVisuais: [number, number, number][] = (() => {
    const m = new Map<string, [number, number, number]>();
    for (const [a, b, d] of ARESTAS) {
      const k = `${Math.min(a,b)}-${Math.max(a,b)}`;
      if (!m.has(k) || d < m.get(k)![2]) m.set(k, [a, b, d]);
    }
    return Array.from(m.values());
  })();

  readonly GRAVIDADE_LABELS: Record<string, string> = {
    ALTA: 'Alta', MEDIA: 'Média', BAIXA: 'Baixa'
  };
  readonly TIPO_LABELS: Record<string, string> = {
    USA: 'USA — Suporte Avançado',
    USB: 'USB — Suporte Básico'
  };

  constructor(
    private ocorrenciaService: OcorrenciaService,
    private ambulanciaService: AmbulanciaService,
    private equipeService: EquipeService,
    private confirmService: ConfirmModalService
  ) {}

  ngOnInit(): void { this.carregarDados(); }

  carregarDados(): void {
    this.carregando = true;
    this.erro = null;
    forkJoin({
      ocorrencias: this.ocorrenciaService.listarTodas(),
      ambulancias: this.ambulanciaService.listar(),
      equipes:     this.equipeService.listar()
    }).subscribe({
      next: ({ ocorrencias, ambulancias, equipes }) => {
        this.ocorrenciasAbertasData = ocorrencias.filter(o => o.status === 'ABERTA');
        this.ambulanciasDisponiveis = ambulancias.filter(a => a.status === 'DISPONIVEL');
        this._equipes = equipes;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar os dados. Verifique a conexão.';
        this.carregando = false;
      }
    });
  }

  selecionarOcorrencia(oc: Ocorrencia): void {
    const mesmaSelecionada = this.ocorrenciaSelecionada?.id === oc.id;
    this.ocorrenciaSelecionada = mesmaSelecionada ? null : oc;
    this.ambulanciaRecomendada = null;
    this.equipeRecomendada     = null;
    this.rotaCaminho = [];
    this._rotaEdges  = new Set();
    this.sucesso = null;
    this.erro    = null;
    if (this.ocorrenciaSelecionada) this.calcularRecomendacao();
  }

  calcularRecomendacao(): void {
    const oc = this.ocorrenciaSelecionada;
    if (!oc || this.ambulanciasDisponiveis.length === 0) return;

    const ocBairroId = oc.bairro?.id ?? 0;
    let candidatas   = [...this.ambulanciasDisponiveis];
    if (oc.gravidade === 'ALTA') {
      const usas = candidatas.filter(a => a.tipo === 'USA');
      if (usas.length > 0) candidatas = usas;
    }

    const comRota = candidatas.map(amb => ({
      amb,
      ...dijkstra(amb.bairro?.id ?? 0, ocBairroId)
    }));
    comRota.sort((a, b) => a.distancia - b.distancia);

    const melhor = comRota[0];
    this.ambulanciaRecomendada = melhor.amb;
    this.equipeRecomendada     = this._equipes.find(e => e.ambulancia?.id === melhor.amb.id) ?? null;
    this.distanciaKm   = melhor.distancia;
    this.tempoEstimado = Math.round(melhor.distancia);
    this.rotaCaminho   = melhor.caminho;

    this._rotaEdges = new Set();
    for (let i = 0; i < this.rotaCaminho.length - 1; i++) {
      const a = this.rotaCaminho[i], b = this.rotaCaminho[i + 1];
      this._rotaEdges.add(`${Math.min(a,b)}-${Math.max(a,b)}`);
    }
  }

  // ── Helpers para o SVG ────────────────────────────────────
  pos(id: number): [number, number] {
    return BAIRRO_POS[id] ?? [0, 0];
  }

  isEdgeRota(a: number, b: number): boolean {
    return this._rotaEdges.has(`${Math.min(a,b)}-${Math.max(a,b)}`);
  }

  nodeClass(id: number): string {
    if (id === this.ambulanciaRecomendada?.bairro?.id) return 'node-origem';
    if (id === this.ocorrenciaSelecionada?.bairro?.id) return 'node-destino';
    if (this.rotaCaminho.includes(id)) return 'node-rota';
    return 'node-base';
  }

  labelDy(id: number): number {
    const [, y] = BAIRRO_POS[id] ?? [0, 0];
    return y < 90 ? 18 : -10;
  }

  labelAnchor(id: number): string {
    const [x] = BAIRRO_POS[id] ?? [0, 0];
    if (x < 60)  return 'start';
    if (x > 520) return 'end';
    return 'middle';
  }

  async confirmarDespacho(): Promise<void> {
    if (!this.ocorrenciaSelecionada || !this.ambulanciaRecomendada) return;
    const oc  = this.ocorrenciaSelecionada;
    const amb = this.ambulanciaRecomendada;

    const confirmado = await this.confirmService.abrir({
      titulo:      'Confirmar Despacho',
      mensagem:    `Despachar ${amb.placa} para ocorrência #${oc.id} — ${oc.tipo} (${oc.bairro?.nome || '—'})?`,
      tipo:        'aviso',
      confirmText: 'Sim, despachar',
      cancelText:  'Cancelar'
    });
    if (!confirmado) return;

    this.despachando = true;
    this.ocorrenciaService.despachar(oc.id!, amb.id!).subscribe({
      next: () => {
        this.sucesso = `Ambulância ${amb.placa} despachada para ocorrência #${oc.id}!`;
        this.despachando = false;
        this.ocorrenciaSelecionada = null;
        this.ambulanciaRecomendada = null;
        this.equipeRecomendada     = null;
        this.rotaCaminho = [];
        this._rotaEdges  = new Set();
        this.carregarDados();
      },
      error: (err: any) => {
        this.despachando = false;
        this.erro = err?.error?.message || 'Erro ao realizar despacho. Tente novamente.';
      }
    });
  }

  formatarData(data: string | number[] | null | undefined): string {
    return formatarData(data);
  }
}