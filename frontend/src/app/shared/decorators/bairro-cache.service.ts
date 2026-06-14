// ============================================================
// PADRÃO DE PROJETO 3: DECORATOR
// Arquivo: shared/decorators/bairro-cache.service.ts
// ============================================================
//
// DEFINIÇÃO:
//   O Decorator adiciona responsabilidades a um objeto dinamicamente,
//   sem modificar sua classe original. É uma alternativa flexível à
//   herança: em vez de estender, ele envolve ("wraps") o componente.
//
// PROBLEMA REAL DESTE PROJETO:
//   BairroService.listar() faz uma requisição HTTP toda vez que é
//   chamado. Bairros são dados estáticos carregados de CSV no backend,
//   então essa chamada se repete desnecessariamente a cada abertura
//   de modal de ambulância ou de ocorrência.
//
// SOLUÇÃO — BairroServiceComCache:
//   Envolve o BairroService original e adiciona cache em memória
//   com TTL de 5 minutos. Os componentes que o injetam usam a
//   mesma interface (listar()) — o cache é completamente transparente.
//
// RELAÇÃO DE COMPOSIÇÃO (não herança):
//
//   BairroServiceComCache             ← Decorator (esta classe)
//     ├── injeta → BairroService      ← Componente original (não alterado)
//     ├── + cache: Bairro[]           ← responsabilidade adicionada
//     ├── + ultimaAtualizacao: number ← responsabilidade adicionada
//     └── listar()                    ← mesma interface; comportamento estendido
//
// ANALOGIA COM O BACKEND:
//   O backend usa Template Method em DespachoBase para definir um
//   fluxo fixo com passo variável (validarSla). Aqui, o Decorator
//   define um fluxo fixo com passo variável: tenta o cache; se não
//   houver, delega ao componente original.
//
// FLUXO DO listar():
//   1ª chamada  → cache vazio/expirado → delega a BairroService → salva cache
//   2ª–Nth      → cache válido (< 5 min) → retorna of(cache) sem HTTP
//   Após 5 min  → cache expirado → delega a BairroService → atualiza cache
//
// TROCA NOS COMPONENTES:
//   Substitua BairroService por BairroServiceComCache no construtor.
//   Nenhuma outra linha do componente precisa mudar.
// ============================================================

import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { BairroService } from '../../services/bairro.service';
import { Bairro } from '../models';

// TTL do cache: 5 minutos em milissegundos
const CACHE_TTL_MS = 5 * 60 * 1000;

// providedIn: 'root' → também é Singleton (Padrão 1 aplicado ao Decorator)
@Injectable({ providedIn: 'root' })
export class BairroServiceComCache {

  // ── Estado interno do cache (opaco para os componentes que usam este serviço)
  private cache: Bairro[] | null = null;
  private ultimaAtualizacao      = 0;

  // Injeta o componente original — o Decorator ENVOLVE, não herda
  constructor(private bairroService: BairroService) {}

  // ── Interface idêntica ao BairroService.listar() ──────────────────────────
  // Componentes trocam BairroService por BairroServiceComCache sem mudar mais nada
  listar(): Observable<Bairro[]> {
    const agora      = Date.now();
    const cacheValido = this.cache !== null
      && (agora - this.ultimaAtualizacao) < CACHE_TTL_MS;

    if (cacheValido) {
      // Comportamento adicionado pelo Decorator: retorna dados em memória sem HTTP
      return of(this.cache!);
    }

    // Cache ausente ou expirado: delega ao serviço original e armazena o resultado
    return this.bairroService.listar().pipe(
      tap(bairros => {
        this.cache             = bairros;
        this.ultimaAtualizacao = agora;
      })
    );
  }

  // ── Responsabilidade extra adicionada pelo Decorator ─────────────────────
  // Permite forçar recarga quando necessário (não existe no BairroService original)
  invalidarCache(): void {
    this.cache             = null;
    this.ultimaAtualizacao = 0;
  }
}
