import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { CourseFacade } from '../../../core/facades/course.facade';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateCourseRequest } from '../../../core/models/api-schemas';

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
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-courses.component.html',
  styleUrl: './admin-courses.component.scss'
})
export class AdminCoursesComponent implements OnInit {
  private courseFacade = inject(CourseFacade);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  courses$ = this.courseFacade.courses$;
  isLoading$ = this.courseFacade.isLoading$;
  showAddForm = false;
  editingId: string | null = null;
  courseForm!: FormGroup;

  subjectsList: string[] = [];

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
  }

  initForm() {
    this.courseForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      courseCode: ['', [Validators.required]],
      courseCategory: ['', [Validators.required]],
      courseType: ['Offline', [Validators.required]],
      durationValue: [1, [Validators.required, Validators.min(1)]],
      durationType: ['Months', [Validators.required]],
      isActive: [true]
    });
  }

  toggleForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.editingId = null;
      this.subjectsList = [];
      this.courseForm.reset({
        courseType: 'Offline',
        durationValue: 1,
        durationType: 'Months',
        isActive: true
      });
    }
  }

  addSubject(val: string) {
    const trimmed = val.trim();
    if (trimmed && !this.subjectsList.includes(trimmed)) {
      this.subjectsList.push(trimmed);
    }
  }

  removeSubject(index: number) {
    this.subjectsList.splice(index, 1);
  }

  onSubmit() {
    if (this.courseForm.valid) {
      const val = this.courseForm.value;
      const payload = {
        name: val.name,
        description: val.description,
        courseCode: val.courseCode,
        courseCategory: val.courseCategory,
        courseType: val.courseType,
        durationValue: Number(val.durationValue),
        durationType: val.durationType,
        subjectNames: this.subjectsList
      };
      if (this.editingId) {
        this.courseFacade.updateCourse(this.editingId, { 
          ...payload,
          isActive: val.isActive
        }).subscribe({
          next: () => {
            this.snackBar.open('Course updated successfully!', 'Dismiss', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: ['success-snackbar'] });
            this.toggleForm();
          },
          error: (err) => console.error('Failed to update course:', err)
        });
      } else {
        const req: CreateCourseRequest = payload;
        this.courseFacade.createCourse(req).subscribe({
          next: () => {
            this.snackBar.open('Course created successfully!', 'Dismiss', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: ['success-snackbar'] });
            this.toggleForm();
          },
          error: (err) => console.error('Failed to create course:', err)
        });
      }
    }
  }

  onActionClicked(event: any) {
    if (event.action === 'edit') {
      this.editingId = event.row.id;
      this.courseForm.patchValue({
        name: event.row.name,
        description: event.row.description,
        courseCode: event.row.courseCode,
        courseCategory: event.row.courseCategory,
        courseType: event.row.courseType,
        durationValue: event.row.durationValue,
        durationType: event.row.durationType,
        isActive: event.row.isActive
      });
      this.subjectsList = event.row.subjects ? event.row.subjects.map((s: any) => s.name) : [];
      this.showAddForm = true;
    } else if (event.action === 'delete') {
      if (confirm('Are you sure you want to delete course: ' + event.row.name + '?')) {
        this.courseFacade.deleteCourse(event.row.id).subscribe({
          next: () => {
            this.snackBar.open('Course deleted successfully!', 'Dismiss', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: ['success-snackbar'] });
          },
          error: (err) => console.error('Failed to delete course:', err)
        });
      }
    }
  }
}
