// src/app/services/ambulancia.service.ts
// Verificado contra AmbulanciaController.java
// Endpoints: GET /api/ambulancias, GET /{id}, POST, PUT /{id}, DELETE /{id}
// NÃO há endpoint /disponiveis — filtro feito localmente
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ambulancia } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class AmbulanciaService {
  private url = `${environment.apiUrl}/ambulancias`;
  constructor(private http: HttpClient) {}

  listar(): Observable<Ambulancia[]> { return this.http.get<Ambulancia[]>(this.url); }
  buscarPorId(id: number): Observable<Ambulancia> { return this.http.get<Ambulancia>(`${this.url}/${id}`); }
  criar(a: Ambulancia): Observable<Ambulancia> { return this.http.post<Ambulancia>(this.url, a); }
  atualizar(id: number, a: Ambulancia): Observable<Ambulancia> { return this.http.put<Ambulancia>(`${this.url}/${id}`, a); }
  excluir(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }

  // Endpoint /disponiveis não existe no backend — filtra localmente por status DISPONIVEL
  // Quando a colega criar GET /api/ambulancias/disponiveis, substitua pelo endpoint real
  listarDisponiveis(): Observable<Ambulancia[]> {
    return this.listar().pipe(map(lista => lista.filter(a => a.status === 'DISPONIVEL')));
  }
}