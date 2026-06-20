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
  tenant$ = this.authFacade.currentTenant$;
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
    if (!this.isGlobalAdmin) {
      return this.hasModuleAccess(moduleName);
    }
    return this.selectedInstituteId !== 'system_global' && this.hasModuleAccess(moduleName);
  }

  get menuItems() {
    const user = this.authFacade.currentUserValue;
    if (!user) return [];

    const items: Array<{ label: string; route: string; icon: string }> = [];

    if (user.role === 'ADMIN') {
      items.push({ label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' });

      if (this.showInstituteSection()) {
        items.push({ label: 'Students', route: '/admin/students', icon: 'students' });
        items.push({ label: 'Teachers', route: '/admin/teachers', icon: 'teachers' });
      }

      if (this.showInstituteSection() && this.hasModuleAccess('STAFF')) {
        items.push({ label: 'Staff Management', route: '/admin/staff', icon: 'staff' });
      }

      if (this.showModule('LEARNING')) {
        items.push({ label: 'Courses', route: '/admin/courses', icon: 'courses' });
        items.push({ label: 'Batches', route: '/admin/batches', icon: 'batches' });
      }

      if (this.showInstituteSection() && this.hasModuleAccess('BRANCHES')) {
        items.push({ label: 'Branches', route: '/admin/branches', icon: 'branches' });
      }

      if (this.showModule('FEES')) {
        items.push({ label: 'Fee Management', route: '/admin/fees', icon: 'fees' });
      }

      if (this.showModule('CRM')) {
        items.push({ label: 'CRM / Leads', route: '/admin/crm', icon: 'crm' });
      }

      if (this.showModule('ATTENDANCE')) {
        items.push({ label: 'Attendance', route: '/admin/attendance', icon: 'attendance' });
      }

      if (this.showModule('COMMUNICATION')) {
        items.push({ label: 'Notices', route: '/admin/notices', icon: 'notices' });
      }

      if (this.isGlobalAdmin) {
        items.push({ label: 'Coaching Centers', route: '/admin/institutes', icon: 'institutes' });
        items.push({ label: 'Module Access', route: '/super-admin/organization-modules', icon: 'module-access' });
      }
    } else if (user.role === 'RECEPTIONIST') {
      items.push({ label: 'Dashboard', route: '/receptionist/dashboard', icon: 'dashboard' });

      if (this.hasModuleAccess('CRM')) {
        items.push({ label: 'CRM / Leads', route: '/receptionist/crm', icon: 'crm' });
      }

      if (this.hasModuleAccess('COMMUNICATION')) {
        items.push({ label: 'Notices', route: '/receptionist/notices', icon: 'notices' });
      }
    }

    return items;
  }

  logout(): void {
    this.authFacade.logout();
  }
}
