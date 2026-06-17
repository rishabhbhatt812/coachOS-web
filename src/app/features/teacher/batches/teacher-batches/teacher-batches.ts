import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-teacher-batches',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './teacher-batches.html',
  styleUrl: './teacher-batches.scss',
})
export class TeacherBatches {
  batches = [
    {
      id: '1',
      name: 'Class 10 - Mathematics (Morning)',
      course: 'High School',
      subject: 'Mathematics',
      timing: '08:00 AM - 09:30 AM',
      studentCount: 45,
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Class 12 - Physics Crash Course',
      course: 'Senior Secondary',
      subject: 'Physics',
      timing: '10:00 AM - 12:00 PM',
      studentCount: 30,
      startDate: '2025-10-01',
      endDate: '2026-01-31',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Foundation Batch - Science',
      course: 'Middle School',
      subject: 'General Science',
      timing: '04:00 PM - 05:30 PM',
      studentCount: 25,
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      status: 'Active'
    }
  ];
}
