import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StudentFacade } from '../../../core/facades/student.facade';

@Component({
  selector: 'app-vacancies',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './vacancies.component.html',
  styleUrl: './vacancies.component.scss'
})
export class VacanciesComponent implements OnInit {
  private studentFacade = inject(StudentFacade);

  vacancies$ = this.studentFacade.vacancies$;
  isLoading$ = this.studentFacade.isLoading$;

  ngOnInit() {
    this.studentFacade.loadVacancies();
  }

  applyVacancy(link: string) {
    if (!link) return;
    window.open(link, '_blank');
  }
}
