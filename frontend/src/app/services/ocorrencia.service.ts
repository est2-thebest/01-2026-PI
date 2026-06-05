// src/app/services/ocorrencia.service.ts
// Verificado contra OcorrenciaController.java
// Endpoints disponíveis:
//   GET    /api/ocorrencias
//   GET    /api/ocorrencias/{id}
//   POST   /api/ocorrencias
//   PUT    /api/ocorrencias/{id}
//   DELETE /api/ocorrencias/{id}
//   POST   /api/ocorrencias/{id}/confirmar-saida
//   POST   /api/ocorrencias/{id}/concluir
//   POST   /api/ocorrencias/{id}/cancelar       (body: { justificativa?: string })
//   GET    /api/ocorrencias/{id}/detalhes
//   GET    /api/ocorrencias/{id}/historico
//
// NÃO existe ?status=ABERTA — filtro feito localmente
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ocorrencia, OcorrenciaDetalhes, OcorrenciaHistorico } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class OcorrenciaService {
  private url = `${environment.apiUrl}/ocorrencias`;
  constructor(private http: HttpClient) {}

  listarTodas(): Observable<Ocorrencia[]> { return this.http.get<Ocorrencia[]>(this.url); }

  // Filtra localmente — não há query param ?status no backend
  listarAbertas(): Observable<Ocorrencia[]> {
    return this.listarTodas().pipe(map(l => l.filter(o => o.status === 'ABERTA')));
  }

  buscarPorId(id: number): Observable<Ocorrencia> { return this.http.get<Ocorrencia>(`${this.url}/${id}`); }
  criar(o: Ocorrencia): Observable<Ocorrencia> { return this.http.post<Ocorrencia>(this.url, o); }
  atualizar(id: number, o: Ocorrencia): Observable<Ocorrencia> { return this.http.put<Ocorrencia>(`${this.url}/${id}`, o); }
  excluir(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }

  // Muda status para EM_ANDAMENTO e registra atendimento com Dijkstra
  confirmarSaida(id: number): Observable<void> { return this.http.post<void>(`${this.url}/${id}/confirmar-saida`, {}); }
  concluirAtendimento(id: number): Observable<void> { return this.http.post<void>(`${this.url}/${id}/concluir`, {}); }
  cancelar(id: number, justificativa?: string): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/cancelar`, { justificativa: justificativa || '' });
  }

  buscarDetalhes(id: number): Observable<OcorrenciaDetalhes> { return this.http.get<OcorrenciaDetalhes>(`${this.url}/${id}/detalhes`); }
  buscarHistorico(id: number): Observable<OcorrenciaHistorico[]> { return this.http.get<OcorrenciaHistorico[]>(`${this.url}/${id}/historico`); }
}