import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teacher-attendance',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatSelectModule, 
    MatDatepickerModule, 
    MatNativeDateModule, 
    MatButtonModule, 
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './teacher-attendance.html',
  styleUrl: './teacher-attendance.scss',
})
export class TeacherAttendance {
  batches = [
    { id: '1', name: 'Class 10 - Mathematics (Morning)' },
    { id: '2', name: 'Class 12 - Physics Crash Course' },
    { id: '3', name: 'Foundation Batch - Science' }
  ];

  selectedBatchId: string | null = null;
  selectedDate: Date = new Date();
  
  displayedColumns: string[] = ['present', 'rollNo', 'name', 'remarks'];
  students = [
    { id: 's1', rollNo: '101', name: 'Alice Smith', isPresent: true, remarks: '' },
    { id: 's2', rollNo: '102', name: 'Bob Johnson', isPresent: true, remarks: '' },
    { id: 's3', rollNo: '103', name: 'Charlie Brown', isPresent: false, remarks: 'Sick leave' },
    { id: 's4', rollNo: '104', name: 'Diana Prince', isPresent: true, remarks: '' },
    { id: 's5', rollNo: '105', name: 'Evan Davis', isPresent: true, remarks: '' }
  ];

  isLoaded = false;

  loadStudents() {
    if (this.selectedBatchId && this.selectedDate) {
      // Mock API call
      this.isLoaded = true;
    }
  }

  markAllPresent() {
    this.students.forEach(s => s.isPresent = true);
  }

  saveAttendance() {
    console.log('Saving attendance...', this.students);
    alert('Attendance saved successfully!');
  }
}
