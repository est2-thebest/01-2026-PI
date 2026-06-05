import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Output() toggled = new EventEmitter<boolean>();
  isOpen = true;

  constructor(public authService: AuthService, public themeService: ThemeService) {}

  alternar(): void { this.isOpen = !this.isOpen; this.toggled.emit(this.isOpen); }

  logout(): void {
    if (confirm('Tem certeza que deseja sair?')) this.authService.logout();
  }

  get temaAtual(): string { return this.themeService.temaAtual; }
  alternarTema(): void { this.themeService.alternarTema(); }
}