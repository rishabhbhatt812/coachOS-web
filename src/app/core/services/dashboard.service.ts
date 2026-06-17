import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export interface DashboardMetrics {
  totalStudents: number;
  activeBatches: number;
  pendingFees: number;
  todayAttendancePercent: number;
  recentEnquiries: any[];
  upcomingClasses: any[];
  monthlyRegistrations?: any[];
  monthlyCollections?: any[];
}

export interface GlobalMetrics {
  totalInstitutes: number;
  activeInstitutes: number;
  totalStudents: number;
  totalTeachers: number;
  totalRevenue: number;
  planDistribution: any[];
  recentInstitutes: any[];
  monthlyGrowth: any[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getAdminMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(API_ENDPOINTS.ADMIN.DASHBOARD_METRICS);
  }

  getGlobalMetrics(): Observable<GlobalMetrics> {
    return this.http.get<GlobalMetrics>(API_ENDPOINTS.ADMIN.GLOBAL_DASHBOARD_METRICS);
  }
}
