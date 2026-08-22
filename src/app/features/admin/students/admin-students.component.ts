import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { StudentAdminFacade } from '../../../core/facades/student-admin.facade';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateStudentRequest, UpdateStudentRequest } from '../../../core/models/api-schemas';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-admin-students',
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
  templateUrl: './admin-students.component.html',
  styleUrl: './admin-students.component.scss'
})
export class AdminStudentsComponent implements OnInit {
  private studentFacade = inject(StudentAdminFacade);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  students$ = this.studentFacade.students$;
  isLoading$ = this.studentFacade.isLoading$;
  showAddForm = false;
  editingId: string | null = null;
  studentForm!: FormGroup;

  columns: TableColumn[] = [
    { key: 'studentCode', header: 'Student Code', clickable: true },
    { key: 'fullName', header: 'Full Name', clickable: true },
    { key: 'email', header: 'Email' },
    { key: 'mobile', header: 'Phone' },
    { key: 'admissionDate', header: 'Admission Date', type: 'date' },
    { key: 'actions', header: 'Actions', type: 'action' }
  ];

  ngOnInit() {
    this.studentFacade.loadStudents();
    this.initForm();
  }

  initForm() {
    const today = new Date().toISOString().split('T')[0];
    this.studentForm = this.fb.group({
      studentCode: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', [Validators.required]],
      admissionDate: [today, [Validators.required]]
    });
  }

  navigateToAddStudent() {
    this.router.navigate(['/admin/students/admission']);
  }

  openStudentProfile(student: any) {
    if (student && student.id) {
      this.router.navigate(['/admin/students/profile', student.id]);
    }
  }

  cancelEdit() {
    this.showAddForm = false;
    this.editingId = null;
    this.studentForm.reset({ admissionDate: new Date().toISOString().split('T')[0] });
  }

  onSubmit() {
    if (this.studentForm.valid) {
      const val = this.studentForm.value;
      if (this.editingId) {
        const req: UpdateStudentRequest = {
          fullName: val.fullName,
          mobile: val.mobile,
          email: val.email,
          dateOfBirth: val.dateOfBirth
        };
        this.studentFacade.updateStudent(this.editingId, req).subscribe({
          next: () => {
            this.snackBar.open('Student updated successfully!', 'Dismiss', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: ['success-snackbar'] });
            this.cancelEdit();
          },
          error: (err) => console.error('Failed to update student:', err)
        });
      } else {
        const req: CreateStudentRequest = {
          studentCode: val.studentCode,
          fullName: val.fullName,
          mobile: val.mobile,
          email: val.email,
          dateOfBirth: val.dateOfBirth,
          admissionDate: val.admissionDate
        };
        this.studentFacade.createStudent(req).subscribe({
          next: () => {
            this.snackBar.open('Student created successfully!', 'Dismiss', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: ['success-snackbar'] });
            this.cancelEdit();
          },
          error: (err) => console.error('Failed to create student:', err)
        });
      }
    }
  }

  onActionClicked(event: any) {
    if (event.action === 'view') {
      this.openStudentProfile(event.row);
    } else if (event.action === 'edit') {
      this.editingId = event.row.id;
      this.studentForm.patchValue({
        studentCode: event.row.studentCode,
        fullName: event.row.fullName,
        mobile: event.row.mobile,
        email: event.row.email,
        dateOfBirth: event.row.dateOfBirth ? event.row.dateOfBirth.split('T')[0] : '',
        admissionDate: event.row.admissionDate ? event.row.admissionDate.split('T')[0] : ''
      });
      this.studentForm.get('studentCode')?.disable();
      this.showAddForm = true;
    } else if (event.action === 'delete') {
      this.dialogService.delete(event.row.fullName ? `student: ${event.row.fullName}` : 'Student').subscribe(confirmed => {
        if (confirmed) {
          this.studentFacade.deleteStudent(event.row.id).subscribe({
            next: () => {
              this.dialogService.success('Student deleted successfully!');
            },
            error: (err) => {
              console.error('Failed to delete student:', err);
              this.dialogService.error('Failed to delete student.');
            }
          });
        }
      });
    }
  }
}
