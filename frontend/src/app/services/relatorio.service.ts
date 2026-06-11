import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ocorrencia, AtendimentoPorBairro } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private url = `${environment.apiUrl}/relatorios`;
  constructor(private http: HttpClient) {}

  listarOcorrencias(): Observable<Ocorrencia[]> {
    return this.http.get<Ocorrencia[]>(`${this.url}/ocorrencias`);
  }

  listarPorBairro(): Observable<AtendimentoPorBairro[]> {
    return this.http.get<AtendimentoPorBairro[]>(`${this.url}/por-bairro`);
  }
}
