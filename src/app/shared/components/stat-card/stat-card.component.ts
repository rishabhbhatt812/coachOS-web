import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card stat-card">
      <h3 class="title">{{ title }}</h3>
      <div class="value">{{ value }}</div>
      <p class="hint" *ngIf="hint">{{ hint }}</p>
      
      <div class="progress" *ngIf="progress !== undefined">
        <span [style.width.%]="progress"></span>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: var(--border-radius-lg);
      padding: 20px;
      box-shadow: var(--box-shadow);
      height: 100%;
    }
    .title {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 10px;
      font-weight: 600;
    }
    .value {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-main);
    }
    .hint {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 8px;
    }
    .progress {
      height: 10px;
      background: #e5e7eb;
      border-radius: 999px;
      overflow: hidden;
      margin-top: 10px;
    }
    .progress span {
      display: block;
      height: 100%;
      background: var(--primary);
      border-radius: 999px;
    }
  `]
})
export class StatCardComponent {
  @Input() title!: string;
  @Input() value!: string | number;
  @Input() hint?: string;
  @Input() progress?: number;
}
