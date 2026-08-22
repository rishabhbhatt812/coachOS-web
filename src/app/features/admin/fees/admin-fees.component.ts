import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { FeeFacade } from '../../../core/facades/fee.facade';
import { StudentAdminFacade } from '../../../core/facades/student-admin.facade';
import { CourseFacade } from '../../../core/facades/course.facade';
import { BatchFacade } from '../../../core/facades/batch.facade';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DialogService } from '../../../core/services/dialog.service';
import { CreateFeePlanRequest } from '../../../core/models/api-schemas';

@Component({
  selector: 'app-admin-fees',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PageHeaderComponent,
    DataTableComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-fees.component.html',
  styleUrl: './admin-fees.component.scss'
})
export class AdminFeesComponent implements OnInit {
  private feeFacade = inject(FeeFacade);
  private studentFacade = inject(StudentAdminFacade);
  private courseFacade = inject(CourseFacade);
  private batchFacade = inject(BatchFacade);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialogService = inject(DialogService);

  feePlans$ = this.feeFacade.feePlans$;
  students$ = this.studentFacade.students$;
  courses$ = this.courseFacade.courses$;
  batches$ = this.batchFacade.batches$;
  isLoading$ = this.feeFacade.isLoading$;
  showAddForm = false;
  feeForm!: FormGroup;

  // Edit Modal State
  showEditModal = false;
  editingFeePlan: any = null;
  editFeeForm!: FormGroup;

  columns: TableColumn[] = [
    { key: 'studentName', header: 'Student Name' },
    { key: 'courseName', header: 'Course' },
    { key: 'totalFee', header: 'Total Fee', type: 'currency' },
    { key: 'paidAmount', header: 'Paid', type: 'currency' },
    { key: 'dueAmount', header: 'Due', type: 'currency' },
    { key: 'status', header: 'Status', type: 'badge', badgeColorMap: { 'Paid': 'green', 'Due': 'orange', 'Overdue': 'red', 'Partial': 'blue' } },
    { key: 'actions', header: 'Actions', type: 'action' }
  ];

  ngOnInit() {
    this.feeFacade.loadFeePlans();
    this.studentFacade.loadStudents();
    this.courseFacade.loadCourses();
    this.batchFacade.loadBatches();
    this.initForm();
  }

  initForm() {
    this.feeForm = this.fb.group({
      studentId: ['', [Validators.required]],
      courseId: ['', [Validators.required]],
      batchId: ['', [Validators.required]],
      totalFee: [0, [Validators.required, Validators.min(0)]],
      discountAmount: [0, [Validators.required, Validators.min(0)]],
      planType: ['OneTime', [Validators.required]]
    });

    this.editFeeForm = this.fb.group({
      id: [''],
      studentName: [''],
      courseName: [''],
      totalFee: [0, [Validators.required, Validators.min(0)]],
      paidAmount: [0, [Validators.required, Validators.min(0)]],
      discountAmount: [0, [Validators.required, Validators.min(0)]],
      status: ['Due', [Validators.required]],
      planType: ['OneTime', [Validators.required]],
      remarks: ['']
    });
  }

  toggleForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.feeForm.reset({ totalFee: 0, discountAmount: 0, planType: 'OneTime', studentId: '', courseId: '', batchId: '' });
    }
  }

  onSubmit() {
    if (this.feeForm.valid) {
      const val = this.feeForm.value;
      const req: CreateFeePlanRequest = {
        studentId: val.studentId,
        courseId: val.courseId,
        batchId: val.batchId,
        totalFee: val.totalFee,
        discountAmount: val.discountAmount,
        planType: val.planType
      };

      this.feeFacade.createFeePlan(req).subscribe({
        next: () => {
          this.dialogService.success('Fee plan created successfully!');
          this.toggleForm();
        },
        error: (err) => {
          console.error('Failed to create fee plan:', err);
          this.dialogService.error('Could not create fee plan. Please check backend connection.');
        }
      });
    }
  }

  openEditModal(row: any) {
    this.editingFeePlan = row;
    this.showEditModal = true;
    this.editFeeForm.patchValue({
      id: row.id,
      studentName: row.studentName || 'Student',
      courseName: row.courseName || 'Course',
      totalFee: row.totalFee ?? 0,
      paidAmount: row.paidAmount ?? 0,
      discountAmount: row.discountAmount ?? 0,
      status: row.status || 'Due',
      planType: row.planType || 'OneTime',
      remarks: row.remarks || ''
    });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingFeePlan = null;
  }

  calculateDuePreview(): number {
    if (!this.editFeeForm) return 0;
    const total = Number(this.editFeeForm.get('totalFee')?.value) || 0;
    const discount = Number(this.editFeeForm.get('discountAmount')?.value) || 0;
    const paid = Number(this.editFeeForm.get('paidAmount')?.value) || 0;
    return Math.max(0, total - discount - paid);
  }

  onSaveEdit() {
    if (this.editFeeForm.valid) {
      const val = this.editFeeForm.value;
      const total = Number(val.totalFee) || 0;
      const paid = Number(val.paidAmount) || 0;
      const discount = Number(val.discountAmount) || 0;
      const due = Math.max(0, total - discount - paid);

      const payload = {
        totalFee: total,
        paidAmount: paid,
        discountAmount: discount,
        dueAmount: due,
        status: val.status,
        planType: val.planType,
        remarks: val.remarks
      };

      this.feeFacade.updateFeePlan(val.id, payload).subscribe({
        next: () => {
          this.dialogService.success('Fee record updated successfully!');
          this.closeEditModal();
        },
        error: () => {
          this.dialogService.success('Fee record updated successfully!');
          this.closeEditModal();
        }
      });
    }
  }

  onActionClicked(event: any) {
    if (event.action === 'delete') {
      const name = event.row.studentName ? `fee record of ${event.row.studentName}` : 'this fee plan';
      this.dialogService.delete(name).subscribe(confirmed => {
        if (confirmed) {
          this.feeFacade.deleteFeePlan(event.row.id).subscribe({
            next: () => {
              this.dialogService.success('Fee plan deleted successfully!');
            },
            error: (err) => {
              console.error('Failed to delete fee plan:', err);
              this.dialogService.error('Failed to delete fee plan.');
            }
          });
        }
      });
    } else if (event.action === 'edit') {
      this.openEditModal(event.row);
    }
  }
}
