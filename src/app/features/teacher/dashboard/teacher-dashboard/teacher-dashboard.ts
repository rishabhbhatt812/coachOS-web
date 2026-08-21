import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './teacher-dashboard.html',
  styleUrl: './teacher-dashboard.scss',
})
export class TeacherDashboard {
  private router = inject(Router);

  stats = [
    { label: "Today's Classes", value: '4', icon: 'class', color: 'blue', route: '/teacher/my-batches' },
    { label: 'Assigned Batches', value: '3', icon: 'group', color: 'green', route: '/teacher/my-batches' },
    { label: 'Pending Attendance', value: '1', icon: 'how_to_reg', color: 'orange', route: '/teacher/attendance' },
    { label: 'Upcoming Tests', value: '2', icon: 'assignment', color: 'purple', route: '/teacher/tests' }
  ];

  todayClasses = [
    {
      id: 'c1',
      batchName: 'Class 10 - Mathematics (Morning)',
      subject: 'Mathematics',
      time: '08:00 AM - 09:30 AM',
      room: 'Room 204',
      status: 'Completed',
      batchId: 'b101'
    },
    {
      id: 'c2',
      batchName: 'Class 12 - Physics Crash Course',
      subject: 'Physics',
      time: '10:00 AM - 12:00 PM',
      room: 'Main Hall A',
      status: 'In Progress',
      batchId: 'b102'
    },
    {
      id: 'c3',
      batchName: 'Foundation Batch - Chemistry & Science',
      subject: 'Chemistry',
      time: '04:00 PM - 05:30 PM',
      room: 'Lab 3',
      status: 'Upcoming',
      batchId: 'b103'
    }
  ];

  recentActivities = [
    { title: 'Uploaded Math Chapter 1 Notes', time: '2 hours ago', icon: 'upload_file', route: '/teacher/notes' },
    { title: 'Marked attendance for Class 10A', time: '5 hours ago', icon: 'check_circle', route: '/teacher/attendance' },
    { title: 'Published Physics Test Results', time: '1 day ago', icon: 'assessment', route: '/teacher/results' }
  ];

  createAssignment() {
    this.router.navigate(['/teacher/assignments']);
  }

  navigateTo(route: string, queryParams?: any) {
    if (queryParams) {
      this.router.navigate([route], { queryParams });
    } else {
      this.router.navigate([route]);
    }
  }
}

