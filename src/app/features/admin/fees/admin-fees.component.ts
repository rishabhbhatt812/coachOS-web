import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { FeeFacade } from '../../../core/facades/fee.facade';
import { StudentAdminFacade } from '../../../core/facades/student-admin.facade';
import { CourseFacade } from '../../../core/facades/course.facade';
import { BatchFacade } from '../../../core/facades/batch.facade';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateFeePlanRequest } from '../../../core/models/api-schemas';

@Component({
  selector: 'app-admin-fees',
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

  feePlans$ = this.feeFacade.feePlans$;
  students$ = this.studentFacade.students$;
  courses$ = this.courseFacade.courses$;
  batches$ = this.batchFacade.batches$;
  isLoading$ = this.feeFacade.isLoading$;
  showAddForm = false;
  feeForm!: FormGroup;

  columns: TableColumn[] = [
    { key: 'studentName', header: 'Student Name' },
    { key: 'courseName', header: 'Course' },
    { key: 'totalFee', header: 'Total Fee', type: 'currency' },
    { key: 'paidAmount', header: 'Paid', type: 'currency' },
    { key: 'dueAmount', header: 'Due', type: 'currency' },
    { key: 'status', header: 'Status', type: 'badge', badgeColorMap: { 'Paid': 'green', 'Due': 'orange', 'Overdue': 'red' } },
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
          this.snackBar.open('Fee plan created successfully!', 'Dismiss', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.toggleForm();
        },
        error: (err) => {
          console.error('Failed to create fee plan:', err);
        }
      });
    }
  }

  onActionClicked(event: any) {
    if (event.action === 'delete') {
      if (confirm('Are you sure you want to delete this fee plan?')) {
        this.feeFacade.deleteFeePlan(event.row.id).subscribe({
          next: () => {
            this.snackBar.open('Fee plan deleted successfully!', 'Dismiss', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Failed to delete fee plan:', err);
          }
        });
      }
    } else {
      this.snackBar.open(`Action "${event.action}" clicked for ${event.row.studentName}`, 'Dismiss', {
        duration: 2500,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }
}
