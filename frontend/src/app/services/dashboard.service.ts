// src/app/services/dashboard.service.ts
// DashboardController.java — GET /api/dashboard/stats
// Retorna DashboardDTO com: ocorrenciasAbertas, atendimentosHoje,
// ambulanciasDisponiveis, ambulanciasTotal, equipesAtivas, profissionaisCadastrados
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardStats } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats`);
  }
}