import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

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
  tests = [
    { id: '1', name: 'Mid-Term Physics Exam', batch: 'Class 12 - Physics', maxMarks: 100 },
    { id: '2', name: 'Weekly Math Quiz', batch: 'Class 10 - Mathematics', maxMarks: 50 }
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
    console.log('Saving draft...', this.students);
    alert('Draft saved successfully!');
  }

  publishResults() {
    if(confirm('Are you sure you want to publish these results? Students will be notified.')) {
      console.log('Publishing results...', this.students);
      alert('Results published successfully!');
      this.isLoaded = false;
      this.selectedTestId = null;
    }
  }
}
