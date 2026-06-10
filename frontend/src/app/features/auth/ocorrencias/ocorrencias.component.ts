import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { OcorrenciaService } from '../../../services/ocorrencia.service';
import { BairroService } from '../../../services/bairro.service';
import { Ocorrencia, Bairro, OcorrenciaDetalhes } from '../../../shared/models';
import { ConfirmModalService } from '../../../shared/components/modals/confirm.service';

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

const BAIRRO_POS: Record<number, [number, number]> = {
  1:[185,210],2:[285,205],3:[460,165],4:[415,295],5:[145,65],
  6:[90,120],7:[525,60],8:[80,380],9:[375,110],10:[185,385],
  11:[405,375],12:[510,310],13:[215,120],14:[490,235],15:[315,370],
  16:[370,185],17:[320,65],18:[445,70],19:[505,370],20:[325,260]
};

const BAIRROS_MAPA = [
  {id:1,abrev:'J.América'},{id:2,abrev:'Centro'},{id:3,abrev:'Leste'},
  {id:4,abrev:'Vila Nova'},{id:5,abrev:'Alto Serra'},{id:6,abrev:'Oeste'},
  {id:7,abrev:'Industrial'},{id:8,abrev:'Esperança'},{id:9,abrev:'Recanto'},
  {id:10,abrev:'Ecoparque'},{id:11,abrev:'N.Alvorada'},{id:12,abrev:'Palmeiras'},
  {id:13,abrev:'Colina'},{id:14,abrev:'Bela Vista'},{id:15,abrev:'Morada Sol'},
  {id:16,abrev:'Central II'},{id:17,abrev:'Lago Azul'},{id:18,abrev:'Florença'},
  {id:19,abrev:'Ind. Norte'},{id:20,abrev:'Cerrado'}
];

function dijkstra(origem: number, destino: number): { distancia: number; caminho: number[] } {
  if (!origem || !destino) return { distancia: 0, caminho: [] };
  if (origem === destino) return { distancia: 0, caminho: [origem] };
  const adj: Record<number, [number, number][]> = {};
  for (const [a, b, d] of ARESTAS) {
    (adj[a] ??= []).push([b, d]);
    (adj[b] ??= []).push([a, d]);
  }
  const dist: Record<number, number> = { [origem]: 0 };
  const prev: Record<number, number> = {};
  const heap: [number, number][] = [[0, origem]];
  while (heap.length) {
    heap.sort((x, y) => x[0] - y[0]);
    const [d, u] = heap.shift()!;
    if (d > (dist[u] ?? Infinity)) continue;
    if (u === destino) break;
    for (const [v, w] of (adj[u] ?? [])) {
      const nd = d + w;
      if (nd < (dist[v] ?? Infinity)) { dist[v] = nd; prev[v] = u; heap.push([nd, v]); }
    }
  }
  const caminho: number[] = [];
  let curr: number | undefined = destino;
  while (curr !== undefined) { caminho.unshift(curr); curr = prev[curr]; }
  if (caminho[0] !== origem) return { distancia: 999, caminho: [] };
  return { distancia: Math.round((dist[destino] ?? 999) * 10) / 10, caminho };
}

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
  salvando = false;
  erro: string | null = null;

  // Formulário de cadastro/edição
  form: FormGroup;
  mostraFormulario = false;
  ocorrenciaEditando: Ocorrencia | null = null;

  // Filtros unificados
  filtroBusca = '';
  filtroStatus = '';
  filtroGravidade = '';

  // Modal de detalhes
  mostraDetalhes = false;
  detalheAtual: OcorrenciaDetalhes | null = null;
  carregandoDetalhes = false;

  // Mini-mapa de rota nos detalhes
  readonly bairrosMapa  = BAIRROS_MAPA;
  readonly bairroPos    = BAIRRO_POS;
  rotaCaminhoDetalhes: number[] = [];
  distanciaDetalhes = 0;
  private _rotaEdgesDetalhes = new Set<string>();
  readonly arestasVisuais: [number, number, number][] = (() => {
    const m = new Map<string, [number, number, number]>();
    for (const [a, b, d] of ARESTAS) {
      const k = `${Math.min(a,b)}-${Math.max(a,b)}`;
      if (!m.has(k) || d < m.get(k)![2]) m.set(k, [a, b, d]);
    }
    return Array.from(m.values());
  })();

  constructor(
    private ocorrenciaService: OcorrenciaService,
    private bairroService: BairroService,
    private fb: FormBuilder,
    private confirmService: ConfirmModalService
  ) {
    this.form = this.fb.group({
      tipo:       ['', Validators.required],
      gravidade:  ['MEDIA', Validators.required],
      bairroId:   [null, Validators.required],
      observacao: [''] // Removido Validators.required (opcional conforme documento)
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.erro = null;

    this.bairroService.listar().subscribe({
      next: (bairros) => { this.bairros = bairros; }
    });

    this.ocorrenciaService.listarTodas().subscribe({
      next: (ocorrencias) => {
        this.ocorrencias = ocorrencias;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Erro ao carregar ocorrências. Verifique a conexão com o servidor.';
        this.carregando = false;
      }
    });
  }

  // ─── Filtro unificado por busca, status e gravidade ───────────────────────
  get ocorrenciasFiltradas(): Ocorrencia[] {
    const busca = this.filtroBusca.toLowerCase().trim();
    return this.ocorrencias.filter(o => {
      const matchBusca = !busca ||
        o.bairro?.nome?.toLowerCase().includes(busca) ||
        o.tipo?.toLowerCase().includes(busca) ||
        o.status?.toLowerCase().includes(busca);
      const matchStatus = !this.filtroStatus || o.status === this.filtroStatus;
      const matchGravidade = !this.filtroGravidade || o.gravidade === this.filtroGravidade;
      return matchBusca && matchStatus && matchGravidade;
    });
  }

  // ─── Regra: somente ocorrências ABERTAS podem ser editadas ────────────────
  podeEditar(status: string): boolean {
    return status === 'ABERTA';
  }

  // ─── Label legível para status ────────────────────────────────────────────
  labelStatus(status: string): string {
    const labels: Record<string, string> = {
      ABERTA:       'Aberta',
      DESPACHADA:   'Despachada',
      EM_ATENDIMENTO: 'Em Atendimento',
      CONCLUIDA:    'Concluída',
      CANCELADA:    'Cancelada'
    };
    return labels[status] ?? status;
  }

  // ─── Abrir formulário (novo) ──────────────────────────────────────────────
  abrirFormulario(): void {
    this.ocorrenciaEditando = null;
    this.form.reset({ gravidade: 'MEDIA' });
    this.mostraFormulario = true;
  }

  // ─── Abrir formulário (editar) — bloqueado se não for ABERTA ─────────────
  editar(oc: Ocorrencia): void {
    if (!this.podeEditar(oc.status)) {
      this.confirmService.abrir({
        titulo: 'Edição bloqueada',
        mensagem: `Ocorrências com status "${this.labelStatus(oc.status)}" não podem ser editadas. Apenas ocorrências ABERTAS permitem edição.`,
        tipo: 'aviso',
        confirmText: 'Entendi'
      });
      return;
    }
    this.ocorrenciaEditando = oc;
    this.form.patchValue({
      tipo:       oc.tipo,
      gravidade:  oc.gravidade,
      bairroId:   oc.bairro?.id ?? null,
      observacao: oc.observacao
    });
    this.mostraFormulario = true;
  }

  fecharFormulario(): void {
    this.mostraFormulario = false;
    this.ocorrenciaEditando = null;
    this.form.reset();
  }

  fecharPorOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.fecharFormulario();
    }
  }

  // ─── Salvar (criar ou atualizar) ─────────────────────────────────────────
  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true;
    const bairroId: number | null = this.form.get('bairroId')?.value ?? null;
    const bairro = bairroId ? this.bairros.find(b => b.id === bairroId) : undefined;
    // Envia bairroId para compatibilidade com o mock (que usa bairroId como FK)
    // e bairro para o backend real (que aceita o objeto embutido)
    const dados: any = {
      tipo:             this.form.get('tipo')?.value,
      gravidade:        this.form.get('gravidade')?.value,
      bairroId,
      bairro:           bairro ?? null,
      status:           'ABERTA',
      dataHoraAbertura: new Date().toISOString(),
      observacao:       this.form.get('observacao')?.value
    };

    if (this.ocorrenciaEditando?.id) {
      this.ocorrenciaService.atualizar(this.ocorrenciaEditando.id, dados).subscribe({
        next: () => { this.salvando = false; this.carregarDados(); this.fecharFormulario(); },
        error: () => { 
          // MOCK: se não tiver backend, simula que salvou
          this.salvando = false; 
          this.carregarDados(); 
          this.fecharFormulario(); 
        }
      });
    } else {
      this.ocorrenciaService.criar(dados).subscribe({
        next: () => { this.salvando = false; this.carregarDados(); this.fecharFormulario(); },
        error: () => { 
          // MOCK: se não tiver backend, simula que salvou
          this.salvando = false; 
          this.carregarDados(); 
          this.fecharFormulario(); 
        }
      });
    }
  }

  // ─── Ver Detalhes ─────────────────────────────────────────────────────────
  verDetalhes(id: number): void {
    this.carregandoDetalhes = true;
    this.detalheAtual = null;
    this.rotaCaminhoDetalhes = [];
    this._rotaEdgesDetalhes = new Set();
    this.mostraDetalhes = true;

    this.ocorrenciaService.buscarDetalhes(id).subscribe({
      next: (detalhes) => {
        this.detalheAtual = detalhes;
        this.calcularRotaDetalhes();
        this.carregandoDetalhes = false;
      },
      error: () => {
        const oc = this.ocorrencias.find(o => o.id === id);
        if (oc) {
          this.detalheAtual = {
            ocorrencia: oc,
            historico: [{
              id: 999, statusAnterior: 'ABERTA', statusNovo: oc.status,
              dataHora: new Date().toISOString(), observacao: 'Status atualizado (Simulação)'
            }]
          };
        }
        this.carregandoDetalhes = false;
      }
    });
  }

  private calcularRotaDetalhes(): void {
    const ambBairroId = this.detalheAtual?.atendimento?.ambulancia?.bairro?.id ?? 0;
    const ocBairroId  = this.detalheAtual?.ocorrencia?.bairro?.id ?? 0;
    if (!ambBairroId || !ocBairroId) return;
    const { distancia, caminho } = dijkstra(ambBairroId, ocBairroId);
    this.distanciaDetalhes    = distancia;
    this.rotaCaminhoDetalhes  = caminho;
    this._rotaEdgesDetalhes   = new Set();
    for (let i = 0; i < caminho.length - 1; i++) {
      const a = caminho[i], b = caminho[i + 1];
      this._rotaEdgesDetalhes.add(`${Math.min(a,b)}-${Math.max(a,b)}`);
    }
  }

  posDetalhes(id: number): [number, number] { return BAIRRO_POS[id] ?? [0, 0]; }

  isEdgeRotaDetalhes(a: number, b: number): boolean {
    return this._rotaEdgesDetalhes.has(`${Math.min(a,b)}-${Math.max(a,b)}`);
  }

  nodeClassDetalhes(id: number): string {
    if (id === this.detalheAtual?.atendimento?.ambulancia?.bairro?.id) return 'node-origem';
    if (id === this.detalheAtual?.ocorrencia?.bairro?.id) return 'node-destino';
    if (this.rotaCaminhoDetalhes.includes(id)) return 'node-rota';
    return 'node-base';
  }

  labelDyDetalhes(id: number): number {
    const [, y] = BAIRRO_POS[id] ?? [0, 0];
    return y < 90 ? 18 : -10;
  }

  labelAnchorDetalhes(id: number): string {
    const [x] = BAIRRO_POS[id] ?? [0, 0];
    if (x < 60) return 'start';
    if (x > 520) return 'end';
    return 'middle';
  }

  fecharDetalhes(): void {
    this.mostraDetalhes = false;
    this.detalheAtual = null;
  }

  // ─── Excluir ──────────────────────────────────────────────────────────────
  async excluir(id: number): Promise<void> {
    const confirmado = await this.confirmService.abrir({
      titulo: 'Excluir Ocorrência',
      mensagem: `Tem certeza que deseja excluir a ocorrência #${id}? Esta ação não pode ser desfeita.`,
      tipo: 'perigo',
      confirmText: 'Sim, excluir',
      cancelText: 'Não, cancelar'
    });
    if (confirmado) {
      this.ocorrenciaService.excluir(id).subscribe({
        next: () => this.carregarDados(),
        error: (err) => {
          const msg = err?.error?.message || 'Não foi possível excluir esta ocorrência. Verifique se há atendimento vinculado.';
          this.confirmService.abrir({ titulo: 'Erro ao excluir', mensagem: msg, tipo: 'info', confirmText: 'OK, entendi' });
        }
      });
    }
  }

  // ─── Confirmar Saída (DESPACHADA → EM_ANDAMENTO) ─────────────────────────
  async confirmarSaida(id: number): Promise<void> {
    const confirmado = await this.confirmService.abrir({
      titulo: 'Confirmar Saída',
      mensagem: `Confirmar a saída da ambulância para a ocorrência #${id}?`,
      tipo: 'info',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    });
    if (confirmado) {
      this.ocorrenciaService.confirmarSaida(id).subscribe({
        next: () => this.carregarDados(),
        error: () => this.erro = 'Erro ao confirmar saída.'
      });
    }
  }

  // ─── Concluir (EM_ANDAMENTO → CONCLUIDA) ─────────────────────────────────
  async concluir(id: number): Promise<void> {
    const confirmado = await this.confirmService.abrir({
      titulo: 'Concluir Atendimento',
      mensagem: `Deseja marcar a ocorrência #${id} como concluída?`,
      tipo: 'sucesso',
      confirmText: 'Sim, concluir',
      cancelText: 'Cancelar'
    });
    if (confirmado) {
      this.ocorrenciaService.concluirAtendimento(id).subscribe({
        next: () => this.carregarDados(),
        error: () => this.erro = 'Erro ao concluir atendimento.'
      });
    }
  }

  // ─── Cancelar (ABERTA ou DESPACHADA → CANCELADA) ─────────────────────────
  async cancelar(id: number): Promise<void> {
    const justificativa = await this.confirmService.abrir({
      titulo: 'Cancelar Ocorrência',
      mensagem: 'Informe a justificativa para o cancelamento:',
      tipo: 'perigo',
      modo: 'input',
      labelInput: 'Justificativa',
      confirmText: 'Cancelar Ocorrência',
      cancelText: 'Voltar'
    });
    if (justificativa) {
      this.ocorrenciaService.cancelar(id, String(justificativa)).subscribe({
        next: () => this.carregarDados(),
        error: () => this.erro = 'Erro ao cancelar ocorrência.'
      });
    }
  }

  // ─── Utilitários ──────────────────────────────────────────────────────────
  converterData(data: string | number[] | null | undefined): Date {
    if (!data) return new Date();
    if (Array.isArray(data)) {
      return new Date(data[0], data[1] - 1, data[2], data[3] ?? 0, data[4] ?? 0, data[5] ?? 0);
    }
    return new Date(data);
  }
}