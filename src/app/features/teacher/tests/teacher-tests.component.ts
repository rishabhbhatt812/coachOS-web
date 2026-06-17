import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { TeacherFacade } from '../../../core/facades/teacher.facade';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-teacher-tests',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    DataTableComponent, 
    MatSnackBarModule
  ],
  templateUrl: './teacher-tests.component.html',
  styleUrl: './teacher-tests.component.scss'
})
export class TeacherTestsComponent implements OnInit {
  private teacherFacade = inject(TeacherFacade);
  private snackBar = inject(MatSnackBar);

  tests$ = this.teacherFacade.tests$;
  isLoading$ = this.teacherFacade.isLoading$;

  columns: TableColumn[] = [
    { key: 'testName', header: 'Test Name' },
    { key: 'testDate', header: 'Date', type: 'date' },
    { key: 'maxMarks', header: 'Max Marks' },
    { key: 'courseName', header: 'Course' },
    { key: 'subjectName', header: 'Subject' },
    { key: 'actions', header: 'Actions', type: 'action' }
  ];

  showCreateForm = false;
  newTest: any = {};
  batches = [
    { id: '1', name: 'Class 10 - Mathematics (Morning)' },
    { id: '2', name: 'Class 12 - Physics Crash Course' }
  ];

  ngOnInit() {
    this.teacherFacade.loadTests();
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.newTest = {};
    }
  }

  submitTest() {
    console.log('Test Details:', this.newTest);
    this.snackBar.open('Test scheduled successfully!', 'Dismiss', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
    this.toggleCreateForm();
  }

  onActionClicked(event: any) {
    if (event.action === 'delete') {
      if (confirm('Are you sure you want to delete test: ' + event.row.testName + '?')) {
        this.teacherFacade.deleteTest(event.row.id).subscribe({
          next: () => {
            this.snackBar.open('Test deleted successfully!', 'Dismiss', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Failed to delete test:', err);
          }
        });
      }
    } else {
      this.snackBar.open(`Action "${event.action}" clicked for ${event.row.testName}`, 'Dismiss', {
        duration: 2500,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }
}
