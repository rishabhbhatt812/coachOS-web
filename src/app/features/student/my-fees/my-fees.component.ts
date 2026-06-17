import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StudentFacade } from '../../../core/facades/student.facade';

@Component({
  selector: 'app-my-fees',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './my-fees.component.html',
  styleUrl: './my-fees.component.scss'
})
export class MyFeesComponent implements OnInit {
  private studentFacade = inject(StudentFacade);

  fees$ = this.studentFacade.fees$;
  isLoading$ = this.studentFacade.isLoading$;

  ngOnInit() {
    this.studentFacade.loadFees();
  }

  getDueDateClass(status: string): string {
    const s = status ? status.toLowerCase() : '';
    if (s.includes('paid')) return 'paid';
    if (s.includes('overdue')) return 'overdue';
    return 'due';
  }
}
