// src/app/shared/components/banner/banner.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-banner">
      <h1>{{ title }}</h1>
      <p *ngIf="subtitle">{{ subtitle }}</p>
    </div>
  `,
  styles: [`
    .page-banner { margin-bottom: 1.75rem; padding-bottom: .875rem; border-bottom: 2px solid var(--primary); }
    .page-banner h1 { margin: 0 0 .25rem; font-size: 1.65rem; }
    .page-banner p  { margin: 0; color: var(--text-secondary); }
  `]
})
export class BannerComponent {
  @Input() title = '';
  @Input() subtitle = '';
}