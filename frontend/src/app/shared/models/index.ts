// ============================================================
// MODELOS VERIFICADOS CONTRA OS ARQUIVOS JAVA DO BACKEND
//
// Ambulancia.java   → status: DISPONIVEL | EM_ATENDIMENTO | MANUTENCAO | INATIVA | SEM_EQUIPE
// Ocorrencia.java   → status: ABERTA | DESPACHADA | EM_ATENDIMENTO | CONCLUIDA | CANCELADA
// Profissional.java → campos: id, nome, funcao, contato, ativo, turno  (SEM campo cref)
// Turno.java (enum) → MATUTINO | VESPERTINO | NOTURNO
// JwtResponse.java  → retorna {token, username, role} — NOT nested user object
// DashboardDTO.java → campos: ocorrenciasAbertas, atendimentosHoje, ambulanciasDisponiveis,
//                             ambulanciasTotal, equipesAtivas, profissionaisCadastrados
// Atendimento.java  → campos: id, ocorrencia, ambulancia, dataHoraDespacho, dataHoraChegada,
//                             distanciaKm, tempoEstimado, rota, foraDoSla, slaPrevisto, slaReal
//
// IMPORTANTE — LocalDateTime:
//   O Spring Boot serializa LocalDateTime como array por padrão: [2025, 6, 3, 14, 30, 0]
//   A função formatarData() em date.helper.ts trata ambos os formatos.
//   Peça para a colega adicionar no application.properties:
//     spring.jackson.serialization.write-dates-as-timestamps=false
//   Isso fará o backend enviar strings ISO "2025-06-03T14:30:00" (mais simples).
// ============================================================

export interface Bairro {
  id: number;
  nome: string;
}

// Ambulancia.java
export interface Ambulancia {
  id?: number;
  placa: string;
  tipo: 'USA' | 'USB';
  status: 'DISPONIVEL' | 'EM_ATENDIMENTO' | 'MANUTENCAO' | 'INATIVA' | 'SEM_EQUIPE';
  bairro?: Bairro | null;
}

// Profissional.java — SEM campo cref, esse campo não existe na entidade Java
// tipoDocumento e documento são armazenados pelo mock mas ignorados pelo backend real
export interface Profissional {
  id?: number;
  nome: string;
  funcao: 'MEDICO' | 'ENFERMEIRO' | 'MOTORISTA';
  contato?: string | null;
  ativo: boolean;
  turno?: 'MATUTINO' | 'VESPERTINO' | 'NOTURNO' | null;
  tipoDocumento?: string | null;
  documento?: string | null;
}

// Equipe.java
export interface Equipe {
  id?: number;
  descricao: string;
  ambulancia?: Ambulancia | null;
  profissionais: Profissional[];
  turno: 'MATUTINO' | 'VESPERTINO' | 'NOTURNO';
}

// Ocorrencia.java — ciclo de vida: ABERTA→DESPACHADA→EM_ATENDIMENTO→CONCLUIDA
export interface Ocorrencia {
  id?: number;
  tipo: string;
  gravidade: 'ALTA' | 'MEDIA' | 'BAIXA';
  bairro?: Bairro | null;
  status: 'ABERTA' | 'DESPACHADA' | 'EM_ATENDIMENTO' | 'CONCLUIDA' | 'CANCELADA';
  dataHoraAbertura: string | number[];   // array ou ISO string, tratado pelo date.helper
  dataHoraFechamento?: string | number[] | null;
  observacao: string;
}

// OcorrenciaHistorico.java
export interface OcorrenciaHistorico {
  id: number;
  statusAnterior: string | null;
  statusNovo: string;
  dataHora: string | number[];
  observacao: string;
}

// Atendimento.java — campos completos incluindo SLA e rota do Dijkstra
export interface Atendimento {
  id: number;
  ocorrencia?: Ocorrencia;
  ambulancia?: Ambulancia;
  dataHoraDespacho?: string | number[] | null;
  dataHoraChegada?: string | number[] | null;
  distanciaKm?: number | null;
  tempoEstimado?: number | null;
  rota?: string | null;          // rota calculada pelo DijkstraService como string
  foraDoSla?: boolean | null;
  slaPrevisto?: number | null;
  slaReal?: number | null;
}

// OcorrenciaDetalhesDTO.java
export interface OcorrenciaDetalhes {
  ocorrencia: Ocorrencia;
  atendimento?: Atendimento | null;
  equipe?: Equipe | null;
  historico: OcorrenciaHistorico[];
}

// DashboardDTO.java — todos os campos com getters existentes
export interface DashboardStats {
  ocorrenciasAbertas: number;
  atendimentosHoje: number;
  ambulanciasDisponiveis: number;
  ambulanciasTotal: number;
  equipesAtivas: number;
  profissionaisCadastrados: number;
}

// RelatorioService.java — retorna List<Object[]> onde [0]=nome, [1]=count/avg
export interface AtendimentoPorBairro {
  bairro: string;
  quantidade: number;
}

export interface DistanciaMediaPorTipo {
  tipoAmbulancia: string;
  distanciaMediaKm: number;   // nome correto — é distância média, não tempo médio
}

// JwtResponse.java — retorna {token, username, role} DIRETO na raiz
export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

export interface Usuario {
  username: string;
  role?: string;
}