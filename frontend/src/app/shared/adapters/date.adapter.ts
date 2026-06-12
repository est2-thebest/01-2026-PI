// ============================================================
// PADRÃO DE PROJETO 2: ADAPTER
// Arquivo: shared/adapters/date.adapter.ts
// ============================================================
//
// DEFINIÇÃO:
//   O Adapter converte a interface de uma classe em outra interface
//   que os clientes esperam. Permite que classes com interfaces
//   incompatíveis trabalhem juntas sem modificar nenhuma delas.
//
// PROBLEMA REAL DESTE PROJETO:
//   O backend Spring Boot serializa LocalDateTime em dois formatos
//   incompatíveis dependendo da configuração do Jackson:
//
//   FORMATO A — Array (padrão Jackson sem configuração extra):
//     [2025, 6, 3, 14, 30, 0]   ← [ano, mês, dia, hora, min, seg]
//
//   FORMATO B — String ISO 8601 (com write-dates-as-timestamps=false):
//     "2025-06-03T14:30:00"
//
// SEM O ADAPTER → código duplicado em todo componente:
//   if (Array.isArray(data)) { ... } else { new Date(data) ... }
//
// COM O ADAPTER → interface única para qualquer formato:
//   DateAdapterFactory.criar(data).toDate()
//   DateAdapterFactory.criar(data).formatar()
//
// ESTRUTURA (espelha a RelatorioFactory do backend):
//
//   IDateAdapter              ← interface comum ("contrato")
//     ├── ArrayDateAdapter    ← adapta o formato array do Jackson
//     └── IsoDateAdapter      ← adapta o formato string ISO 8601
//
//   DateAdapterFactory.criar(valor)
//     └── detecta o formato em runtime e retorna o adapter correto
//
// ANALOGIA COM O BACKEND:
//   O backend usa o padrão Factory Method com RelatorioFactory
//   para criar CSV ou PDF pela mesma interface (criarRelatorio()).
//   Aqui fazemos o mesmo: DateAdapterFactory cria ArrayDateAdapter
//   ou IsoDateAdapter pela mesma interface (IDateAdapter).
// ============================================================

// ── Interface: define o contrato que ambos os adapters devem cumprir ─────────
export interface IDateAdapter {
  /** Converte o valor recebido para um objeto Date nativo do JavaScript */
  toDate(): Date;

  /** Formata a data com hora longa: "03/06/2025, 14:30:00" */
  formatar(locale?: string): string;

  /** Formata apenas a data sem hora: "03/06/2025" */
  formatarCurto(): string;
}

// ── Adapter A: trata o formato array [ano, mes, dia, hora, min, seg] ─────────
// Adaptado de: Jackson padrão do Spring Boot (write-dates-as-timestamps=true)
export class ArrayDateAdapter implements IDateAdapter {
  private readonly data: Date;

  constructor(valor: number[]) {
    // Jackson usa mês base-1; Date do JS usa base-0, por isso -1 no mês
    const [ano, mes, dia, hora = 0, min = 0, seg = 0] = valor;
    this.data = new Date(ano, mes - 1, dia, hora, min, seg);
  }

  toDate(): Date { return this.data; }

  formatar(locale = 'pt-BR'): string {
    return this.data.toLocaleString(locale);
  }

  formatarCurto(): string {
    const d = String(this.data.getDate()).padStart(2, '0');
    const m = String(this.data.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}/${this.data.getFullYear()}`;
  }
}

// ── Adapter B: trata o formato string ISO "YYYY-MM-DDTHH:mm:ss" ──────────────
// Adaptado de: Spring Boot com spring.jackson.serialization.write-dates-as-timestamps=false
export class IsoDateAdapter implements IDateAdapter {
  private readonly data: Date;

  constructor(valor: string) {
    this.data = new Date(valor);
  }

  toDate(): Date { return this.data; }

  formatar(locale = 'pt-BR'): string {
    return this.data.toLocaleString(locale);
  }

  formatarCurto(): string {
    return this.data.toLocaleDateString('pt-BR');
  }
}

// ── Factory: detecta o formato em runtime e retorna o adapter correto ─────────
// O chamador não precisa saber qual formato chegou — essa decisão fica aqui.
export class DateAdapterFactory {

  /**
   * Cria o adapter adequado com base no tipo do valor recebido.
   *
   * Exemplos:
   *   DateAdapterFactory.criar([2025, 6, 3, 14, 30]) → ArrayDateAdapter
   *   DateAdapterFactory.criar("2025-06-03T14:30")   → IsoDateAdapter
   *   DateAdapterFactory.criar(null)                 → null
   */
  static criar(valor: string | number[] | null | undefined): IDateAdapter | null {
    if (!valor) return null;

    // Detecta o formato pelo tipo em tempo de execução (runtime type check)
    if (Array.isArray(valor)) {
      return new ArrayDateAdapter(valor as number[]);  // usa ArrayDateAdapter
    }

    return new IsoDateAdapter(valor as string);        // usa IsoDateAdapter
  }
}