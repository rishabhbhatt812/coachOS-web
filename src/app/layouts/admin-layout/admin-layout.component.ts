import { Component, OnInit, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthFacade } from '../../core/facades/auth.facade';
import { SupportService } from '../../core/services/support.service';
import { environment } from '../../core/constants/api-endpoints';

interface SearchItem {
  title: string;
  description: string;
  route: string;
  icon: string;
  category: string;
  module?: string;
  globalOnly?: boolean;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  private authFacade = inject(AuthFacade);
  private supportService = inject(SupportService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  
  user$ = this.authFacade.currentUser$;
  currentTenant$ = this.authFacade.currentTenant$;
  unreadSupportCount$ = this.supportService.unreadCount$;
  sidebarOpen = false;
  
  // Tenant switcher state
  isGlobalAdmin = false;
  institutes: any[] = [];
  selectedInstituteId = '';

  // Quick Search state
  searchQuery = '';
  isSearchOpen = false;

  allSearchItems: SearchItem[] = [
    { title: 'Dashboard', description: 'Overview metrics, analytics and quick stats', route: '/admin/dashboard', icon: '📊', category: 'General' },
    { title: 'Students List', description: 'View, search, filter and manage enrolled students', route: '/admin/students', icon: '🎓', category: 'Academic' },
    { title: 'New Student Admission', description: 'Register new student with wizard & fee schedule', route: '/admin/students/admission', icon: '➕', category: 'Admissions' },
    { title: 'Teachers Directory', description: 'Manage teaching faculty, qualifications & assignments', route: '/admin/teachers', icon: '👨‍🏫', category: 'Staff' },
    { title: 'Staff Management', description: 'Manage non-teaching administrative staff members', route: '/admin/staff', icon: '👥', category: 'Staff' },
    { title: 'Courses & Programs', description: 'Academic courses, curriculum & fee configurations', route: '/admin/courses', icon: '📚', category: 'Academic', module: 'LEARNING' },
    { title: 'Batches & Classes', description: 'Schedule and manage active student batches', route: '/admin/batches', icon: '🏫', category: 'Academic', module: 'LEARNING' },
    { title: 'Branch Management', description: 'Manage institute branch locations and centers', route: '/admin/branches', icon: '📍', category: 'System' },
    { title: 'Fee Management', description: 'Track fee plans, installments & payment collections', route: '/admin/fees', icon: '💳', category: 'Finance', module: 'FEES' },
    { title: 'CRM & Lead Management', description: 'Lead pipeline, follow-ups & demo scheduling', route: '/admin/crm', icon: '💼', category: 'CRM', module: 'CRM' },
    { title: 'Notices & Announcements', description: 'Send broadcasts, updates & announcements', route: '/admin/notices', icon: '📢', category: 'Communication', module: 'COMMUNICATION' },
    { title: 'Vacancies & Recruitment', description: 'Publish jobs & competitive exams with qualification matching', route: '/admin/vacancies', icon: '💼', category: 'Communication', module: 'COMMUNICATION' },
    { title: 'Coaching Centers / Institutes', description: 'Manage registered coaching center tenancies', route: '/admin/institutes', icon: '🏢', category: 'Super Admin', globalOnly: true },
    { title: 'Subscription Plans', description: 'Manage pricing tiers and platform subscriptions', route: '/admin/plans', icon: '💎', category: 'Super Admin', globalOnly: true },
    { title: 'Module Access & RBAC', description: 'Configure enabled modules for each coaching center', route: '/super-admin/organization-modules', icon: '⚙️', category: 'Super Admin', globalOnly: true },
  ];

  get filteredSearchResults(): SearchItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.allSearchItems.filter(item => {
      if (item.globalOnly && !this.isGlobalAdmin) return false;
      if (item.module && !this.showModule(item.module)) return false;
      if (!q) return true;
      return item.title.toLowerCase().includes(q) ||
             item.description.toLowerCase().includes(q) ||
             item.category.toLowerCase().includes(q);
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.isSearchOpen = !this.isSearchOpen;
      if (this.isSearchOpen) {
        setTimeout(() => {
          const input = this.elementRef.nativeElement.querySelector('.topbar-search-input');
          input?.focus();
        }, 50);
      }
    } else if (event.key === 'Escape') {
      this.closeQuickSearch();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.querySelector('.global-search-container')?.contains(target)) {
      this.closeQuickSearch();
    }
  }

  private institutesLoaded = false;
  private isLoadingInstitutes = false;

  ngOnInit() {
    this.user$.subscribe(user => {
      if (user) {
        const rawRole = user.rawRole || '';
        this.isGlobalAdmin = rawRole === 'GLOBAL_ADMIN' || rawRole === 'SUPER_ADMIN';
        if (this.isGlobalAdmin && !this.institutesLoaded && !this.isLoadingInstitutes) {
          this.selectedInstituteId = localStorage.getItem('active_institute_id') || 'system_global';
          this.loadInstitutes();
        }
      }
    });
  }

  loadInstitutes() {
    if (this.isLoadingInstitutes) return;
    this.isLoadingInstitutes = true;
    this.authFacade.getGlobalInstitutes().subscribe({
      next: (res) => {
        this.isLoadingInstitutes = false;
        this.institutesLoaded = true;
        this.institutes = Array.isArray(res) ? res : [];
        this.syncSelectedInstituteBranding();
      },
      error: (err) => {
        this.isLoadingInstitutes = false;
        console.error('Failed to load system institutes:', err);
      }
    });
  }

  private syncSelectedInstituteBranding() {
    if (!this.isGlobalAdmin) return;
    
    if (this.selectedInstituteId && this.selectedInstituteId !== 'system_global') {
      const selectedInst = this.institutes.find(i => i.id === this.selectedInstituteId);
      if (selectedInst) {
        const currentTenant = this.authFacade.currentTenantValue;
        if (currentTenant?.id === selectedInst.id && currentTenant?.name === selectedInst.name) {
          return;
        }
        const branding = {
          name: selectedInst.name,
          logo: selectedInst.logoPath || '/logo.png',
          code: selectedInst.instituteCode,
          contact: selectedInst.mobileNumber,
          email: selectedInst.emailAddress,
          address: selectedInst.addressLine1
        };
        localStorage.setItem('active_institute_branding', JSON.stringify(branding));
        this.authFacade.updateTenantBranding({
          id: selectedInst.id,
          name: selectedInst.name,
          logoUrl: selectedInst.logoPath || '/logo.png',
          code: selectedInst.instituteCode,
          contact: selectedInst.mobileNumber,
          email: selectedInst.emailAddress,
          address: selectedInst.addressLine1
        });
      }
    } else if (this.selectedInstituteId === 'system_global') {
      const currentTenant = this.authFacade.currentTenantValue;
      if (currentTenant?.id === 'system_global') {
        return;
      }
      const globalBranding = {
        name: 'EduNex Global Platform',
        logo: '/logo.png',
        code: 'GLOBAL',
        contact: '',
        email: '',
        address: 'Global Multi-Tenant Administration'
      };
      localStorage.setItem('active_institute_branding', JSON.stringify(globalBranding));
      this.authFacade.updateTenantBranding({
        id: 'system_global',
        name: 'EduNex Global Platform',
        logoUrl: '/logo.png',
        code: 'GLOBAL',
        contact: '',
        email: '',
        address: 'Global Multi-Tenant Administration'
      });
    }
  }

  onInstituteChange(event: Event) {
    const selectEl = event.target as HTMLSelectElement;
    this.switchActiveInstitute(selectEl.value);
  }

  switchActiveInstitute(newId: string) {
    if (!newId) return;
    this.selectedInstituteId = newId;
    localStorage.setItem('active_institute_id', newId);

    if (newId === 'system_global') {
      const globalBranding = {
        name: 'EduNex Global Platform',
        logo: '/logo.png',
        code: 'GLOBAL',
        contact: '',
        email: '',
        address: 'Global Multi-Tenant Administration'
      };
      localStorage.setItem('active_institute_branding', JSON.stringify(globalBranding));
      this.authFacade.updateTenantBranding({
        id: 'system_global',
        name: 'EduNex Global Platform',
        logoUrl: '/logo.png',
        code: 'GLOBAL'
      });
    } else {
      const selectedInst = this.institutes.find(i => i.id === newId);
      if (selectedInst) {
        const branding = {
          name: selectedInst.name,
          logo: selectedInst.logoPath || '/logo.png',
          code: selectedInst.instituteCode,
          contact: selectedInst.mobileNumber,
          email: selectedInst.emailAddress,
          address: selectedInst.addressLine1
        };
        localStorage.setItem('active_institute_branding', JSON.stringify(branding));
        this.authFacade.updateTenantBranding({
          id: selectedInst.id,
          name: selectedInst.name,
          logoUrl: selectedInst.logoPath || '/logo.png',
          code: selectedInst.instituteCode,
          contact: selectedInst.mobileNumber,
          email: selectedInst.emailAddress,
          address: selectedInst.addressLine1
        });
      }
    }

    window.location.reload();
  }

  get selectedInstituteDisplayName(): string {
    if (!this.selectedInstituteId || this.selectedInstituteId === 'system_global') {
      return 'Global System Overview';
    }
    const inst = this.institutes.find(i => i.id === this.selectedInstituteId);
    return inst ? `${inst.name} (${inst.instituteCode})` : 'Selected Institute';
  }

  openQuickSearch() {
    this.isSearchOpen = true;
  }

  closeQuickSearch() {
    this.isSearchOpen = false;
    this.searchQuery = '';
  }

  navigateToResult(route: string) {
    this.closeQuickSearch();
    this.router.navigate([route]);
  }

  onSearchKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const results = this.filteredSearchResults;
      if (results.length > 0) {
        event.preventDefault();
        this.navigateToResult(results[0].route);
      }
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
