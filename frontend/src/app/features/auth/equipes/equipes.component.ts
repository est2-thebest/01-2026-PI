import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { EquipeService } from '../../../services/equipe.service';
import { AmbulanciaService } from '../../../services/ambulancia.service';
import { ProfissionalService } from '../../../services/profissional.service';
import { ConfirmModalService } from '../../../shared/components/modals/confirm.service';
import { Equipe, Ambulancia, Profissional } from '../../../shared/models';

@Component({
  selector: 'app-equipes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './equipes.component.html',
  styleUrl: './equipes.component.scss'
})
export class EquipesComponent implements OnInit {
  equipes: Equipe[] = [];
  ambulancias: Ambulancia[] = [];
  private _profissionaisAtivos: Profissional[] = [];

  carregando = true;
  salvando = false;
  erro: string | null = null;

  filtroBusca = '';
  filtroTurno = '';

  form: FormGroup;
  mostraFormulario = false;
  editandoId: number | null = null;
  profissionaisSelecionados: Profissional[] = [];

  readonly TURNO_LABELS: Record<string, string> = {
    MATUTINO:   'Matutino',
    VESPERTINO: 'Vespertino',
    NOTURNO:    'Noturno'
  };

  readonly STATUS_LABELS: Record<string, string> = {
    ATIVA:          'Ativa',
    EM_ATENDIMENTO: 'Em Atendimento',
    INATIVA:        'Inativa'
  };

  readonly FUNCAO_ABBREV: Record<string, string> = {
    MEDICO:     'M',
    ENFERMEIRO: 'E',
    MOTORISTA:  'MO'
  };

  constructor(
    private equipeService: EquipeService,
    private ambulanciaService: AmbulanciaService,
    private profissionalService: ProfissionalService,
    private confirmService: ConfirmModalService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      descricao:    ['', [Validators.required, Validators.minLength(3)]],
      ambulanciaId: [null, Validators.required],
      turno:        ['MATUTINO', Validators.required]
    });
  }

  ngOnInit(): void {
    this.carregarDados();
    this.form.get('turno')?.valueChanges.subscribe(() => {
      const turno = this.form.get('turno')?.value;
      this.profissionaisSelecionados = this.profissionaisSelecionados.filter(p => p.turno === turno);
    });
  }

  carregarDados(): void {
    this.carregando = true;
    this.erro = null;

    forkJoin({
      ambulancias:   this.ambulanciaService.listar(),
      profissionais: this.profissionalService.listar()
    }).subscribe({
      next: ({ ambulancias, profissionais }) => {
        this.ambulancias = ambulancias;
        this._profissionaisAtivos = (profissionais as any[])
          .map(p => ({ ...p, funcao: p.funcao || p.role || null }))
          .filter((p: any) => p.ativo);
        this.carregarEquipes();
      },
      error: () => {
        this.erro = 'Não foi possível carregar os dados. Verifique a conexão com o servidor.';
        this.carregando = false;
      }
    });
  }

  private carregarEquipes(): void {
    this.equipeService.listar().subscribe({
      next: (responses: any[]) => {
        this.equipes = responses.map(r => ({
          id:              r.id,
          descricao:       r.descricao,
          turno:           r.turno,
          status:          r.status || 'DISPONIVEL',
          ativo:           r.status !== 'INATIVA',
          possuiHistorico: r.possuiHistorico || false,
          ambulancia:      r.ambulancia || this.ambulancias.find(a => a.id === r.ambulanciaId) || null,
          profissionais:   (r.profissionais || []).map((p: any) => ({ ...p, funcao: p.funcao || p.role || null }))
        }));
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar as equipes. Verifique a conexão com o servidor.';
        this.carregando = false;
      }
    });
  }

  // Somente ambulâncias sem equipe aparecem para seleção (+ a atual ao editar)
  get ambulanciasDisponiveis(): Ambulancia[] {
    const editingAmbId: number | null = this.editandoId ? this.form.get('ambulanciaId')?.value : null;
    return this.ambulancias.filter(a =>
      a.status === 'SEM_EQUIPE' ||
      (editingAmbId !== null && a.id === editingAmbId)
    );
  }

  // IDs de profissionais já vinculados a outras equipes (ignora a equipe sendo editada)
  private get profissionaisEmUso(): Set<number> {
    const emUso = new Set<number>();
    for (const eq of this.equipes) {
      if (eq.id === this.editandoId) continue;
      for (const p of eq.profissionais || []) {
        if (p.id != null) emUso.add(p.id);
      }
    }
    return emUso;
  }

  // Filtra profissionais pelo turno e exclui os já em outra equipe
  get profissionaisDisponiveis(): Profissional[] {
    const turno = this.form.get('turno')?.value;
    const emUso = this.profissionaisEmUso;
    return this._profissionaisAtivos.filter(p =>
      (!turno || p.turno === turno) && !emUso.has(p.id!)
    );
  }

  get equipesFiltradas(): Equipe[] {
    const busca = this.filtroBusca.toLowerCase().trim();
    return this.equipes.filter(e => {
      const matchBusca = !busca || e.descricao.toLowerCase().includes(busca);
      const matchTurno = !this.filtroTurno || e.turno === this.filtroTurno;
      return matchBusca && matchTurno;
    });
  }

  statusEquipe(equipe: Equipe): 'ATIVA' | 'EM_ATENDIMENTO' | 'INATIVA' {
    if (equipe.status === 'EM_ATENDIMENTO') return 'EM_ATENDIMENTO';
    if (equipe.status === 'INATIVA') return 'INATIVA';
    return 'ATIVA';
  }

  podeEditar(equipe: Equipe): boolean {
    return this.statusEquipe(equipe) === 'ATIVA';
  }

  podeInativar(equipe: Equipe): boolean {
    return this.statusEquipe(equipe) === 'ATIVA';
  }

  podeReativar(equipe: Equipe): boolean {
    return this.statusEquipe(equipe) === 'INATIVA';
  }

  podeExcluir(equipe: Equipe): boolean {
    return this.statusEquipe(equipe) !== 'EM_ATENDIMENTO' && !equipe.possuiHistorico;
  }

  labelTurno(turno: string): string {
    return this.TURNO_LABELS[turno] || turno;
  }

  abrevFuncao(funcao: string | null | undefined): string {
    if (!funcao) return '';
    return this.FUNCAO_ABBREV[funcao] || funcao.charAt(0);
  }

  abrirFormulario(equipe?: Equipe): void {
    this.form.reset({ descricao: '', ambulanciaId: null, turno: 'MATUTINO' });
    this.profissionaisSelecionados = [];
    this.erro = null;

    if (equipe) {
      this.editandoId = equipe.id || null;
      this.form.patchValue({
        descricao:    equipe.descricao,
        ambulanciaId: equipe.ambulancia?.id || null,
        turno:        equipe.turno
      });
      this.profissionaisSelecionados = [...(equipe.profissionais || [])];
    } else {
      this.editandoId = null;
    }

    this.mostraFormulario = true;
  }

  fecharFormulario(): void {
    this.mostraFormulario = false;
    this.form.reset();
    this.editandoId = null;
    this.profissionaisSelecionados = [];
    this.erro = null;
  }

  toggleProfissional(prof: Profissional): void {
    const idx = this.profissionaisSelecionados.findIndex(p => p.id === prof.id);
    if (idx >= 0) {
      this.profissionaisSelecionados.splice(idx, 1);
    } else {
      this.profissionaisSelecionados.push(prof);
    }
  }

  isProfissionalSelecionado(prof: Profissional): boolean {
    return this.profissionaisSelecionados.some(p => p.id === prof.id);
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const medicos     = this.profissionaisSelecionados.filter(p => p.funcao === 'MEDICO');
    const enfermeiros = this.profissionaisSelecionados.filter(p => p.funcao === 'ENFERMEIRO');
    const motoristas  = this.profissionaisSelecionados.filter(p => p.funcao === 'MOTORISTA');
    if (medicos.length !== 1 || enfermeiros.length !== 1 || motoristas.length !== 1) {
      this.erro = 'A equipe deve ter exatamente 1 médico, 1 enfermeiro(a) e 1 motorista.';
      return;
    }

    this.salvando = true;
    this.erro = null;

    const payload = {
      descricao:       this.form.get('descricao')?.value,
      ambulanciaId:    this.form.get('ambulanciaId')?.value || null,
      turno:           this.form.get('turno')?.value,
      profissionalIds: this.profissionaisSelecionados.map(p => p.id!)
    };

    const onSuccess = () => {
      // O backend já atualiza o status das ambulâncias em EquipeService
      this.salvando = false;
      this.carregarDados();
      this.fecharFormulario();
    };

    if (this.editandoId) {
      this.equipeService.atualizar(this.editandoId, payload).subscribe({
        next: onSuccess,
        error: (err: any) => {
          this.salvando = false;
          this.erro = err?.error?.message || 'Erro ao atualizar equipe. Tente novamente.';
        }
      });
    } else {
      this.equipeService.criar(payload).subscribe({
        next: onSuccess,
        error: (err: any) => {
          this.salvando = false;
          this.erro = err?.error?.message || 'Erro ao cadastrar equipe. Verifique os dados.';
        }
      });
    }
  }

  async inativar(equipe: Equipe): Promise<void> {
    const confirmado = await this.confirmService.abrir({
      titulo:      'Inativar Equipe',
      mensagem:    `Inativar a equipe "${equipe.descricao}"? Ela não ficará disponível para novos despachos.`,
      tipo:        'aviso',
      confirmText: 'Sim, inativar',
      cancelText:  'Cancelar'
    });
    if (!confirmado) return;

    this.equipeService.inativar(equipe.id!).subscribe({
      next: () => this.carregarDados(),
      error: (err: any) => { this.erro = err?.error?.message || 'Erro ao inativar equipe.'; }
    });
  }

  async reativar(equipe: Equipe): Promise<void> {
    const confirmado = await this.confirmService.abrir({
      titulo:      'Reativar Equipe',
      mensagem:    `Reativar a equipe "${equipe.descricao}"? Ela voltará a ficar disponível para despacho.`,
      tipo:        'info',
      confirmText: 'Sim, reativar',
      cancelText:  'Cancelar'
    });
    if (!confirmado) return;

    this.equipeService.reativar(equipe.id!).subscribe({
      next: () => this.carregarDados(),
      error: (err: any) => { this.erro = err?.error?.message || 'Erro ao reativar equipe.'; }
    });
  }

  async excluir(equipe: Equipe): Promise<void> {
    const confirmado = await this.confirmService.abrir({
      titulo:      'Excluir Equipe',
      mensagem:    `Tem certeza que deseja excluir a equipe "${equipe.descricao}"? Esta ação não pode ser desfeita.`,
      tipo:        'perigo',
      confirmText: 'Sim, excluir',
      cancelText:  'Nao, cancelar'
    });
    if (confirmado) {
      this.equipeService.excluir(equipe.id!).subscribe({
        next: () => {
          // O backend já reverte o status da ambulância em EquipeService.deletar()
          this.carregarDados();
        },
        error: (err: any) => {
          const msg = err?.error?.message || 'Não foi possível excluir esta equipe. Verifique se há ocorrências vinculadas.';
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