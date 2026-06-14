// src/app/services/bairro.service.ts
// BairroController.java — apenas GET (bairros vêm do CSV, sem criação via API)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Bairro } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class BairroService {
  private url = `${environment.apiUrl}/bairros`;
  constructor(private http: HttpClient) {}
  listar(): Observable<Bairro[]> { return this.http.get<Bairro[]>(this.url); }
}