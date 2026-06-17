import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div>
        <h1>{{ title }}</h1>
        <p class="muted" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="actions">
        <ng-content></ng-content>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: var(--topbar-height);
      background: white;
      border-bottom: 1px solid var(--border-light);
      padding: 0 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    h1 {
      font-size: 24px;
      margin: 0;
      font-weight: 700;
    }
    .muted {
      color: var(--text-muted);
      font-size: 14px;
      margin-top: 4px;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    @media (max-width: 900px) {
      .topbar {
        padding: 0 16px;
      }
      h1 {
        font-size: 20px;
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
}
