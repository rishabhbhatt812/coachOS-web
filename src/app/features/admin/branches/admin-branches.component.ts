import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { BranchFacade } from '../../../core/facades/branch.facade';
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
  private branchFacade = inject(BranchFacade);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialogService = inject(DialogService);

  branches$ = this.branchFacade.branches$;
  isLoading$ = this.branchFacade.isLoading$;
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
    this.branchFacade.loadBranches();
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
        this.branchFacade.updateBranch(this.editingId, payload).subscribe({
          next: () => {
            this.dialogService.success('Branch updated successfully!');
            this.toggleForm();
          },
          error: (err) => console.error('Failed to update branch:', err)
        });
      } else {
        this.branchFacade.createBranch(payload).subscribe({
          next: () => {
            this.dialogService.success('Branch created successfully!');
            this.toggleForm();
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
        isActive: event.row.isActive === 'Active' || event.row.isActive === true
      });
      this.showForm = true;
    } else if (event.action === 'delete') {
      this.dialogService.delete(event.row.name || 'Branch').subscribe(confirmed => {
        if (confirmed) {
          this.branchFacade.deleteBranch(event.row.id).subscribe({
            next: () => {
              this.dialogService.success('Branch deleted successfully!');
            },
            error: () => {
              this.dialogService.success('Branch deleted successfully!');
            }
          });
        }
      });
    }
  }
}
