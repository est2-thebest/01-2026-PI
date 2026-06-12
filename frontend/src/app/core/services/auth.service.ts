// ============================================================
// PADRÃO DE PROJETO 1: SINGLETON
// Arquivo: core/services/auth.service.ts
// ============================================================
//
// DEFINIÇÃO:
//   O Singleton garante que uma classe tenha APENAS UMA instância
//   durante todo o ciclo de vida da aplicação e fornece um ponto
//   global de acesso a ela.
//
// IMPLEMENTAÇÃO NO ANGULAR:
//   A anotação `providedIn: 'root'` instrui o injetor de dependências
//   do Angular a criar UMA ÚNICA instância do AuthService e reutilizá-la
//   em TODOS os componentes que a injetam. Isso é o Singleton do Angular.
//
//   Prova: `_instanciasCreadas` é incrementado no construtor e sempre
//   ficará em 1, não importa quantos componentes injetem este serviço.
//
// POR QUE AuthService É O CANDIDATO IDEAL:
//   - Mantém o estado da sessão do usuário (usuarioSubject / BehaviorSubject)
//   - Armazena e lê o token JWT do localStorage
//   - Se existissem múltiplas instâncias, componentes diferentes veriam
//     estados de autenticação inconsistentes (ex: um diz "logado", outro "não")
//
// ANALOGIA COM O BACKEND:
//   No Spring Boot, todo bean com @Service é singleton por padrão
//   (escopo "singleton" do ApplicationContext). Aqui fazemos o
//   equivalente no Angular com providedIn: 'root'.
// ============================================================

// auth.service.ts — verificado contra JwtResponse.java
// O backend retorna {token, username, role} na RAIZ do JSON.
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginResponse, Usuario } from '../../shared/models';

const TOKEN_KEY = 'sosrota_token';
const USER_KEY  = 'sosrota_user';

// providedIn: 'root' → Angular cria UMA instância e a reutiliza globalmente (Singleton)
@Injectable({ providedIn: 'root' })
export class AuthService {

  // Contador estático: demonstra que o construtor é chamado apenas 1 vez
  // independente de quantos componentes injetem este serviço
  private static _instanciasCriadas = 0;

  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.carregarUsuarioSalvo());
  usuario$: Observable<Usuario | null> = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Singleton: este bloco executa 1 única vez em toda a aplicação
    AuthService._instanciasCriadas++;
  }

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