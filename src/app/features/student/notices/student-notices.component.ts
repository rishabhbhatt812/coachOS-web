import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StudentFacade } from '../../../core/facades/student.facade';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-student-notices',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './student-notices.component.html',
  styleUrl: './student-notices.component.scss'
})
export class StudentNoticesComponent implements OnInit {
  private studentFacade = inject(StudentFacade);

  dashboardData$ = this.studentFacade.dashboardData$;
  notices$ = this.dashboardData$.pipe(map(data => data?.notices || []));
  isLoading$ = this.studentFacade.isLoading$;

  ngOnInit() {
    this.studentFacade.loadDashboard();
  }
}
