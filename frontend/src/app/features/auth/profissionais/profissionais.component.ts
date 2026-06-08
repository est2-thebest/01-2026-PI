import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
      nome:    ['', [Validators.required, Validators.minLength(3)]],
      funcao:  ['MEDICO', Validators.required],
      turno:   ['MATUTINO'],
      contato: ['', [Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      ativo:   [true, Validators.required]
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.erro = null;
    this.profissionalService.listar().subscribe({
      next: (profissionais) => {
        this.profissionais = profissionais;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Nao foi possivel carregar os profissionais. Verifique a conexao com o servidor.';
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
    this.form.reset({ funcao: 'MEDICO', turno: 'MATUTINO', ativo: true, contato: '' });
    this.mostraFormulario = true;
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
      mensagem: `Tem certeza que deseja excluir ${profissional.nome}? Esta acao nao pode ser desfeita.`,
      tipo: 'perigo',
      confirmText: 'Sim, excluir',
      cancelText: 'Nao, cancelar'
    });
    if (confirmado) {
      this.profissionalService.excluir(profissional.id!).subscribe({
        next: () => this.carregarDados(),
        error: (err) => {
          const msg = err?.error?.message || 'Nao foi possivel excluir este profissional. Verifique se ha vinculos ativos.';
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