import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { BatchFacade } from '../../../core/facades/batch.facade';
import { CourseFacade } from '../../../core/facades/course.facade';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CreateBatchRequest, UpdateBatchRequest } from '../../../core/models/api-schemas';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/constants/api-endpoints';

@Component({
  selector: 'app-admin-batches',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    DataTableComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './admin-batches.component.html',
  styleUrl: './admin-batches.component.scss'
})
export class AdminBatchesComponent implements OnInit {
  private batchFacade = inject(BatchFacade);
  private courseFacade = inject(CourseFacade);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);

  batches$ = this.batchFacade.batches$;
  courses$ = this.courseFacade.courses$;
  isLoading$ = this.batchFacade.isLoading$;
  showAddForm = false;
  editingId: string | null = null;
  batchForm!: FormGroup;

  teachers: any[] = [];
  subjects: any[] = [];
  branches: any[] = [];
  subjectTeacherMap: { [subjectId: string]: string | null } = {};

  getSelectedSubjects(): string[] {
    return this.batchForm?.get('subjectIds')?.value || [];
  }

  getSubjectName(subId: string): string {
    const sub = this.subjects.find(s => s.id === subId);
    return sub ? sub.name : 'Unknown Subject';
  }

  getTeachersForSubject(subId: string): any[] {
    return this.teachers.filter(t => 
      t.subjects && t.subjects.some((s: any) => s.subjectId === subId)
    );
  }

  onTeacherChange(subId: string, teacherId: string | null) {
    this.subjectTeacherMap[subId] = teacherId;
  }

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
    this.http.get<any>(`${environment.apiUrl}/api/admin/subjects`).subscribe({
      next: (res) => {
        this.subjects = Array.isArray(res) ? res : (res?.data?.data || res?.data || []);
      },
      error: (err) => console.error('Failed to load subjects:', err)
    });
  }

  loadBranches() {
    this.http.get<any>(`${environment.apiUrl}/api/admin/branches`).subscribe({
      next: (res) => {
        this.branches = Array.isArray(res) ? res : (res?.data || []);
      },
      error: (err) => console.error('Failed to load branches:', err)
    });
  }

  initForm() {
    this.batchForm = this.fb.group({
      batchCode: ['', [Validators.required]],
      name: ['', [Validators.required]],
      courseId: ['', [Validators.required]],
      branchId: ['', [Validators.required]],
      subjectIds: [[]],
      teacherUserId: [''],
      defaultFee: [0, [Validators.required, Validators.min(0)]],
      startTime: [''],
      endTime: [''],
      startDate: [''],
      endDate: [''],
      capacity: [40, [Validators.required, Validators.min(1)]],
      roomNumber: [''],
      batchStatus: ['Upcoming', [Validators.required]]
    });
  }

  toggleForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.editingId = null;
      this.batchForm.reset({ defaultFee: 0, courseId: '', branchId: '', batchStatus: 'Upcoming', capacity: 40 });
      this.subjectTeacherMap = {};
    }
  }

  onSubmit() {
    if (this.batchForm.valid) {
      const val = this.batchForm.value;
      const selectedSubs = val.subjectIds || [];
      const mappings = selectedSubs.map((subId: string) => ({
        subjectId: subId,
        teacherUserId: this.subjectTeacherMap[subId] || undefined
      }));

      const req: any = {
        batchCode: val.batchCode,
        name: val.name,
        courseId: val.courseId,
        branchId: val.branchId,
        subjectIds: selectedSubs,
        teacherUserId: mappings.length > 0 ? (mappings[0].teacherUserId || undefined) : undefined,
        defaultFee: val.defaultFee,
        startTime: val.startTime || undefined,
        endTime: val.endTime || undefined,
        startDate: val.startDate || undefined,
        endDate: val.endDate || undefined,
        capacity: val.capacity,
        roomNumber: val.roomNumber || undefined,
        batchStatus: val.batchStatus,
        subjectTeacherMappings: mappings
      };

      if (this.editingId) {
        this.batchFacade.updateBatch(this.editingId, req).subscribe({
          next: () => {
            this.snackBar.open('Batch updated successfully!', 'Dismiss', { duration: 3000 });
            this.toggleForm();
          },
          error: (err) => console.error('Failed to update batch:', err)
        });
      } else {
        this.batchFacade.createBatch(req).subscribe({
          next: () => {
            this.snackBar.open('Batch created successfully!', 'Dismiss', { duration: 3000 });
            this.toggleForm();
          },
          error: (err) => console.error('Failed to create batch:', err)
        });
      }
    }
  }

  formatDateForInput(dateStr: any): string {
    if (!dateStr) return '';
    if (typeof dateStr === 'string') {
      return dateStr.substring(0, 10);
    }
    return '';
  }

  formatTimeForInput(timeStr: any): string {
    if (!timeStr) return '';
    if (typeof timeStr === 'string') {
      return timeStr.substring(0, 5); // HH:mm
    }
    return '';
  }

  onActionClicked(event: any) {
    if (event.action === 'edit') {
      this.editingId = event.row.id;
      this.subjectTeacherMap = {};
      if (event.row.subjectTeacherMappings && Array.isArray(event.row.subjectTeacherMappings)) {
        event.row.subjectTeacherMappings.forEach((m: any) => {
          this.subjectTeacherMap[m.subjectId] = m.teacherUserId;
        });
      }

      this.batchForm.patchValue({
        batchCode: event.row.batchCode,
        name: event.row.name,
        courseId: event.row.courseId,
        branchId: event.row.branchId,
        subjectIds: event.row.subjectIds && event.row.subjectIds.length ? event.row.subjectIds : (event.row.subjectId ? [event.row.subjectId] : []),
        teacherUserId: event.row.teacherUserId,
        defaultFee: event.row.defaultFee ?? 0,
        startTime: this.formatTimeForInput(event.row.startTime),
        endTime: this.formatTimeForInput(event.row.endTime),
        startDate: this.formatDateForInput(event.row.startDate),
        endDate: this.formatDateForInput(event.row.endDate),
        capacity: event.row.capacity ?? 40,
        roomNumber: event.row.roomNumber,
        batchStatus: event.row.batchStatus ?? 'Upcoming'
      });
      this.showAddForm = true;
    } else if (event.action === 'delete') {
      if (confirm('Are you sure you want to delete batch: ' + event.row.name + '?')) {
        this.batchFacade.deleteBatch(event.row.id).subscribe({
          next: () => {
            this.snackBar.open('Batch deleted successfully!', 'Dismiss', { duration: 3000 });
          },
          error: (err) => console.error('Failed to delete batch:', err)
        });
      }
    }
  }
}
