import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { StudentAdminFacade } from '../../../core/facades/student-admin.facade';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateStudentRequest, UpdateStudentRequest } from '../../../core/models/api-schemas';
import { DialogService } from '../../../core/services/dialog.service';
import { AdmissionsService } from '../../../core/services/admissions.service';
import { environment } from '../../../core/constants/api-endpoints';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  private authFacade = inject(AuthFacade);
  private admissionsService = inject(AdmissionsService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);

  students$ = this.studentFacade.students$;
  isLoading$ = this.studentFacade.isLoading$;
  showAddForm = false;
  editingId: string | null = null;
  studentForm!: FormGroup;

  isGlobalAdmin = false;
  institutes: any[] = [];
  selectedInstituteFilter = 'all';

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

    this.authFacade.currentUser$.subscribe(user => {
      if (user) {
        const rawRole = user.rawRole || '';
        this.isGlobalAdmin = rawRole === 'GLOBAL_ADMIN' || rawRole === 'SUPER_ADMIN';
        if (this.isGlobalAdmin) {
          // Add Institute column for Super Admin
          if (!this.columns.some(c => c.key === 'instituteName')) {
            this.columns.splice(2, 0, { key: 'instituteName', header: 'Coaching Center' });
          }
          if (this.institutes.length === 0) {
            this.loadInstitutes();
          }
        }
      }
    });
  }

  loadInstitutes() {
    this.authFacade.getGlobalInstitutes().subscribe({
      next: (res) => {
        this.institutes = Array.isArray(res) ? res : [];
      },
      error: (err) => console.error('Failed to load institutes:', err)
    });
  }

  getFilteredStudents(students: any[] | null): any[] {
    if (!students) return [];
    if (!this.isGlobalAdmin || this.selectedInstituteFilter === 'all') {
      return students;
    }
    return students.filter(s => s.instituteId === this.selectedInstituteFilter);
  }

  initForm() {
    const today = new Date().toISOString().split('T')[0];
    this.studentForm = this.fb.group({
      instituteId: [''],
      studentCode: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', [Validators.required]],
      admissionDate: [today, [Validators.required]]
    });

    this.fetchNextStudentCode('STU');
  }

  fetchNextStudentCode(prefix: string) {
    this.admissionsService.getNextStudentCode(prefix).subscribe({
      next: (res) => {
        let code = '';
        if (typeof res === 'string') {
          code = res;
        } else if (res && typeof res === 'object') {
          code = res.data || res.code || (res.success && res.data ? res.data : '');
        }
        if (code && !this.editingId) {
          this.studentForm.get('studentCode')?.setValue(code);
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error fetching student code:', err)
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
        const req: any = {
          instituteId: val.instituteId || undefined,
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
