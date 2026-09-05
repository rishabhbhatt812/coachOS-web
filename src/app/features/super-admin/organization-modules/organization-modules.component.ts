import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { environment } from '../../../core/constants/api-endpoints';

interface ModuleItem {
  moduleId: string;
  code: string;
  name: string;
  description?: string;
  isEnabled: boolean;
}

interface InstituteItem {
  id: string;
  name: string;
  instituteCode?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-organization-modules',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    MatSnackBarModule
  ],
  templateUrl: './organization-modules.component.html',
  styleUrl: './organization-modules.component.scss'
})
export class OrganizationModulesComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  institutes: InstituteItem[] = [];
  selectedInstituteId: string = '';
  modules: ModuleItem[] = [];

  isLoadingInstitutes = false;
  isLoadingModules = false;
  isSaving = false;

  ngOnInit(): void {
    this.loadInstitutes();
  }

  loadInstitutes(): void {
    this.isLoadingInstitutes = true;
    this.http.get<any>(`${environment.apiUrl}/api/admin/GlobalAdmin/institutes`).subscribe({
      next: (res) => {
        this.institutes = Array.isArray(res) ? res : (res?.data || []);
        this.isLoadingInstitutes = false;
        if (this.institutes.length > 0) {
          const activeInstitute = localStorage.getItem('active_institute_id');
          if (activeInstitute && activeInstitute !== 'system_global' && this.institutes.some(i => i.id === activeInstitute)) {
            this.selectedInstituteId = activeInstitute;
          } else {
            this.selectedInstituteId = this.institutes[0].id;
          }
          this.loadModules(this.selectedInstituteId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load institutes:', err);
        this.isLoadingInstitutes = false;
        this.snackBar.open('Error loading coaching centers.', 'Dismiss', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  onInstituteChange(instituteId: string): void {
    this.selectedInstituteId = instituteId;
    if (instituteId) {
      this.loadModules(instituteId);
    } else {
      this.modules = [];
      this.cdr.detectChanges();
    }
  }

  loadModules(instituteId: string): void {
    if (!instituteId) return;
    this.isLoadingModules = true;
    this.cdr.detectChanges();
    this.http.get<any>(`${environment.apiUrl}/api/admin/GlobalAdmin/institutes/${instituteId}/modules`).subscribe({
      next: (res) => {
        this.modules = res || [];
        this.isLoadingModules = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load modules:', err);
        this.isLoadingModules = false;
        this.snackBar.open('Error loading module configuration.', 'Dismiss', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  toggleAll(enable: boolean): void {
    this.modules.forEach(m => m.isEnabled = enable);
  }

  get enabledCount(): number {
    return this.modules.filter(m => m.isEnabled).length;
  }

  saveModules(): void {
    if (!this.selectedInstituteId) return;
    this.isSaving = true;

    const enabledModuleIds = this.modules
      .filter(m => m.isEnabled)
      .map(m => m.moduleId);

    this.http.post<any>(`${environment.apiUrl}/api/admin/GlobalAdmin/institutes/${this.selectedInstituteId}/modules`, enabledModuleIds).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open('Module settings saved successfully!', 'Dismiss', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Failed to save module settings:', err);
        this.isSaving = false;
        this.snackBar.open('Error saving module settings.', 'Dismiss', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
