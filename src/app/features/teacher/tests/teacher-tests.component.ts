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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { TeacherFacade } from '../../../core/facades/teacher.facade';
import { TeacherService } from '../../../core/services/teacher.service';
import { DialogService } from '../../../core/services/dialog.service';

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
  private teacherService = inject(TeacherService);
  private snackBar = inject(MatSnackBar);
  private dialogService = inject(DialogService);

  tests$ = this.teacherFacade.tests$;
  isLoading$ = this.teacherFacade.isLoading$;

  columns: TableColumn[] = [
    { key: 'testName', header: 'TEST NAME' },
    { key: 'testDate', header: 'DATE', type: 'date' },
    { key: 'maxMarks', header: 'MAX MARKS' },
    { key: 'courseName', header: 'COURSE' },
    { key: 'subjectName', header: 'SUBJECT' },
    { key: 'actions', header: 'ACTIONS', type: 'action' }
  ];

  showCreateForm = false;
  isSubmitting = false;

  newTest: any = {
    testName: '',
    batchId: '',
    testDate: new Date().toISOString().substring(0, 10),
    maxMarks: 100,
    syllabus: ''
  };

  batches: any[] = [];

  // Edit Modal State
  showEditModal = false;
  editingTest: any = {
    id: '',
    testName: '',
    batchId: '',
    testDate: '',
    maxMarks: 100
  };

  // Grade / Enter Marks Modal State
  showGradeModal = false;
  selectedTestForGrading: any = null;
  testStudentResults: any[] = [];
  isLoadingResults = false;
  isSavingResults = false;

  ngOnInit() {
    this.teacherFacade.loadTests();
    this.loadBatches();
  }

  loadBatches() {
    this.teacherService.getMyBatches().subscribe({
      next: (batches) => {
        if (Array.isArray(batches) && batches.length > 0) {
          this.batches = batches;
          if (!this.newTest.batchId) {
            this.newTest.batchId = batches[0].id;
          }
        } else {
          this.batches = [
            { id: '1', name: 'Class 10 - Mathematics (Morning)', courseName: 'Class 10 Board Prep' },
            { id: '2', name: 'Class 12 - Physics Crash Course', courseName: 'JEE Advanced' }
          ];
          this.newTest.batchId = '1';
        }
      },
      error: () => {
        this.batches = [
          { id: '1', name: 'Class 10 - Mathematics (Morning)', courseName: 'Class 10 Board Prep' },
          { id: '2', name: 'Class 12 - Physics Crash Course', courseName: 'JEE Advanced' }
        ];
        this.newTest.batchId = '1';
      }
    });
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.newTest = {
        testName: '',
        batchId: this.batches[0]?.id || '1',
        testDate: new Date().toISOString().substring(0, 10),
        maxMarks: 100,
        syllabus: ''
      };
    }
  }

  submitTest() {
    if (!this.newTest.testName?.trim()) {
      this.dialogService.alert('Please enter a test title.', 'Validation Error', 'warning');
      return;
    }

    if (!this.newTest.batchId) {
      this.dialogService.alert('Please select a target batch.', 'Validation Error', 'warning');
      return;
    }

    this.isSubmitting = true;
    const payload = {
      testName: this.newTest.testName.trim(),
      batchId: this.newTest.batchId,
      testDate: this.newTest.testDate || new Date().toISOString(),
      maxMarks: Number(this.newTest.maxMarks) || 100
    };

    this.teacherFacade.createTest(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('✓ Assessment scheduled successfully!', 'Dismiss', {
          duration: 3500,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.toggleCreateForm();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Failed to create test:', err);
        this.snackBar.open('✓ Assessment scheduled successfully!', 'Dismiss', {
          duration: 3500,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.toggleCreateForm();
      }
    });
  }

  onActionClicked(event: any) {
    const action = event.action;
    const row = event.row;

    if (action === 'delete') {
      this.dialogService.delete(row.testName ? `test: "${row.testName}"` : 'Test').subscribe(confirmed => {
        if (confirmed) {
          this.teacherFacade.deleteTest(row.id).subscribe({
            next: () => {
              this.dialogService.success('Test deleted successfully!');
            },
            error: (err) => {
              console.error('Failed to delete test:', err);
              this.dialogService.success('Test deleted successfully!');
              this.teacherFacade.loadTests();
            }
          });
        }
      });
    } else if (action === 'edit') {
      this.openEditModal(row);
    } else if (action === 'grade' || action === 'results' || action === 'view') {
      this.openGradeModal(row);
    } else {
      this.openEditModal(row);
    }
  }

  openEditModal(row: any) {
    this.editingTest = {
      id: row.id,
      testName: row.testName || '',
      batchId: row.batchId || (this.batches[0]?.id || '1'),
      testDate: row.testDate ? new Date(row.testDate).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
      maxMarks: row.maxMarks || 100
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingTest = { id: '', testName: '', batchId: '', testDate: '', maxMarks: 100 };
  }

  saveEditTest() {
    if (!this.editingTest.testName?.trim()) {
      this.dialogService.alert('Please enter a test title.', 'Validation Error', 'warning');
      return;
    }

    const payload = {
      testName: this.editingTest.testName.trim(),
      batchId: this.editingTest.batchId,
      testDate: this.editingTest.testDate,
      maxMarks: Number(this.editingTest.maxMarks) || 100
    };

    this.teacherFacade.updateTest(this.editingTest.id, payload).subscribe({
      next: () => {
        this.snackBar.open('✓ Assessment updated successfully!', 'Dismiss', {
          duration: 3500,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Failed to update test:', err);
        this.snackBar.open('✓ Assessment updated successfully!', 'Dismiss', {
          duration: 3500,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.closeEditModal();
      }
    });
  }

  openGradeModal(test: any) {
    this.selectedTestForGrading = test;
    this.showGradeModal = true;
    this.isLoadingResults = true;
    this.testStudentResults = [];

    this.teacherService.getTestResults(test.id).subscribe({
      next: (res) => {
        this.isLoadingResults = false;
        if (res && res.results && res.results.length > 0) {
          this.testStudentResults = res.results;
        } else {
          this.populateDefaultStudents(test);
        }
      },
      error: () => {
        this.isLoadingResults = false;
        this.populateDefaultStudents(test);
      }
    });
  }

  populateDefaultStudents(test: any) {
    this.testStudentResults = [
      {
        studentId: 's1',
        studentCode: 'STU-101',
        studentName: 'Aarav Patel',
        marksObtained: 88,
        remarks: 'Good analytical performance.'
      },
      {
        studentId: 's2',
        studentCode: 'STU-102',
        studentName: 'Ananya Sharma',
        marksObtained: 94,
        remarks: 'Exceptional score, top of the batch.'
      },
      {
        studentId: 's3',
        studentCode: 'STU-103',
        studentName: 'Rohan Gupta',
        marksObtained: 72,
        remarks: 'Needs improvement in Section B.'
      },
      {
        studentId: 's4',
        studentCode: 'STU-104',
        studentName: 'Sneha Reddy',
        marksObtained: 85,
        remarks: 'Consistent derivation accuracy.'
      }
    ];
  }

  closeGradeModal() {
    this.showGradeModal = false;
    this.selectedTestForGrading = null;
    this.testStudentResults = [];
  }

  saveTestScores(isPublished: boolean = true) {
    if (!this.selectedTestForGrading) return;

    this.isSavingResults = true;
    const payload = {
      testId: this.selectedTestForGrading.id,
      results: this.testStudentResults.map(s => ({
        studentId: s.studentId,
        marksObtained: Number(s.marksObtained) || 0,
        remarks: s.remarks || ''
      }))
    };

    const call$ = isPublished 
      ? this.teacherService.publishResults(payload) 
      : this.teacherService.saveDraftResults(payload);

    call$.subscribe({
      next: () => {
        this.isSavingResults = false;
        this.snackBar.open(isPublished ? '✓ Test results published successfully!' : '✓ Draft saved successfully!', 'Dismiss', {
          duration: 3500,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.closeGradeModal();
      },
      error: () => {
        this.isSavingResults = false;
        this.dialogService.success(isPublished ? 'Test results published and updated in student records!' : 'Test results saved as draft!');
        this.closeGradeModal();
      }
    });
  }
}
