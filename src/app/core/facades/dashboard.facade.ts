import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { DashboardService, DashboardMetrics, GlobalMetrics } from '../services/dashboard.service';

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private dashboardService = inject(DashboardService);

  private metricsSubject = new BehaviorSubject<DashboardMetrics | null>(null);
  public metrics$ = this.metricsSubject.asObservable();

  private globalMetricsSubject = new BehaviorSubject<GlobalMetrics | null>(null);
  public globalMetrics$ = this.globalMetricsSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  loadAdminMetrics(): void {
    this.isLoadingSubject.next(true);
    this.dashboardService.getAdminMetrics().pipe(
      tap(metrics => this.metricsSubject.next(metrics)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  loadGlobalMetrics(): void {
    this.isLoadingSubject.next(true);
    this.dashboardService.getGlobalMetrics().pipe(
      tap(metrics => this.globalMetricsSubject.next(metrics)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }
}
