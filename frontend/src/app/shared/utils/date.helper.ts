// ============================================================
// date.helper.ts
// Trata o formato de datas do backend Spring Boot.
//
// Por padrão o Jackson serializa LocalDateTime como ARRAY:
//   [2025, 6, 3, 14, 30, 0]   ← ano, mês, dia, hora, min, seg
//
// Se a colega adicionar no application.properties:
//   spring.jackson.serialization.write-dates-as-timestamps=false
// o backend vai passar a enviar strings ISO: "2025-06-03T14:30:00"
//
// Esta função aceita AMBOS os formatos sem precisar mudar os componentes.
// ============================================================

export function formatarData(data: string | number[] | null | undefined): string {
  if (!data) return '—';

  // Formato array: [ano, mes, dia, hora?, min?, seg?]
  if (Array.isArray(data)) {
    const [ano, mes, dia, hora = 0, min = 0, seg = 0] = data as number[];
    const d = new Date(ano, mes - 1, dia, hora, min, seg);
    return d.toLocaleString('pt-BR');
  }

  // Formato string ISO ou qualquer outro string
  try {
    return new Date(data as string).toLocaleString('pt-BR');
  } catch {
    return String(data);
  }
}

export function formatarDataCurta(data: string | number[] | null | undefined): string {
  if (!data) return '—';
  if (Array.isArray(data)) {
    const [ano, mes, dia] = data as number[];
    return `${String(dia).padStart(2,'0')}/${String(mes).padStart(2,'0')}/${ano}`;
  }
  try {
    return new Date(data as string).toLocaleDateString('pt-BR');
  } catch {
    return String(data);
  }
}