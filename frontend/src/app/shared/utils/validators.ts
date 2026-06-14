// ============================================================
// validators.ts
// VALIDAÇÕES COM EXPRESSÕES REGULARES — requisito do PI Eng5
// Disciplina: Linguagens Formais e Autômatos e Compiladores
//
// TABELA DE EXPRESSÕES REGULARES (entregar impressa na apresentação):
// ┌─────────────────────────┬──────────────────────────────────────────┐
// │ Campo                   │ Expressão Regular                        │
// ├─────────────────────────┼──────────────────────────────────────────┤
// │ Placa Mercosul          │ ^[A-Z]{3}[0-9][A-Z][0-9]{2}$            │
// │ Placa Antiga (BR)       │ ^[A-Z]{3}[0-9]{4}$                      │
// │ CPF                     │ ^\d{3}\.\d{3}\.\d{3}-\d{2}$             │
// │ CNPJ                    │ ^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$      │
// │ Telefone celular        │ ^\(?\d{2}\)?\s?9\d{4}-?\d{4}$           │
// │ Telefone fixo           │ ^\(?\d{2}\)?\s?\d{4}-?\d{4}$            │
// │ E-mail                  │ ^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$ │
// └─────────────────────────┴──────────────────────────────────────────┘
//
// AUTÔMATOS FINITOS (3 escolhidos para o documento impresso):
//   AF1 — Placa Mercosul: 7 estados, reconhece AAA1A11
//   AF2 — CPF: estados para dígitos com pontos e traço
//   AF3 — Telefone: reconhece (62) 99999-9999 e variações
// ============================================================

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Expressões regulares exportadas (use nas aulas e no documento impresso)
export const REGEX = {
  PLACA_MERCOSUL: /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/,
  PLACA_ANTIGA:   /^[A-Z]{3}[0-9]{4}$/,
  CPF:            /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  CNPJ:           /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  TELEFONE:       /^\(\d{2}\)\s9\d{4}-\d{4}$/,
  EMAIL:          /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
};

// ── Validator: Placa (Mercosul AAA1A11 ou antiga AAA1111) ──
// AF escolhido para diagrama — reconhece ambos os formatos
export function placaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const val = (control.value as string).toUpperCase().trim();
    if (REGEX.PLACA_MERCOSUL.test(val) || REGEX.PLACA_ANTIGA.test(val)) return null;
    return { placaInvalida: { message: 'Placa inválida. Use AAA1111 (antiga) ou AAA1A11 (Mercosul)' } };
  };
}

// ── Validator: CPF (000.000.000-00) ──
// AF escolhido para diagrama
export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    if (REGEX.CPF.test((control.value as string).trim())) return null;
    return { cpfInvalido: { message: 'CPF inválido. Use o formato 000.000.000-00' } };
  };
}

// ── Validator: Telefone — (62) 99999-9999 ou variações ──
// AF escolhido para diagrama
export function telefoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const digits = (control.value as string).replace(/\D/g, '');
    if (digits.length === 10) {
      return { faltaDigitoNove: { message: 'Falta o dígito 9 após o DDD. Ex: (62) 99999-9999' } };
    }
    if (REGEX.TELEFONE.test((control.value as string).trim())) return null;
    return { telefoneInvalido: { message: 'Telefone inválido. Ex: (62) 99999-9999' } };
  };
}

// ── Validator: CNPJ (00.000.000/0001-00) ──
export function cnpjValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    if (REGEX.CNPJ.test((control.value as string).trim())) return null;
    return { cnpjInvalido: { message: 'CNPJ inválido. Use o formato 00.000.000/0001-00' } };
  };
}

// ── Validator: E-mail ──
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    if (REGEX.EMAIL.test((control.value as string).trim())) return null;
    return { emailInvalido: { message: 'E-mail inválido' } };
  };
}

// ── Funções de formatação automática ──

// Formata placa para maiúscula (usar no evento input)
export function formatarPlaca(valor: string): string {
  return valor.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 7);
}

// Formata CPF: 00000000000 → 000.000.000-00
export function formatarCPF(valor: string): string {
  const n = valor.replace(/\D/g, '').substring(0, 11);
  return n
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
}

// Formata CNPJ: 00000000000100 → 00.000.000/0001-00
export function formatarCNPJ(valor: string): string {
  const n = valor.replace(/\D/g, '').substring(0, 14);
  return n
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
}

// Formata telefone: 62999999999 → (62) 99999-9999
export function formatarTelefone(valor: string): string {
  const n = valor.replace(/\D/g, '').substring(0, 11);
  if (n.length <= 10) {
    return n.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return n.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}