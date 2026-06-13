import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProfissionalService } from '../../../services/profissional.service';
import { EquipeService } from '../../../services/equipe.service';
import { ConfirmModalService } from '../../../shared/components/modals/confirm.service';
import { Profissional, Equipe } from '../../../shared/models';
import { REGEX, telefoneValidator, formatarTelefone, formatarCPF, formatarCNPJ } from '../../../shared/utils/validators';

@Component({
  selector: 'app-profissionais',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profissionais.component.html',
  styleUrl: './profissionais.component.scss'
})
export class ProfissionaisComponent implements OnInit {
  profissionais: Profissional[] = [];
  equipes: Equipe[] = [];
  carregando = true;
  salvando = false;
  erro: string | null = null;

  filtroBusca = '';
  filtroFuncao = '';
  filtroTurno = '';

  form: FormGroup;
  mostraFormulario = false;
  editandoId: number | null = null;

  readonly FUNCAO_LABELS: Record<string, string> = {
    MEDICO:     'Medico',
    ENFERMEIRO: 'Enfermeiro',
    MOTORISTA:  'Motorista'
  };

  readonly TURNO_LABELS: Record<string, string> = {
    MATUTINO:   'Matutino',
    VESPERTINO: 'Vespertino',
    NOTURNO:    'Noturno'
  };

  constructor(
    private profissionalService: ProfissionalService,
    private equipeService: EquipeService,
    private confirmService: ConfirmModalService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nome:          ['', [Validators.required, Validators.minLength(3)]],
      funcao:        ['MEDICO', Validators.required],
      turno:         ['MATUTINO'],
      contato:       ['', [Validators.required, telefoneValidator()]],
      ativo:         [true, Validators.required],
      tipoDocumento: ['CPF'],
      documento:     ['', [Validators.required, (control: AbstractControl): ValidationErrors | null => {
        const valor = control.value as string;
        if (!valor) return null;
        const tipo = control.parent?.get('tipoDocumento')?.value;
        if (tipo === 'CPF'  && !REGEX.CPF.test(valor))  return { documentoInvalido: true };
        if (tipo === 'CNPJ' && !REGEX.CNPJ.test(valor)) return { documentoInvalido: true };
        return null;
      }]]
    });
  }

  ngOnInit(): void {
    this.carregarDados();
    this.form.get('tipoDocumento')?.valueChanges.subscribe(() => {
      this.form.get('documento')?.setValue('');
      this.form.get('documento')?.updateValueAndValidity();
    });
  }

  carregarDados(): void {
    this.carregando = true;
    this.erro = null;
    forkJoin({
      profissionais: this.profissionalService.listar(),
      equipes:       this.equipeService.listar()
    }).subscribe({
      next: ({ profissionais, equipes }) => {
        this.profissionais = (profissionais as any[]).map(p => ({ ...p, funcao: p.funcao || p.role || null }));
        this.equipes = equipes;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar os profissionais. Verifique a conexão com o servidor.';
        this.carregando = false;
      }
    });
  }

  get profissionaisFiltrados(): Profissional[] {
    const busca = this.filtroBusca.toLowerCase().trim();
    return this.profissionais.filter(prof => {
      const matchBusca  = !busca || prof.nome.toLowerCase().includes(busca);
      const matchFuncao = !this.filtroFuncao || prof.funcao === this.filtroFuncao;
      const matchTurno  = !this.filtroTurno  || prof.turno  === this.filtroTurno;
      return matchBusca && matchFuncao && matchTurno;
    });
  }

  estaEmEquipe(prof: Profissional): boolean {
    return this.equipes.some(e => e.profissionais?.some(p => p.id === prof.id));
  }

  get placeholderDocumento(): string {
    return this.form.get('tipoDocumento')?.value === 'CNPJ'
      ? '99.999.999/9999-99'
      : '999.999.999-99';
  }

  get labelDocumentoInvalido(): string {
    return this.form.get('tipoDocumento')?.value === 'CNPJ'
      ? 'CNPJ inválido. Ex: 99.999.999/9999-99'
      : 'CPF inválido. Ex: 999.999.999-99';
  }

  formatarDocumento(event: Event): void {
    const input = event.target as HTMLInputElement;
    const tipo = this.form.get('tipoDocumento')?.value;
    const formatado = tipo === 'CNPJ' ? formatarCNPJ(input.value) : formatarCPF(input.value);
    input.value = formatado;
    this.form.get('documento')?.setValue(formatado, { emitEvent: false });
  }

  formatarContato(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatado = formatarTelefone(input.value);
    input.value = formatado;
    this.form.get('contato')?.setValue(formatado, { emitEvent: false });
  }

  labelFuncao(funcao: string): string {
    return this.FUNCAO_LABELS[funcao] || funcao;
  }

  labelTurno(turno?: string | null): string {
    return turno ? (this.TURNO_LABELS[turno] || turno) : '--';
  }

  abrirFormulario(profissional?: Profissional): void {
    this.form.reset({ funcao: 'MEDICO', turno: 'MATUTINO', ativo: true, contato: '', tipoDocumento: 'CPF', documento: '' });
    this.erro = null;
    if (profissional) {
      this.editandoId = profissional.id || null;
      const tipoDoc = profissional.cnpj ? 'CNPJ' : 'CPF';
      const docValor = profissional.cnpj || profissional.cpf || '';
      this.form.patchValue({
        nome:          profissional.nome,
        funcao:        profissional.funcao,
        turno:         profissional.turno || 'MATUTINO',
        contato:       formatarTelefone(profissional.contato || ''),
        ativo:         profissional.ativo,
        tipoDocumento: tipoDoc,
        documento:     docValor
      });
    } else {
      this.editandoId = null;
    }
    this.mostraFormulario = true;
  }

  fecharFormulario(): void {
    this.mostraFormulario = false;
    this.form.reset();
    this.editandoId = null;
    this.erro = null;
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.salvando = true;
    this.erro = null;

    const tipo      = this.form.get('tipoDocumento')?.value;
    const documento = this.form.get('documento')?.value || null;

    const dados = {
      nome:    this.form.get('nome')?.value,
      funcao:  this.form.get('funcao')?.value,
      turno:   this.form.get('turno')?.value,
      contato: this.form.get('contato')?.value || null,
      ativo:   this.form.get('ativo')?.value,
      cpf:     tipo === 'CPF'  ? documento : null,
      cnpj:    tipo === 'CNPJ' ? documento : null,
    };

    if (this.editandoId) {
      this.profissionalService.atualizar(this.editandoId, dados).subscribe({
        next: () => { this.salvando = false; this.carregarDados(); this.fecharFormulario(); },
        error: () => { this.salvando = false; this.erro = 'Erro ao atualizar profissional. Tente novamente.'; }
      });
    } else {
      this.profissionalService.criar(dados).subscribe({
        next: () => { this.salvando = false; this.carregarDados(); this.fecharFormulario(); },
        error: () => { this.salvando = false; this.erro = 'Erro ao cadastrar profissional. Verifique os dados.'; }
      });
    }
  }

  async inativar(prof: Profissional): Promise<void> {
    const confirmado = await this.confirmService.abrir({
      titulo:      'Inativar Profissional',
      mensagem:    `Inativar ${prof.nome}? O profissional não poderá ser adicionado a novas equipes, mas permanece no histórico.`,
      tipo:        'aviso',
      confirmText: 'Sim, inativar',
      cancelText:  'Cancelar'
    });
    if (confirmado) {
      this.profissionalService.atualizar(prof.id!, { ...prof, ativo: false }).subscribe({
        next: () => this.carregarDados(),
        error: () => { this.erro = 'Erro ao inativar profissional.'; }
      });
    }
  }

  async reativar(prof: Profissional): Promise<void> {
    const confirmado = await this.confirmService.abrir({
      titulo:      'Reativar Profissional',
      mensagem:    `Reativar ${prof.nome}? O profissional voltará a estar disponível para novas equipes.`,
      tipo:        'info',
      confirmText: 'Sim, reativar',
      cancelText:  'Cancelar'
    });
    if (confirmado) {
      this.profissionalService.atualizar(prof.id!, { ...prof, ativo: true }).subscribe({
        next: () => this.carregarDados(),
        error: () => { this.erro = 'Erro ao reativar profissional.'; }
      });
    }
  }

  async excluir(profissional: Profissional): Promise<void> {
    const confirmado = await this.confirmService.abrir({
      titulo: 'Excluir Profissional',
      mensagem: `Tem certeza que deseja excluir ${profissional.nome}? Esta ação não pode ser desfeita.`,
      tipo: 'perigo',
      confirmText: 'Sim, excluir',
      cancelText: 'Não, cancelar'
    });
    if (confirmado) {
      this.profissionalService.excluir(profissional.id!).subscribe({
        next: () => this.carregarDados(),
        error: (err) => {
          const msg = err?.error?.message || 'Não foi possível excluir este profissional. Verifique se há vínculos ativos.';
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