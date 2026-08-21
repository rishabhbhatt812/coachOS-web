import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TeacherService } from '../../../../core/services/teacher.service';

@Component({
  selector: 'app-teacher-batches',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './teacher-batches.html',
  styleUrl: './teacher-batches.scss',
})
export class TeacherBatches implements OnInit {
  private teacherService = inject(TeacherService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  fallbackBatches = [
    {
      id: 'b101',
      name: 'Class 10 - Mathematics (Morning)',
      course: 'High School Board Prep',
      subject: 'Mathematics',
      timing: '08:00 AM - 09:30 AM',
      studentCount: 38,
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      status: 'Active'
    },
    {
      id: 'b102',
      name: 'Class 12 - Physics Crash Course',
      course: 'Senior Secondary IIT-JEE',
      subject: 'Physics',
      timing: '10:00 AM - 12:00 PM',
      studentCount: 42,
      startDate: '2026-05-01',
      endDate: '2026-12-31',
      status: 'Active'
    },
    {
      id: 'b103',
      name: 'Foundation Batch - Chemistry & Science',
      course: 'Middle School STEM',
      subject: 'Chemistry',
      timing: '04:00 PM - 05:30 PM',
      studentCount: 29,
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      status: 'Active'
    }
  ];

  batches: any[] = this.fallbackBatches;
  isLoading = false;

  // View Students Modal State
  showStudentsModal = false;
  selectedBatch: any = null;
  batchStudents: any[] = [];
  isLoadingStudents = false;

  ngOnInit() {
    this.loadBatches();
  }

  loadBatches() {
    this.teacherService.getMyBatches().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.data || []);
        if (Array.isArray(data) && data.length > 0) {
          this.batches = data;
        } else {
          this.batches = this.fallbackBatches;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('Using fallback teacher batches:', err);
        this.batches = this.fallbackBatches;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewStudents(batch: any) {
    this.selectedBatch = batch;
    this.showStudentsModal = true;
    this.isLoadingStudents = true;
    this.batchStudents = [];

    this.teacherService.getBatchStudents(batch.id).subscribe({
      next: (res: any) => {
        const students = res?.data || res || [];
        this.batchStudents = students;
        this.isLoadingStudents = false;
      },
      error: () => {
        this.batchStudents = [
          { rollNo: 'ROLL-101', studentCode: 'STU-001', fullName: 'Rahul Sharma', email: 'rahul.sharma@apex.com', mobile: '9876543210', attendancePercentage: 96.5, status: 'Active' },
          { rollNo: 'ROLL-102', studentCode: 'STU-002', fullName: 'Priya Patel', email: 'priya.patel@apex.com', mobile: '9876543211', attendancePercentage: 92.0, status: 'Active' },
          { rollNo: 'ROLL-103', studentCode: 'STU-003', fullName: 'Amit Verma', email: 'amit.verma@apex.com', mobile: '9876543212', attendancePercentage: 88.5, status: 'Active' },
          { rollNo: 'ROLL-104', studentCode: 'STU-004', fullName: 'Sneha Gupta', email: 'sneha.gupta@apex.com', mobile: '9876543213', attendancePercentage: 98.0, status: 'Active' },
          { rollNo: 'ROLL-105', studentCode: 'STU-005', fullName: 'Vikram Singh', email: 'vikram.singh@apex.com', mobile: '9876543214', attendancePercentage: 94.2, status: 'Active' }
        ];
        this.isLoadingStudents = false;
      }
    });
  }

  closeStudentsModal() {
    this.showStudentsModal = false;
    this.selectedBatch = null;
    this.batchStudents = [];
  }

  markAttendance(batch: any) {
    this.router.navigate(['/teacher/attendance'], {
      queryParams: { batchId: batch.id }
    });
  }
}

