// ============================================================
// date.helper.ts — utilitários de data
//
// PADRÃO DE PROJETO 2: ADAPTER (ver shared/adapters/date.adapter.ts)
//
// Este módulo delega ao DateAdapterFactory a responsabilidade de
// escolher qual implementação usar (ArrayDateAdapter ou IsoDateAdapter)
// com base no formato que o backend enviou.
//
// Os componentes que chamam formatarData() continuam idênticos —
// eles não precisam saber que existem dois formatos possíveis.
// ============================================================

import { DateAdapterFactory } from '../adapters/date.adapter';

// Formata data com hora: "03/06/2025, 14:30:00"
// Padrão Adapter: DateAdapterFactory escolhe o adapter correto internamente
export function formatarData(data: string | number[] | null | undefined): string {
  const adapter = DateAdapterFactory.criar(data);
  return adapter ? adapter.formatar('pt-BR') : '—';
}

// Formata apenas a data sem hora: "03/06/2025"
// Padrão Adapter: mesma chamada, independente do formato recebido do backend
export function formatarDataCurta(data: string | number[] | null | undefined): string {
  const adapter = DateAdapterFactory.criar(data);
  return adapter ? adapter.formatarCurto() : '—';
}