import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  stats = [
    { label: "Today's Classes", value: '4', icon: 'class', color: 'blue' },
    { label: 'Assigned Batches', value: '3', icon: 'group', color: 'green' },
    { label: 'Pending Attendance', value: '1', icon: 'how_to_reg', color: 'orange' },
    { label: 'Upcoming Tests', value: '2', icon: 'assignment', color: 'purple' }
  ];

  recentActivities = [
    { title: 'Uploaded Math Chapter 1 Notes', time: '2 hours ago', icon: 'upload_file' },
    { title: 'Marked attendance for Class 10A', time: '5 hours ago', icon: 'check_circle' },
    { title: 'Published Physics Test Results', time: '1 day ago', icon: 'assessment' }
  ];
}
