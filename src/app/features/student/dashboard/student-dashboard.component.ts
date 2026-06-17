import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { StudentFacade } from '../../../core/facades/student.facade';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, PageHeaderComponent, StatusBadgeComponent, MatButtonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss'
})
export class StudentDashboardComponent implements OnInit {
  private studentFacade = inject(StudentFacade);

  data$ = this.studentFacade.dashboardData$;
  isLoading$ = this.studentFacade.isLoading$;

  ngOnInit() {
    this.studentFacade.loadDashboard();
  }
}
