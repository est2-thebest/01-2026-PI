// ============================================================
// auth.service.ts
// Verificado contra JwtResponse.java:
//   public class JwtResponse {
//     private String token;
//     private String username;
//     private String role;
//   }
// O backend retorna {token, username, role} na RAIZ do JSON.
// NÃO há um objeto "user" aninhado.
// ============================================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginResponse, Usuario } from '../../shared/models';

const TOKEN_KEY = 'sosrota_token';
const USER_KEY  = 'sosrota_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.carregarUsuarioSalvo());
  usuario$: Observable<Usuario | null> = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get estaLogado(): boolean { return !!this.obterToken(); }
  get usuarioAtual(): Usuario | null { return this.usuarioSubject.value; }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`,
      { username, password }
    ).pipe(
      tap(resp => {
        localStorage.setItem(TOKEN_KEY, resp.token);
        // ✅ Lê username e role DIRETO da raiz — conforme JwtResponse.java
        const usuario: Usuario = { username: resp.username, role: resp.role };
        localStorage.setItem(USER_KEY, JSON.stringify(usuario));
        this.usuarioSubject.next(usuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.usuarioSubject.next(null);
    this.router.navigate(['/login']);
  }

  obterToken(): string | null { return localStorage.getItem(TOKEN_KEY); }

  private carregarUsuarioSalvo(): Usuario | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}