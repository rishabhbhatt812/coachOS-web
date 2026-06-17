import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StudentFacade } from '../../../core/facades/student.facade';

@Component({
  selector: 'app-my-course',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './my-course.component.html',
  styleUrl: './my-course.component.scss'
})
export class MyCourseComponent implements OnInit {
  private studentFacade = inject(StudentFacade);

  courses$ = this.studentFacade.courses$;
  isLoading$ = this.studentFacade.isLoading$;

  ngOnInit() {
    this.studentFacade.loadCourses();
  }
}
