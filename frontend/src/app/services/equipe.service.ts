import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EquipeService {
  private url = `${environment.apiUrl}/equipes`;
  constructor(private http: HttpClient) {}
  listar(): Observable<any[]>                    { return this.http.get<any[]>(this.url); }
  criar(e: any): Observable<any>                 { return this.http.post<any>(this.url, e); }
  atualizar(id: number, e: any): Observable<any> { return this.http.put<any>(`${this.url}/${id}`, e); }
  excluir(id: number): Observable<void>          { return this.http.delete<void>(`${this.url}/${id}`); }
  inativar(id: number): Observable<any>          { return this.http.patch<any>(`${this.url}/${id}/inativar`, {}); }
  reativar(id: number): Observable<any>          { return this.http.patch<any>(`${this.url}/${id}/reativar`, {}); }
}