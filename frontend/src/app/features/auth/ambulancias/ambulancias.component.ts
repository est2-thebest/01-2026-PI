import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AmbulanciaService } from '../../../services/ambulancia.service';
// Padrão Decorator: BairroServiceComCache envolve BairroService adicionando cache
import { BairroServiceComCache } from '../../../shared/decorators/bairro-cache.service';
import { Ambulancia, Bairro } from '../../../shared/models';
import { ConfirmModalService } from '../../../shared/components/modals/confirm.service';
import { placaValidator, formatarPlaca } from '../../../shared/utils/validators';

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
  salvando   = false;
  erro: string | null = null;

  filtroBusca  = '';
  filtroStatus = '';
  filtroTipo   = '';

  form: FormGroup;
  mostraFormulario = false;
  editandoId: number | null = null;
  placaEditavel = false;

  readonly STATUS_LABELS: Record<string, string> = {
    DISPONIVEL:     'Disponível',
    EM_ATENDIMENTO: 'Em Atendimento',
    SEM_EQUIPE:     'Sem Equipe'
  };

  readonly TIPO_LABELS: Record<string, string> = {
    USA: 'USA — Avançado',
    USB: 'USB — Básico'
  };

  constructor(
    private ambulanciaService: AmbulanciaService,
    private bairroService: BairroServiceComCache,  // Decorator substitui BairroService
    private fb: FormBuilder,
    private confirmService: ConfirmModalService
  ) {
    this.form = this.fb.group({
      placa:    ['', [Validators.required, placaValidator()]],
      tipo:     ['USA', Validators.required],
      bairroId: [null, Validators.required]
    });
  }

  ngOnInit(): void { this.carregarDados(); }

  carregarDados(): void {
    this.carregando = true;
    this.erro = null;

    forkJoin({
      bairros:     this.bairroService.listar(),
      ambulancias: this.ambulanciaService.listar()
    }).subscribe({
      next: ({ bairros, ambulancias }) => {
        this.bairros     = bairros;
        this.ambulancias = ambulancias;
        this.carregando  = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar os dados. Verifique a conexão com o servidor.';
        this.carregando = false;
      }
    });
  }

  get ambulanciasFiltradas(): Ambulancia[] {
    const busca = this.filtroBusca.toLowerCase().trim();
    return this.ambulancias.filter(amb => {
      const matchBusca  = !busca ||
        amb.placa.toLowerCase().includes(busca) ||
        (amb.bairro?.nome || '').toLowerCase().includes(busca);
      const matchStatus = !this.filtroStatus || amb.status === this.filtroStatus;
      const matchTipo   = !this.filtroTipo   || amb.tipo   === this.filtroTipo;
      return matchBusca && matchStatus && matchTipo;
    });
  }

  get totalDisponiveis(): number   { return this.ambulancias.filter(a => a.status === 'DISPONIVEL').length; }
  get totalEmAtendimento(): number { return this.ambulancias.filter(a => a.status === 'EM_ATENDIMENTO').length; }

  // Editar disponível para todos exceto EM_ATENDIMENTO
  podeEditar(amb: Ambulancia): boolean {
    return amb.status !== 'EM_ATENDIMENTO';
  }

  // Excluir somente quando sem equipe e sem histórico de atendimento
  podeExcluir(amb: Ambulancia): boolean {
    return amb.status === 'SEM_EQUIPE' && !amb.possuiHistorico;
  }

  labelStatus(status: string): string { return this.STATUS_LABELS[status] || status; }
  labelTipo(tipo: string): string     { return this.TIPO_LABELS[tipo] || tipo; }

  formatarPlacaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatado = formatarPlaca(input.value);
    input.value = formatado;
    this.form.get('placa')?.setValue(formatado, { emitEvent: false });
  }

  abrirFormulario(ambulancia?: Ambulancia): void {
    this.form.reset({ tipo: 'USA', bairroId: null });
    this.mostraFormulario = true;
    this.erro = null;

    if (ambulancia) {
      this.editandoId    = ambulancia.id || null;
      this.placaEditavel = ambulancia.status === 'SEM_EQUIPE';
      this.form.patchValue({
        placa:    ambulancia.placa,
        tipo:     ambulancia.tipo,
        bairroId: ambulancia.bairro?.id ?? null
      });
      this.placaEditavel
        ? this.form.get('placa')?.enable()
        : this.form.get('placa')?.disable();
    } else {
      this.editandoId    = null;
      this.placaEditavel = true;
      this.form.get('placa')?.enable();
    }
  }

  fecharFormulario(): void {
    this.mostraFormulario = false;
    this.placaEditavel    = false;
    this.form.reset();
    this.editandoId = null;
    this.erro = null;
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando = true;
    this.erro = null;

    const bairroId: number | null = this.form.get('bairroId')?.value ?? null;
    const bairro = bairroId ? (this.bairros.find(b => b.id === bairroId) ?? null) : null;

    const dados: any = {
      placa:    this.form.getRawValue().placa,
      tipo:     this.form.get('tipo')?.value,
      status:   this.editandoId
        ? (this.ambulancias.find(a => a.id === this.editandoId)?.status ?? 'SEM_EQUIPE')
        : 'SEM_EQUIPE',
      bairroBaseId: bairroId
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

  async excluir(ambulancia: Ambulancia): Promise<void> {
    const confirmado = await this.confirmService.abrir({
      titulo:      'Excluir Ambulância',
      mensagem:    `Tem certeza que deseja excluir a ambulância ${ambulancia.placa} (${this.labelTipo(ambulancia.tipo)})? Esta ação não pode ser desfeita.`,
      tipo:        'perigo',
      confirmText: 'Sim, excluir',
      cancelText:  'Não, cancelar'
    });
    if (confirmado) {
      this.ambulanciaService.excluir(ambulancia.id!).subscribe({
        next: () => this.carregarDados(),
        error: (err) => {
          const msg = err?.error?.message || 'Não foi possível excluir esta ambulância.';
          this.confirmService.abrir({
            titulo:      'Erro ao excluir',
            mensagem:    msg,
            tipo:        'info',
            confirmText: 'OK, entendi'
          });
        }
      });
    }
  }
}
