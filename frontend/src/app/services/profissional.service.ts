// src/app/services/profissional.service.ts
// Verificado contra ProfissionalController.java
// PUT /{id} chama profissionalService.update(id, profissional) — método diferente do salvar
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Profissional } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class ProfissionalService {
  private url = `${environment.apiUrl}/profissionais`;
  constructor(private http: HttpClient) {}
  listar(): Observable<Profissional[]> { return this.http.get<Profissional[]>(this.url); }
  criar(p: Profissional): Observable<Profissional> { return this.http.post<Profissional>(this.url, p); }
  atualizar(id: number, p: Profissional): Observable<Profissional> { return this.http.put<Profissional>(`${this.url}/${id}`, p); }
  excluir(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}