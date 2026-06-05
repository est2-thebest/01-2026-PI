import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

type Tema = 'light' | 'dark';
const TEMA_KEY = 'sosrota_tema';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private temaSubject = new BehaviorSubject<Tema>(
    (localStorage.getItem(TEMA_KEY) as Tema) || 'light'
  );
  tema$: Observable<Tema> = this.temaSubject.asObservable();

  constructor() { this.aplicarTema(this.temaSubject.value); }

  get temaAtual(): Tema { return this.temaSubject.value; }

  alternarTema(): void {
    const novo: Tema = this.temaAtual === 'light' ? 'dark' : 'light';
    this.aplicarTema(novo);
    this.temaSubject.next(novo);
    localStorage.setItem(TEMA_KEY, novo);
  }

  private aplicarTema(tema: Tema): void {
    document.body.setAttribute('data-theme', tema);
  }
}