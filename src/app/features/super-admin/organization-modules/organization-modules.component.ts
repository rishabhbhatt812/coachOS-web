import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../core/constants/api-endpoints';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

interface ModuleConfig {
  moduleId: string;
  code: string;
  name: string;
  description: string | null;
  parentModuleId: string | null;
  displayOrder: number;
  icon: string | null;
  routePath: string | null;
  isMenuItem: boolean;
  isDefaultEnabled: boolean;
  isEnabled: boolean;
}

interface GroupedModule {
  parent: ModuleConfig;
  children: ModuleConfig[];
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

  institutes: any[] = [];
  filteredInstitutes: any[] = [];
  selectedInstitute: any = null;
  searchQuery = '';
  showDropdown = false;

  modules: ModuleConfig[] = [];
  groupedModules: GroupedModule[] = [];
  remarks = '';

  isLoadingInstitutes = false;
  isLoadingModules = false;
  isSaving = false;

  ngOnInit() {
    this.loadInstitutes();
  }

  loadInstitutes() {
    this.isLoadingInstitutes = true;
    this.http.get<any>(`${environment.apiUrl}/api/admin/GlobalAdmin/institutes`).subscribe({
      next: (res) => {
        this.institutes = res || [];
        this.filteredInstitutes = [...this.institutes];
        this.isLoadingInstitutes = false;
      },
      error: (err) => {
        console.error('Failed to load institutes:', err);
        this.isLoadingInstitutes = false;
        this.snackBar.open('Failed to load Coaching Centers.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  filterInstitutes() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredInstitutes = [...this.institutes];
    } else {
      this.filteredInstitutes = this.institutes.filter(inst =>
        inst.name.toLowerCase().includes(q) ||
        inst.instituteCode.toLowerCase().includes(q)
      );
    }
  }

  toggleDropdown(state: boolean) {
    // Delay slightly to allow click events on items to fire before hiding the dropdown list
    setTimeout(() => {
      this.showDropdown = state;
    }, 200);
  }

  selectInstitute(inst: any) {
    this.selectedInstitute = inst;
    this.searchQuery = inst.name;
    this.showDropdown = false;
    this.remarks = '';
    this.loadModules(inst.id);
  }

  loadModules(instituteId: string) {
    this.isLoadingModules = true;
    this.http.get<ModuleConfig[]>(`${environment.apiUrl}/api/organizations/${instituteId}/modules`).subscribe({
      next: (res) => {
        this.modules = res || [];
        this.groupModules(this.modules);
        this.isLoadingModules = false;
      },
      error: (err) => {
        console.error('Failed to load organization modules:', err);
        this.isLoadingModules = false;
        this.snackBar.open('Error loading module configurations.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  groupModules(modulesList: ModuleConfig[]) {
    const parents = modulesList.filter(m => !m.parentModuleId);
    this.groupedModules = parents.map(parent => {
      const children = modulesList.filter(m => m.parentModuleId === parent.moduleId);
      return {
        parent,
        children: children.sort((a, b) => a.displayOrder - b.displayOrder)
      };
    }).sort((a, b) => a.parent.displayOrder - b.parent.displayOrder);
  }

  onParentToggle(group: GroupedModule) {
    const isEnabled = group.parent.isEnabled;
    if (!isEnabled) {
      // If parent is disabled, automatically disable all children
      group.children.forEach(c => c.isEnabled = false);
    }
  }

  onChildToggle(group: GroupedModule, child: ModuleConfig) {
    if (child.isEnabled) {
      // If a child is enabled, automatically make sure the parent is enabled
      group.parent.isEnabled = true;
    }
  }

  saveConfiguration() {
    if (!this.selectedInstitute) return;
    this.isSaving = true;

    // Collect all enabled module IDs
    const enabledModuleIds: string[] = [];
    this.groupedModules.forEach(group => {
      if (group.parent.isEnabled) {
        enabledModuleIds.push(group.parent.moduleId);
        group.children.forEach(child => {
          if (child.isEnabled) {
            enabledModuleIds.push(child.moduleId);
          }
        });
      }
    });

    const payload = {
      enabledModuleIds,
      remarks: this.remarks
    };

    this.http.put(`${environment.apiUrl}/api/organizations/${this.selectedInstitute.id}/modules`, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open('Module settings updated successfully!', 'Dismiss', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Reload settings to ensure state sync
        this.loadModules(this.selectedInstitute.id);
      },
      error: (err) => {
        console.error('Failed to update modules:', err);
        this.isSaving = false;
        this.snackBar.open('Error saving module configurations.', 'Dismiss', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
