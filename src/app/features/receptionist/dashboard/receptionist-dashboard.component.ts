import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-receptionist-dashboard',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, RouterModule],
  templateUrl: './receptionist-dashboard.component.html',
  styleUrl: './receptionist-dashboard.component.scss'
})
export class ReceptionistDashboardComponent implements OnInit {
  private http = inject(HttpClient);

  isLoading = false;
  
  // Dashboard Metrics
  totalLeads = 0;
  hotLeads = 0;
  warmLeads = 0;
  coldLeads = 0;
  convertedLeads = 0;
  
  recentEnquiries: any[] = [];
  todayFollowups: any[] = [];

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.http.get<any>(API_ENDPOINTS.ADMIN.CRM_ENQUIRIES).subscribe({
      next: (res) => {
        // Enquiries are unwrapped by interceptor
        const data = res || [];
        this.recentEnquiries = data.slice(0, 5); // Take last 5 for recent list
        
        // Calculate counts
        this.totalLeads = data.length;
        this.hotLeads = data.filter((x: any) => x.status === 'Hot').length;
        this.warmLeads = data.filter((x: any) => x.status === 'Warm').length;
        this.coldLeads = data.filter((x: any) => x.status === 'Cold').length;
        this.convertedLeads = data.filter((x: any) => x.status === 'Converted').length;

        // Mock today's followups list from enquiries that are warm/hot
        this.todayFollowups = data.filter((x: any) => x.status === 'Warm' || x.status === 'Hot').slice(0, 3);
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load inquiries:', err);
        this.isLoading = false;
      }
    });
  }

  getProgressBarWidth(count: number): string {
    if (this.totalLeads === 0) return '0%';
    return `${Math.round((count / this.totalLeads) * 100)}%`;
  }

  getProgressBarPercentage(count: number): number {
    if (this.totalLeads === 0) return 0;
    return Math.round((count / this.totalLeads) * 100);
  }
}
