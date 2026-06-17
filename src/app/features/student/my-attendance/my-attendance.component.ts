import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StudentFacade } from '../../../core/facades/student.facade';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-my-attendance',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './my-attendance.component.html',
  styleUrl: './my-attendance.component.scss'
})
export class MyAttendanceComponent implements OnInit {
  private studentFacade = inject(StudentFacade);

  records$ = this.studentFacade.attendance$;
  isLoading$ = this.studentFacade.isLoading$;

  totalClasses$ = this.records$.pipe(map(r => r.length));
  presentCount$ = this.records$.pipe(map(r => r.filter(x => x.status === 'Present').length));
  absentCount$ = this.records$.pipe(map(r => r.filter(x => x.status === 'Absent').length));
  percent$ = this.records$.pipe(map(r => {
    if (r.length === 0) return 100;
    const present = r.filter(x => x.status === 'Present').length;
    return Math.round((present / r.length) * 100);
  }));

  ngOnInit() {
    this.studentFacade.loadAttendance();
  }
}
