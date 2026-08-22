import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { AttendanceFacade } from '../../../core/facades/attendance.facade';
import { BatchFacade } from '../../../core/facades/batch.facade';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateAttendanceSessionRequest } from '../../../core/models/api-schemas';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-admin-attendance',
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
  templateUrl: './admin-attendance.component.html',
  styleUrl: './admin-attendance.component.scss'
})
export class AdminAttendanceComponent implements OnInit {
  private attendanceFacade = inject(AttendanceFacade);
  private batchFacade = inject(BatchFacade);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialogService = inject(DialogService);

  sessions$ = this.attendanceFacade.sessions$;
  batches$ = this.batchFacade.batches$;
  isLoading$ = this.attendanceFacade.isLoading$;
  showAddForm = false;
  attendanceForm!: FormGroup;

  columns: TableColumn[] = [
    { key: 'attendanceDate', header: 'Date', type: 'date' },
    { key: 'batchName', header: 'Batch' },
    { key: 'takenByName', header: 'Taken By' },
    { key: 'presentCount', header: 'Present' },
    { key: 'totalStudents', header: 'Total Enrolled' },
    { key: 'actions', header: 'Actions', type: 'action' }
  ];

  ngOnInit() {
    this.attendanceFacade.loadSessions();
    this.batchFacade.loadBatches();
    this.initForm();
  }

  initForm() {
    // Current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    this.attendanceForm = this.fb.group({
      batchId: ['', [Validators.required]],
      attendanceDate: [today, [Validators.required]],
      takenByUserId: ['']
    });
  }

  toggleForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      const today = new Date().toISOString().split('T')[0];
      this.attendanceForm.reset({ attendanceDate: today, batchId: '' });
    }
  }

  onSubmit() {
    if (this.attendanceForm.valid) {
      const val = this.attendanceForm.value;
      const req: CreateAttendanceSessionRequest = {
        batchId: val.batchId,
        attendanceDate: val.attendanceDate,
        takenByUserId: val.takenByUserId || undefined
      };

      this.attendanceFacade.createSession(req).subscribe({
        next: () => {
          this.snackBar.open('Attendance session created successfully!', 'Dismiss', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.toggleForm();
        },
        error: (err) => {
          console.error('Failed to create attendance session:', err);
        }
      });
    }
  }

  onActionClicked(event: any) {
    if (event.action === 'delete') {
      this.dialogService.delete(`attendance session for ${event.row.batchName || 'Batch'}`).subscribe(confirmed => {
        if (confirmed) {
          this.attendanceFacade.deleteSession(event.row.id).subscribe({
            next: () => {
              this.dialogService.success('Attendance session deleted successfully!');
            },
            error: (err) => {
              console.error('Failed to delete attendance session:', err);
              this.dialogService.error('Failed to delete attendance session.');
            }
          });
        }
      });
    } else {
      this.dialogService.alert(`Details for Batch ${event.row.batchName} (Date: ${event.row.attendanceDate})`, 'Attendance Session Info', 'info');
    }
  }
}
