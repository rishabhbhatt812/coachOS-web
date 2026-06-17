import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload';

@Component({
  selector: 'app-teacher-assignments',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    FileUploadComponent
  ],
  templateUrl: './teacher-assignments.html',
  styleUrl: './teacher-assignments.scss',
})
export class TeacherAssignments {
  showCreateForm = false;

  assignments = [
    { title: 'Algebra Equations', batch: 'Class 10 - Mathematics', dueDate: '2025-04-15', submissions: 32, totalStudents: 45 },
    { title: 'Newton Laws Worksheet', batch: 'Class 12 - Physics', dueDate: '2025-04-18', submissions: 15, totalStudents: 30 }
  ];

  newAssignment: any = {};
  assignmentFile: File | null = null;

  batches = [
    { id: '1', name: 'Class 10 - Mathematics (Morning)' },
    { id: '2', name: 'Class 12 - Physics Crash Course' }
  ];

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.newAssignment = {};
      this.assignmentFile = null;
    }
  }

  onFileSelected(file: File | null) {
    this.assignmentFile = file;
  }

  submitAssignment() {
    console.log('Assignment Details:', this.newAssignment);
    console.log('Attached File:', this.assignmentFile);
    alert('Assignment created successfully!');
    this.toggleCreateForm();
  }
}
