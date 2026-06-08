import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { OcorrenciaService } from '../../../services/ocorrencia.service';
import { BairroService } from '../../../services/bairro.service';
import { Ocorrencia, Bairro, OcorrenciaDetalhes } from '../../../shared/models';
import { ConfirmModalService } from '../../../shared/components/modals/confirm.service';

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
      bairroId:   oc.bairro?.id,
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
    const bairro = this.bairros.find(b => b.id === Number(this.form.get('bairroId')?.value));
    const dados: Ocorrencia = {
      tipo:             this.form.get('tipo')?.value,
      gravidade:        this.form.get('gravidade')?.value,
      bairro,
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
    this.mostraDetalhes = true;

    this.ocorrenciaService.buscarDetalhes(id).subscribe({
      next: (detalhes) => {
        this.detalheAtual = detalhes;
        this.carregandoDetalhes = false;
      },
      error: () => {
        // Fallback: exibe dados locais com histórico simulado para demonstração
        const oc = this.ocorrencias.find(o => o.id === id);
        if (oc) {
          this.detalheAtual = { 
            ocorrencia: oc, 
            historico: [
              {
                id: 999,
                statusAnterior: 'ABERTA',
                statusNovo: oc.status,
                dataHora: new Date().toISOString(),
                observacao: 'Status atualizado (Simulação)'
              }
            ] 
          };
        }
        this.carregandoDetalhes = false;
      }
    });
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