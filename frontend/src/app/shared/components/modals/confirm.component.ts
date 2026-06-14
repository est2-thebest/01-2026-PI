import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmModalService, DialogTipo } from './confirm.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (state.isOpen) {
      <div class="dialog-overlay" (click)="fecharPorOverlay($event)">
        <div class="dialog-box" [ngClass]="'dialog-' + (state.config.tipo || 'info')">
          
          <div class="dialog-header">
            <div class="dialog-icon-wrap">
              <i class="pi" [ngClass]="icone"></i>
            </div>
            <h3 class="dialog-titulo">{{ state.config.titulo }}</h3>
          </div>

          <div class="dialog-mensagem">
            {{ state.config.mensagem }}
          </div>

          @if (state.modo === 'input') {
            <div class="dialog-input-wrap">
              <label class="dialog-input-label">{{ state.config.labelInput || 'Motivo' }}</label>
              <input type="text" class="dialog-input" [(ngModel)]="valorInput" (keyup.enter)="confirmar()" autoFocus>
            </div>
          }

          <div class="dialog-footer">
            <button class="dialog-btn dialog-btn-cancelar" (click)="cancelar()">
              {{ state.config.cancelText || 'Cancelar' }}
            </button>
            <button class="dialog-btn" [ngClass]="'dialog-btn-' + (state.config.tipo || 'info')" (click)="confirmar()">
              {{ state.config.confirmText || 'Confirmar' }}
            </button>
          </div>

        </div>
      </div>
    }
  `,
  styleUrl: './confirm.component.scss'
})
export class ConfirmModalComponent {

  valorInput = '';

  constructor(public dialogService: ConfirmModalService) {}

  get state() {
    return this.dialogService.state();
  }

  get icone(): string {
    const icons: Record<DialogTipo, string> = {
      perigo:  'pi-exclamation-triangle',
      aviso:   'pi-exclamation-circle',
      sucesso: 'pi-check-circle',
      info:    'pi-info-circle'
    };
    return icons[this.state.config.tipo ?? 'info'];
  }

  confirmar(): void {
    if (this.state.modo === 'input') {
      this.dialogService.responder(this.valorInput);
    } else {
      this.dialogService.responder(true);
    }
    this.valorInput = '';
  }

  cancelar(): void {
    this.dialogService.responder(this.state.modo === 'input' ? null : false);
    this.valorInput = '';
  }

  // Fecha ao clicar no overlay (fora do box)
  fecharPorOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.cancelar();
    }
  }
}
