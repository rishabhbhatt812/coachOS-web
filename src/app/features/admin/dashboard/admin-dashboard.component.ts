import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent, BadgeColor } from '../../../shared/components/status-badge/status-badge.component';
import { DashboardFacade } from '../../../core/facades/dashboard.facade';

import { AuthFacade } from '../../../core/facades/auth.facade';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private dashboardFacade = inject(DashboardFacade);
  private authFacade = inject(AuthFacade);
  private router = inject(Router);
  
  metrics$ = this.dashboardFacade.metrics$;
  globalMetrics$ = this.dashboardFacade.globalMetrics$;
  isLoading$ = this.dashboardFacade.isLoading$;

  isGlobalView = false;

  ngOnInit() {
    this.authFacade.currentUser$.subscribe(user => {
      if (user) {
        const rawRole = user.rawRole || '';
        const isGlobalAdmin = rawRole === 'GLOBAL_ADMIN' || rawRole === 'SUPER_ADMIN';
        const activeInst = localStorage.getItem('active_institute_id') || 'system_global';
        this.isGlobalView = isGlobalAdmin && activeInst === 'system_global';
        
        if (this.isGlobalView) {
          this.dashboardFacade.loadGlobalMetrics();
        } else {
          this.dashboardFacade.loadAdminMetrics();
        }
      }
    });
  }

  getMaxValue(list: any[] | undefined, key: string): number {
    if (!list || list.length === 0) return 1;
    const max = Math.max(...list.map(item => Number(item[key] || 0)));
    return max > 0 ? max : 1;
  }

  getPercent(value: number, max: number): number {
    if (max === 0) return 0;
    return Math.round((value / max) * 100);
  }

  getPlanTotalCount(plans: any[] | undefined): number {
    if (!plans) return 0;
    return plans.reduce((acc, curr) => acc + (curr.count || 0), 0);
  }

  getStatusBadgeColor(status: string): BadgeColor {
    const s = status ? status.toLowerCase() : '';
    if (s.includes('new') || s.includes('enquiry')) return 'blue';
    if (s.includes('active') || s.includes('converted') || s.includes('join')) return 'green';
    if (s.includes('pending') || s.includes('follow')) return 'orange';
    if (s.includes('lost') || s.includes('close') || s.includes('cancel')) return 'red';
    return 'purple';
  }

  navigateToCRM() {
    this.router.navigate(['/admin/crm']);
  }
}
