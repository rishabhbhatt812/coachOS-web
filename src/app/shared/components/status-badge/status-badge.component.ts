import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeColor = 'green' | 'red' | 'orange' | 'blue' | 'purple' | 'gray';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge {{ color }}"><ng-content></ng-content></span>`,
  styles: [`
    .badge {
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      display: inline-block;
      line-height: 1;
    }
    .badge.green { background: var(--success-bg); color: var(--success-text); }
    .badge.red { background: var(--danger-bg); color: var(--danger-text); }
    .badge.orange { background: var(--warning-bg); color: var(--warning-text); }
    .badge.blue { background: var(--info-bg); color: var(--info-text); }
    .badge.purple { background: var(--purple-bg); color: var(--purple-text); }
    .badge.gray { background: #e5e7eb; color: #374151; }
  `]
})
export class StatusBadgeComponent {
  @Input() color: BadgeColor = 'gray';
}
