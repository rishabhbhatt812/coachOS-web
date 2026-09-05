import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { CourseFacade } from '../../../core/facades/course.facade';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateCourseRequest, UpdateCourseRequest } from '../../../core/models/api-schemas';
import { DialogService } from '../../../core/services/dialog.service';
import { MatSelectModule } from '@angular/material/select';
import { environment } from '../../../core/constants/api-endpoints';

@Component({
  selector: 'app-admin-courses',
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
  templateUrl: './admin-courses.component.html',
  styleUrl: './admin-courses.component.scss'
})
export class AdminCoursesComponent implements OnInit {
  private courseFacade = inject(CourseFacade);
  private authFacade = inject(AuthFacade);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialogService = inject(DialogService);

  courses$ = this.courseFacade.courses$;
  isLoading$ = this.courseFacade.isLoading$;
  showAddForm = false;
  editingId: string | null = null;
  courseForm!: FormGroup;

  subjectsList: string[] = [];

  isGlobalAdmin = false;
  institutes: any[] = [];
  selectedInstituteFilter = 'all';

  columns: TableColumn[] = [
    { key: 'courseCode', header: 'Code' },
    { key: 'name', header: 'Course Name' },
    { key: 'courseCategory', header: 'Category' },
    { key: 'courseType', header: 'Type' },
    { key: 'description', header: 'Description' },
    { key: 'isActive', header: 'Status', type: 'badge', badgeColorMap: { 'true': 'green', 'false': 'red', 'Active': 'green', 'Inactive': 'red' } },
    { key: 'actions', header: 'Actions', type: 'action' }
  ];

  ngOnInit() {
    this.courseFacade.loadCourses();
    this.initForm();

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

  getFilteredCourses(courses: any[] | null): any[] {
    if (!courses) return [];
    if (!this.isGlobalAdmin || this.selectedInstituteFilter === 'all') {
      return courses;
    }
    return courses.filter(c => c.instituteId === this.selectedInstituteFilter);
  }

  initForm() {
    this.courseForm = this.fb.group({
      instituteId: [''],
      name: ['', [Validators.required]],
      description: [''],
      courseCode: ['', [Validators.required]],
      courseCategory: ['Standard', [Validators.required]],
      courseType: ['Classroom', [Validators.required]],
      durationValue: [1, [Validators.required, Validators.min(1)]],
      durationType: ['Months', [Validators.required]],
      subjectInput: ['']
    });
    this.subjectsList = [];
  }

  addSubject() {
    const sub = this.courseForm.get('subjectInput')?.value?.trim();
    if (sub && !this.subjectsList.includes(sub)) {
      this.subjectsList.push(sub);
      this.courseForm.get('subjectInput')?.reset();
    }
  }

  removeSubject(index: number) {
    this.subjectsList.splice(index, 1);
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
    if (this.courseForm.valid) {
      const val = this.courseForm.value;
      if (this.editingId) {
        const req: UpdateCourseRequest = {
          name: val.name,
          description: val.description,
          courseCode: val.courseCode,
          courseCategory: val.courseCategory,
          courseType: val.courseType,
          durationValue: val.durationValue,
          durationType: val.durationType,
          subjectNames: this.subjectsList,
          isActive: true
        };
        this.courseFacade.updateCourse(this.editingId, req).subscribe({
          next: () => {
            this.snackBar.open('Course updated successfully!', 'Dismiss', { duration: 3000 });
            this.cancelEdit();
          },
          error: (err) => console.error('Failed to update course:', err)
        });
      } else {
        const req: any = {
          instituteId: val.instituteId || undefined,
          name: val.name,
          description: val.description,
          courseCode: val.courseCode,
          courseCategory: val.courseCategory,
          courseType: val.courseType,
          durationValue: val.durationValue,
          durationType: val.durationType,
          subjectNames: this.subjectsList
        };
        this.courseFacade.createCourse(req).subscribe({
          next: () => {
            this.snackBar.open('Course created successfully!', 'Dismiss', { duration: 3000 });
            this.cancelEdit();
          },
          error: (err) => console.error('Failed to create course:', err)
        });
      }
    }
  }

  onActionClicked(event: any) {
    if (event.action === 'edit') {
      this.editingId = event.row.id;
      this.subjectsList = event.row.subjects ? event.row.subjects.map((s: any) => s.name) : [];
      this.courseForm.patchValue({
        name: event.row.name,
        description: event.row.description,
        courseCode: event.row.courseCode,
        courseCategory: event.row.courseCategory,
        courseType: event.row.courseType,
        durationValue: event.row.durationValue,
        durationType: event.row.durationType
      });
      this.showAddForm = true;
    } else if (event.action === 'delete') {
      this.dialogService.delete(event.row.name ? `course: ${event.row.name}` : 'Course').subscribe(confirmed => {
        if (confirmed) {
          this.courseFacade.deleteCourse(event.row.id).subscribe({
            next: () => {
              this.dialogService.success('Course deleted successfully!');
            },
            error: (err) => {
              console.error('Failed to delete course:', err);
              this.dialogService.error('Failed to delete course.');
            }
          });
        }
      });
    }
  }
}
