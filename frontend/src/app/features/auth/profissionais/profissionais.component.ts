import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProfissionalService } from '../../../services/profissional.service';
import { ConfirmModalService } from '../../../shared/components/modals/confirm.service';
import { Profissional } from '../../../shared/models';

@Component({
  selector: 'app-profissionais',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profissionais.component.html',
  styleUrl: './profissionais.component.scss'
})
export class ProfissionaisComponent implements OnInit {
  profissionais: Profissional[] = [];
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
    private confirmService: ConfirmModalService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nome:          ['', [Validators.required, Validators.minLength(3)]],
      funcao:        ['MEDICO', Validators.required],
      turno:         ['MATUTINO'],
      contato:       ['', [Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      ativo:         [true, Validators.required],
      tipoDocumento: ['CPF'],
      documento:     ['', [(control: AbstractControl): ValidationErrors | null => {
        const valor = control.value as string;
        if (!valor) return null;
        const tipo = control.parent?.get('tipoDocumento')?.value;
        const cpfRe  = /^(?:\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/;
        const cnpjRe = /^(?:\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/;
        if (tipo === 'CPF'  && !cpfRe.test(valor))  return { documentoInvalido: true };
        if (tipo === 'CNPJ' && !cnpjRe.test(valor)) return { documentoInvalido: true };
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
    this.profissionalService.listar().subscribe({
      next: (profissionais: any[]) => {
        this.profissionais = profissionais.map(p => ({ ...p, funcao: p.funcao || p.role || null }));
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

  aplicarMascaraDocumento(valor: string): string {
    const tipo = this.form.get('tipoDocumento')?.value;
    const digits = valor.replace(/\D/g, '');

    if (tipo === 'CNPJ') {
      const d = digits.slice(0, 14);
      if (d.length <= 2)  return d;
      if (d.length <= 5)  return `${d.slice(0,2)}.${d.slice(2)}`;
      if (d.length <= 8)  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
      if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
      return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
    } else {
      const d = digits.slice(0, 11);
      if (d.length <= 3) return d;
      if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
      if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
      return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
    }
  }

  formatarDocumento(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatado = this.aplicarMascaraDocumento(input.value);
    input.value = formatado;
    this.form.get('documento')?.setValue(formatado, { emitEvent: false });
  }

  aplicarMascara(valor: string): string {
    const digits = valor.replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  formatarContato(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatado = this.aplicarMascara(input.value);
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
      this.form.patchValue({
        nome:    profissional.nome,
        funcao:  profissional.funcao,
        turno:   profissional.turno || 'MATUTINO',
        contato: this.aplicarMascara(profissional.contato || ''),
        ativo:   profissional.ativo
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
    if (this.form.invalid) return;
    this.salvando = true;
    this.erro = null;

    const dados: Profissional = {
      nome:    this.form.get('nome')?.value,
      funcao:  this.form.get('funcao')?.value,
      turno:   this.form.get('turno')?.value,
      contato: this.form.get('contato')?.value || null,
      ativo:   this.form.get('ativo')?.value
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