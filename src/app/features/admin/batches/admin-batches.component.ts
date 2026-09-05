import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { BatchFacade } from '../../../core/facades/batch.facade';
import { CourseFacade } from '../../../core/facades/course.facade';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/constants/api-endpoints';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-admin-batches',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PageHeaderComponent,
    DataTableComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-batches.component.html',
  styleUrl: './admin-batches.component.scss'
})
export class AdminBatchesComponent implements OnInit {
  private batchFacade = inject(BatchFacade);
  private courseFacade = inject(CourseFacade);
  private authFacade = inject(AuthFacade);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);
  private dialogService = inject(DialogService);

  batches$ = this.batchFacade.batches$;
  courses$ = this.courseFacade.courses$;
  isLoading$ = this.batchFacade.isLoading$;
  showAddForm = false;
  editingId: string | null = null;
  batchForm!: FormGroup;

  teachers: any[] = [];
  subjects: any[] = [];
  branches: any[] = [];

  isGlobalAdmin = false;
  institutes: any[] = [];
  selectedInstituteFilter = 'all';

  columns: TableColumn[] = [
    { key: 'batchCode', header: 'Code' },
    { key: 'name', header: 'Batch Name' },
    { key: 'courseName', header: 'Course' },
    { key: 'subjectName', header: 'Subjects' },
    { key: 'capacity', header: 'Capacity' },
    { key: 'roomNumber', header: 'Room' },
    { key: 'batchStatus', header: 'Status', type: 'badge', badgeColorMap: { 'Upcoming': 'blue', 'Running': 'green', 'Completed': 'gray', 'Cancelled': 'red' } },
    { key: 'startDate', header: 'Start Date', type: 'date' },
    { key: 'actions', header: 'Actions', type: 'action' }
  ];

  ngOnInit() {
    this.batchFacade.loadBatches();
    this.courseFacade.loadCourses();
    this.initForm();
    this.loadTeachers();
    this.loadSubjects();
    this.loadBranches();

    this.authFacade.currentUser$.subscribe(user => {
      if (user) {
        const rawRole = user.rawRole || '';
        this.isGlobalAdmin = rawRole === 'GLOBAL_ADMIN' || rawRole === 'SUPER_ADMIN';
        if (this.isGlobalAdmin) {
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

  getFilteredBatches(batches: any[] | null): any[] {
    if (!batches) return [];
    if (!this.isGlobalAdmin || this.selectedInstituteFilter === 'all') {
      return batches;
    }
    return batches.filter(b => b.instituteId === this.selectedInstituteFilter);
  }

  loadTeachers() {
    this.http.get<any>(`${environment.apiUrl}/api/admin/teachers`).subscribe({
      next: (res) => {
        let list: any[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && typeof res === 'object') {
          if (res.success && res.data) {
            if (Array.isArray(res.data)) {
              list = res.data;
            } else if (typeof res.data === 'object' && res.data.id) {
              list = [res.data];
            }
          } else if (res.id) {
            list = [res];
          } else if (res.data && Array.isArray(res.data)) {
            list = res.data;
          }
        }
        this.teachers = list;
      },
      error: (err) => console.error('Failed to load teachers:', err)
    });
  }

  loadSubjects() {
    this.http.get<any>(`${environment.apiUrl}/api/admin/Subjects`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.subjects = res.data.data || res.data;
        } else if (Array.isArray(res)) {
          this.subjects = res;
        }
      },
      error: (err) => console.error('Failed to load subjects:', err)
    });
  }

  loadBranches() {
    this.http.get<any>(`${environment.apiUrl}/api/admin/Branches`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.branches = res.data.data || res.data;
        } else if (Array.isArray(res)) {
          this.branches = res;
        }
      },
      error: (err) => console.error('Failed to load branches:', err)
    });
  }

  initForm() {
    const today = new Date().toISOString().split('T')[0];
    this.batchForm = this.fb.group({
      instituteId: [''],
      courseId: ['', [Validators.required]],
      name: ['', [Validators.required]],
      batchCode: ['', [Validators.required]],
      startDate: [today, [Validators.required]],
      endDate: [''],
      startTime: ['09:00', [Validators.required]],
      endTime: ['11:00', [Validators.required]],
      capacity: [30, [Validators.required, Validators.min(1)]],
      roomNumber: ['Room 101'],
      batchStatus: ['Upcoming', [Validators.required]],
      branchId: [''],
      subjectIds: [[]],
      teacherUserIds: [[]]
    });
  }

  toggleSubject(subjectId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const current: string[] = this.batchForm.get('subjectIds')?.value || [];
    if (input.checked) {
      this.batchForm.get('subjectIds')?.setValue([...current, subjectId]);
    } else {
      this.batchForm.get('subjectIds')?.setValue(current.filter(id => id !== subjectId));
    }
  }

  toggleTeacher(teacherId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const current: string[] = this.batchForm.get('teacherUserIds')?.value || [];
    if (input.checked) {
      this.batchForm.get('teacherUserIds')?.setValue([...current, teacherId]);
    } else {
      this.batchForm.get('teacherUserIds')?.setValue(current.filter(id => id !== teacherId));
    }
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.showAddForm = false;
    this.editingId = null;
    this.initForm();
  }

  onSubmit() {
    if (this.batchForm.valid) {
      const val = this.batchForm.value;
      if (this.editingId) {
        const req: any = {
          name: val.name,
          batchCode: val.batchCode,
          startDate: val.startDate,
          endDate: val.endDate,
          startTime: val.startTime,
          endTime: val.endTime,
          capacity: val.capacity,
          roomNumber: val.roomNumber,
          batchStatus: val.batchStatus,
          branchId: val.branchId || null,
          subjectIds: val.subjectIds || [],
          teacherUserIds: val.teacherUserIds || []
        };
        this.batchFacade.updateBatch(this.editingId, req).subscribe({
          next: () => {
            this.snackBar.open('Batch updated successfully!', 'Dismiss', { duration: 3000 });
            this.cancelEdit();
          },
          error: (err) => console.error('Failed to update batch:', err)
        });
      } else {
        const req: any = {
          instituteId: val.instituteId || undefined,
          courseId: val.courseId,
          name: val.name,
          batchCode: val.batchCode,
          startDate: val.startDate,
          endDate: val.endDate,
          startTime: val.startTime,
          endTime: val.endTime,
          capacity: val.capacity,
          roomNumber: val.roomNumber,
          batchStatus: val.batchStatus,
          branchId: val.branchId || null,
          subjectIds: val.subjectIds || [],
          teacherUserIds: val.teacherUserIds || []
        };
        this.batchFacade.createBatch(req).subscribe({
          next: () => {
            this.snackBar.open('Batch created successfully!', 'Dismiss', { duration: 3000 });
            this.cancelEdit();
          },
          error: (err) => console.error('Failed to create batch:', err)
        });
      }
    }
  }

  onActionClicked(event: any) {
    if (event.action === 'edit') {
      this.editingId = event.row.id;
      this.batchForm.patchValue({
        courseId: event.row.courseId,
        name: event.row.name,
        batchCode: event.row.batchCode,
        startDate: event.row.startDate ? event.row.startDate.split('T')[0] : '',
        endDate: event.row.endDate ? event.row.endDate.split('T')[0] : '',
        startTime: event.row.startTime,
        endTime: event.row.endTime,
        capacity: event.row.capacity,
        roomNumber: event.row.roomNumber,
        batchStatus: event.row.batchStatus,
        branchId: event.row.branchId,
        subjectIds: event.row.subjectIds || [],
        teacherUserIds: event.row.teacherUserIds || []
      });
      this.showAddForm = true;
    } else if (event.action === 'delete') {
      this.dialogService.delete(event.row.name ? `batch: ${event.row.name}` : 'Batch').subscribe(confirmed => {
        if (confirmed) {
          this.batchFacade.deleteBatch(event.row.id).subscribe({
            next: () => {
              this.dialogService.success('Batch deleted successfully!');
            },
            error: (err) => {
              console.error('Failed to delete batch:', err);
              this.dialogService.error('Failed to delete batch.');
            }
          });
        }
      });
    }
  }
}
