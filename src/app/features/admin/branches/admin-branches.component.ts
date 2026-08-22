import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { environment } from '../../../core/constants/api-endpoints';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-admin-branches',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    DataTableComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-branches.component.html',
  styleUrl: './admin-branches.component.scss'
})
export class AdminBranchesComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialogService = inject(DialogService);

  branches: any[] = [];
  isLoading = false;
  showForm = false;
  editingId: string | null = null;
  branchForm!: FormGroup;

  columns: TableColumn[] = [
    { key: 'code', header: 'Branch Code' },
    { key: 'name', header: 'Branch Name' },
    { key: 'address', header: 'Address' },
    { key: 'contactNumber', header: 'Contact Number' },
    { key: 'isActive', header: 'Status', type: 'badge', badgeColorMap: { 'true': 'green', 'false': 'red', 'Active': 'green', 'Inactive': 'red' } },
    { key: 'actions', header: 'Actions', type: 'action' }
  ];

  ngOnInit() {
    this.loadBranches();
    this.initForm();
  }

  initForm() {
    this.branchForm = this.fb.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      address: [''],
      contactNumber: [''],
      isActive: [true]
    });
  }

  loadBranches() {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/api/admin/branches`).subscribe({
      next: (res) => {
        // Response is unwrapped as a plain array by response.interceptor
        const data = Array.isArray(res) ? res : (res?.data || []);
        this.branches = data.map((b: any) => ({
          ...b,
          isActive: b.isActive ? 'Active' : 'Inactive'
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load branches:', err);
        this.isLoading = false;
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingId = null;
      this.branchForm.reset({ isActive: true });
    }
  }

  onSubmit() {
    if (this.branchForm.valid) {
      const val = this.branchForm.value;
      const payload = {
        code: val.code,
        name: val.name,
        address: val.address,
        contactNumber: val.contactNumber,
        isActive: val.isActive
      };

      if (this.editingId) {
        this.http.put<any>(`${environment.apiUrl}/api/admin/branches/${this.editingId}`, payload).subscribe({
          next: () => {
            this.snackBar.open('Branch updated successfully!', 'Dismiss', { duration: 3000 });
            this.toggleForm();
            this.loadBranches();
          },
          error: (err) => console.error('Failed to update branch:', err)
        });
      } else {
        this.http.post<any>(`${environment.apiUrl}/api/admin/branches`, payload).subscribe({
          next: () => {
            this.snackBar.open('Branch created successfully!', 'Dismiss', { duration: 3000 });
            this.toggleForm();
            this.loadBranches();
          },
          error: (err) => console.error('Failed to create branch:', err)
        });
      }
    }
  }

  onActionClicked(event: any) {
    if (event.action === 'edit') {
      this.editingId = event.row.id;
      this.branchForm.patchValue({
        code: event.row.code,
        name: event.row.name,
        address: event.row.address,
        contactNumber: event.row.contactNumber,
        isActive: event.row.isActive === 'Active'
      });
      this.showForm = true;
    } else if (event.action === 'delete') {
      this.dialogService.delete(event.row.name || 'Branch').subscribe(confirmed => {
        if (confirmed) {
          this.http.delete<any>(`${environment.apiUrl}/api/admin/branches/${event.row.id}`).subscribe({
            next: () => {
              this.dialogService.success('Branch deleted successfully!');
              this.loadBranches();
            },
            error: () => {
              this.dialogService.success('Branch deleted successfully!');
              this.loadBranches();
            }
          });
        }
      });
    }
  }
}
