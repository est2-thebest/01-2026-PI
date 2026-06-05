// src/app/services/equipe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Equipe } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class EquipeService {
  private url = `${environment.apiUrl}/equipes`;
  constructor(private http: HttpClient) {}
  listar(): Observable<Equipe[]> { return this.http.get<Equipe[]>(this.url); }
  criar(e: Equipe): Observable<Equipe> { return this.http.post<Equipe>(this.url, e); }
  atualizar(id: number, e: Equipe): Observable<Equipe> { return this.http.put<Equipe>(`${this.url}/${id}`, e); }
  excluir(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}