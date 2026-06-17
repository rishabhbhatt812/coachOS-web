import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthFacade } from '../../core/facades/auth.facade';
import { environment } from '../../core/constants/api-endpoints';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  private authFacade = inject(AuthFacade);
  private http = inject(HttpClient);
  
  user$ = this.authFacade.currentUser$;
  sidebarOpen = false;
  
  // Tenant switcher state
  isGlobalAdmin = false;
  institutes: any[] = [];
  selectedInstituteId = '';

  ngOnInit() {
    this.user$.subscribe(user => {
      if (user) {
        const rawRole = user.rawRole || '';
        this.isGlobalAdmin = rawRole === 'GLOBAL_ADMIN' || rawRole === 'SUPER_ADMIN';
        if (this.isGlobalAdmin) {
          this.selectedInstituteId = localStorage.getItem('active_institute_id') || 'system_global';
          if (!localStorage.getItem('active_institute_id')) {
            localStorage.setItem('active_institute_id', 'system_global');
          }
          this.loadInstitutes();
        }
      }
    });
  }

  loadInstitutes() {
    this.http.get<any>(`${environment.apiUrl}/api/admin/GlobalAdmin/institutes`).subscribe({
      next: (res) => {
        // Response is unwrapped as a plain array by response.interceptor
        this.institutes = res || [];
      },
      error: (err) => {
        console.error('Failed to load system institutes:', err);
      }
    });
  }

  onInstituteChange(event: Event) {
    const selectEl = event.target as HTMLSelectElement;
    const newId = selectEl.value;
    if (newId) {
      localStorage.setItem('active_institute_id', newId);
      // Reload current window context to refresh dashboards/data
      window.location.reload();
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarOnMobile() {
    if (window.innerWidth <= 1024) {
      this.sidebarOpen = false;
    }
  }

  hasModuleAccess(moduleName: string): boolean {
    return this.authFacade.hasModuleAccess(moduleName);
  }

  showInstituteSection(): boolean {
    return !this.isGlobalAdmin || this.selectedInstituteId !== 'system_global';
  }

  showModule(moduleName: string): boolean {
    if (moduleName.toUpperCase() === 'ATTENDANCE') {
      return false;
    }
    if (!this.isGlobalAdmin) {
      return this.hasModuleAccess(moduleName);
    }
    return this.selectedInstituteId !== 'system_global' && this.hasModuleAccess(moduleName);
  }

  logout(): void {
    this.authFacade.logout();
  }
}
