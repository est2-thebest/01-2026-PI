import { Injectable, signal } from '@angular/core';

export type DialogTipo = 'perigo' | 'aviso' | 'sucesso' | 'info';
export type DialogModo = 'confirm' | 'input';

export interface DialogConfig {
  titulo: string;
  mensagem: string;
  tipo?: DialogTipo;
  modo?: DialogModo;
  labelInput?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface DialogState {
  isOpen: boolean;
  config: DialogConfig;
  modo: DialogModo;
}

@Injectable({ providedIn: 'root' })
export class ConfirmModalService {
  private resolveFn: ((val: any) => void) | null = null;
  
  state = signal<DialogState>({
    isOpen: false,
    config: { titulo: '', mensagem: '' },
    modo: 'confirm'
  });

  abrir(config: DialogConfig): Promise<any> {
    this.state.set({
      isOpen: true,
      config,
      modo: config.modo || 'confirm'
    });
    
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  responder(valor: any) {
    if (this.resolveFn) {
      this.resolveFn(valor);
      this.resolveFn = null;
    }
    this.state.update(s => ({ ...s, isOpen: false }));
  }
}
