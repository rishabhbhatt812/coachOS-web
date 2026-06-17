import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StudentFacade } from '../../../core/facades/student.facade';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-my-results',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './my-results.component.html',
  styleUrl: './my-results.component.scss'
})
export class MyResultsComponent implements OnInit {
  private studentFacade = inject(StudentFacade);

  results$ = this.studentFacade.results$;
  isLoading$ = this.studentFacade.isLoading$;

  testsCount$ = this.results$.pipe(map(r => r.length));
  averagePercent$ = this.results$.pipe(map(r => {
    if (r.length === 0) return 0;
    const totalPct = r.reduce((acc, curr) => acc + (curr.marksObtained / curr.maxMarks) * 100, 0);
    return Math.round(totalPct / r.length);
  }));
  highestPercent$ = this.results$.pipe(map(r => {
    if (r.length === 0) return 0;
    const percentages = r.map(x => (x.marksObtained / x.maxMarks) * 100);
    return Math.round(Math.max(...percentages));
  }));

  ngOnInit() {
    this.studentFacade.loadResults();
  }

  getGrade(marks: number, max: number): string {
    const pct = (marks / max) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  }

  getGradeClass(grade: string): string {
    return grade === 'F' ? 'fail' : 'pass';
  }
}
