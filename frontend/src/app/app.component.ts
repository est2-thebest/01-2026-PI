import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ConfirmModalComponent } from './shared/components/modals/confirm.component';

// Componente raiz — só exibe o router-outlet
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent { }

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, ConfirmModalComponent],
  template: `
    <div class="app-container"
      [class.sidebar-open]="sidebarOpen"
      [class.sidebar-closed]="!sidebarOpen">
      <app-sidebar (toggled)="sidebarOpen = $event" />
      <main class="main-content">
        <router-outlet />
      </main>
      <app-confirm-modal></app-confirm-modal>
    </div>
  `
})
export class MainLayoutComponent {
  sidebarOpen = true;
}