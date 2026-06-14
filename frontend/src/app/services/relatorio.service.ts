import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ocorrencia } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  constructor(private http: HttpClient) {}

  listarOcorrencias(): Observable<Ocorrencia[]> {
    return this.http.get<Ocorrencia[]>(`${environment.apiUrl}/api/ocorrencias`);
  }

  exportarPdf(): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/relatorios/exportar/pdf`, { responseType: 'blob' });
  }
}