import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { DialogService } from '../../../../core/services/dialog.service';

@Component({
  selector: 'app-teacher-results',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './teacher-results.html',
  styleUrl: './teacher-results.scss',
})
export class TeacherResults {
  private dialogService = inject(DialogService);

  tests = [
    { id: '1', name: 'Math Weekly Test 1', batch: 'Class 10A', maxMarks: 50 },
    { id: '2', name: 'Physics Unit Test', batch: 'Class 12B', maxMarks: 100 }
  ];

  selectedTestId: string | null = null;
  selectedTestDetails: any = null;
  isLoaded = false;
  
  displayedColumns: string[] = ['rollNo', 'name', 'marks', 'remarks'];
  students = [
    { id: 's1', rollNo: '101', name: 'Alice Smith', marks: null, remarks: '' },
    { id: 's2', rollNo: '102', name: 'Bob Johnson', marks: null, remarks: '' },
    { id: 's3', rollNo: '103', name: 'Charlie Brown', marks: null, remarks: '' }
  ];

  loadStudents() {
    if (this.selectedTestId) {
      this.selectedTestDetails = this.tests.find(t => t.id === this.selectedTestId);
      this.isLoaded = true;
    }
  }

  saveDraft() {
    this.dialogService.success('Draft marks saved successfully!');
  }

  publishResults() {
    this.dialogService.confirm({
      title: 'Publish Results',
      message: 'Are you sure you want to publish these test results? Students and parents will be notified.',
      type: 'info',
      confirmText: 'Yes, Publish'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.dialogService.success('Results published successfully!');
        this.isLoaded = false;
        this.selectedTestId = null;
      }
    });
  }
}
