import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { CourseService, Course } from '../services/course.service';
import { CreateCourseRequest, UpdateCourseRequest } from '../models/api-schemas';

@Injectable({ providedIn: 'root' })
export class CourseFacade {
  private courseService = inject(CourseService);

  private coursesSubject = new BehaviorSubject<Course[]>([]);
  public courses$ = this.coursesSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  loadCourses(): void {
    this.isLoadingSubject.next(true);
    this.courseService.getCourses().pipe(
      tap(courses => this.coursesSubject.next(courses)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  createCourse(data: CreateCourseRequest): Observable<Course> {
    this.isLoadingSubject.next(true);
    return this.courseService.createCourse(data).pipe(
      tap(() => this.loadCourses()), // Refresh list
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateCourse(id: string, data: UpdateCourseRequest): Observable<Course> {
    this.isLoadingSubject.next(true);
    return this.courseService.updateCourse(id, data).pipe(
      tap(() => this.loadCourses()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteCourse(id: string): Observable<void> {
    this.isLoadingSubject.next(true);
    return this.courseService.deleteCourse(id).pipe(
      tap(() => this.loadCourses()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
