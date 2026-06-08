import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AmbulanciaService } from '../../../services/ambulancia.service';
import { BairroService } from '../../../services/bairro.service';
import { Ambulancia, Bairro } from '../../../shared/models';
import { ConfirmModalService } from '../../../shared/components/modals/confirm.service';

@Component({
  selector: 'app-ambulancias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ambulancias.component.html',
  styleUrl: './ambulancias.component.scss'
})
export class AmbulanciasComponent implements OnInit {
  ambulancias: Ambulancia[] = [];
  bairros: Bairro[] = [];
  carregando = true;
  salvando = false;
  erro: string | null = null;

  // Filtros
  filtroBusca = '';
  filtroStatus = '';
  filtroTipo = '';

  // Modal
  form: FormGroup;
  mostraFormulario = false;
  editandoId: number | null = null;


  readonly STATUS_LABELS: Record<string, string> = {
    DISPONIVEL:    'Disponível',
    EM_ATENDIMENTO:'Em Atendimento',
    MANUTENCAO:    'Manutenção',
    INATIVA:       'Inativa',
    SEM_EQUIPE:    'Sem Equipe'
  };

  readonly TIPO_LABELS: Record<string, string> = {
    USA: 'USA — Avançado',
    USB: 'USB — Básico'
  };

  constructor(
    private ambulanciaService: AmbulanciaService,
    private bairroService: BairroService,
    private fb: FormBuilder,
    private confirmService: ConfirmModalService
  ) {
    this.form = this.fb.group({
      placa:    ['', [Validators.required, Validators.pattern(/^[A-Z]{3}\d[A-Z]\d{2}$|^[A-Z]{3}\d{4}$/)]],
      tipo:     ['USA', Validators.required],
      status:   ['DISPONIVEL', Validators.required],
      bairroId: [null]
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.erro = null;

    this.bairroService.listar().subscribe({
      next: (bairros) => { this.bairros = bairros; },
      error: () => { /* bairros são opcionais */ }
    });

    this.ambulanciaService.listar().subscribe({
      next: (ambulancias) => {
        this.ambulancias = ambulancias;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar as ambulâncias. Verifique a conexão com o servidor.';
        this.carregando = false;
      }
    });
  }

  get ambulanciasFiltradas(): Ambulancia[] {
    const busca = this.filtroBusca.toLowerCase().trim();
    return this.ambulancias.filter(amb => {
      const matchBusca = !busca ||
        amb.placa.toLowerCase().includes(busca) ||
        (amb.bairro?.nome || '').toLowerCase().includes(busca);
      const matchStatus = !this.filtroStatus || amb.status === this.filtroStatus;
      const matchTipo   = !this.filtroTipo   || amb.tipo   === this.filtroTipo;
      return matchBusca && matchStatus && matchTipo;
    });
  }

  get totalDisponiveis(): number {
    return this.ambulancias.filter(a => a.status === 'DISPONIVEL').length;
  }
  get totalEmAtendimento(): number {
    return this.ambulancias.filter(a => a.status === 'EM_ATENDIMENTO').length;
  }
  get totalManutencao(): number {
    return this.ambulancias.filter(a => a.status === 'MANUTENCAO').length;
  }

  labelStatus(status: string): string {
    return this.STATUS_LABELS[status] || status;
  }
  labelTipo(tipo: string): string {
    return this.TIPO_LABELS[tipo] || tipo;
  }

  abrirFormulario(ambulancia?: Ambulancia): void {
    this.form.reset({ tipo: 'USA', status: 'DISPONIVEL', bairroId: null });
    this.mostraFormulario = true;
    if (ambulancia) {
      this.editandoId = ambulancia.id || null;
      this.form.patchValue({
        placa:    ambulancia.placa,
        tipo:     ambulancia.tipo,
        status:   ambulancia.status,
        bairroId: ambulancia.bairro?.id || null
      });
      this.form.get('placa')?.disable();
    } else {
      this.editandoId = null;
      this.form.get('placa')?.enable();
    }
  }

  fecharFormulario(): void {
    this.mostraFormulario = false;
    this.form.reset();
    this.editandoId = null;
    this.erro = null;
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando = true;
    this.erro = null;

    const bairroId = this.form.get('bairroId')?.value;
    const bairro = bairroId ? this.bairros.find(b => b.id === +bairroId) : null;

    const dados: Ambulancia = {
      placa:  this.form.get('placa')?.value || '',
      tipo:   this.form.get('tipo')?.value,
      status: this.form.get('status')?.value,
      bairro: bairro ?? null
    };

    if (this.editandoId) {
      this.ambulanciaService.atualizar(this.editandoId, dados).subscribe({
        next: () => { this.salvando = false; this.carregarDados(); this.fecharFormulario(); },
        error: () => { this.salvando = false; this.erro = 'Erro ao atualizar ambulância. Tente novamente.'; }
      });
    } else {
      this.ambulanciaService.criar(dados).subscribe({
        next: () => { this.salvando = false; this.carregarDados(); this.fecharFormulario(); },
        error: () => { this.salvando = false; this.erro = 'Erro ao cadastrar ambulância. Verifique os dados.'; }
      });
    }
  }

   // ─── Excluir ──────────────────────────────────────────────────────────────
  async excluir(ambulancia: Ambulancia): Promise<void> {
    const confirmado = await this.confirmService.abrir({
      titulo: 'Excluir Ambulância',
      mensagem: `Tem certeza que deseja excluir a ambulância ${ambulancia.placa} (${this.labelTipo(ambulancia.tipo)})? Esta ação não pode ser desfeita.`,
      tipo: 'perigo',
      confirmText: 'Sim, excluir',
      cancelText: 'Não, cancelar'
    });
    if (confirmado) {
      this.ambulanciaService.excluir(ambulancia.id!).subscribe({
        next: () => this.carregarDados(),
        error: (err) => {
          const msg = err?.error?.message || 'Não foi possível excluir esta ambulância. Verifique se há atendimento vinculado.';
          this.confirmService.abrir({
            titulo: 'Erro ao excluir',
            mensagem: msg,
            tipo: 'info',
            confirmText: 'OK, entendi'
          });
        }
      });
    }
  }
}
