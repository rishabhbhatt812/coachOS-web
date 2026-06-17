import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { StudentService, StudentDashboardData } from '../services/student.service';

@Injectable({ providedIn: 'root' })
export class StudentFacade {
  private studentService = inject(StudentService);

  private dashboardDataSubject = new BehaviorSubject<StudentDashboardData | null>(null);
  public dashboardData$ = this.dashboardDataSubject.asObservable();

  private coursesSubject = new BehaviorSubject<any[]>([]);
  public courses$ = this.coursesSubject.asObservable();

  private feesSubject = new BehaviorSubject<any[]>([]);
  public fees$ = this.feesSubject.asObservable();

  private notesSubject = new BehaviorSubject<any[]>([]);
  public notes$ = this.notesSubject.asObservable();

  private attendanceSubject = new BehaviorSubject<any[]>([]);
  public attendance$ = this.attendanceSubject.asObservable();

  private resultsSubject = new BehaviorSubject<any[]>([]);
  public results$ = this.resultsSubject.asObservable();

  private vacanciesSubject = new BehaviorSubject<any[]>([]);
  public vacancies$ = this.vacanciesSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  loadDashboard(): void {
    this.isLoadingSubject.next(true);
    this.studentService.getDashboardData().pipe(
      tap(data => this.dashboardDataSubject.next(data)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  loadCourses(): void {
    this.isLoadingSubject.next(true);
    this.studentService.getCourses().pipe(
      tap(courses => this.coursesSubject.next(courses)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  loadFees(): void {
    this.isLoadingSubject.next(true);
    this.studentService.getFees().pipe(
      tap(fees => this.feesSubject.next(fees)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  loadNotes(): void {
    this.isLoadingSubject.next(true);
    this.studentService.getNotes().pipe(
      tap(notes => this.notesSubject.next(notes)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  loadAttendance(): void {
    this.isLoadingSubject.next(true);
    this.studentService.getAttendance().pipe(
      tap(attendance => this.attendanceSubject.next(attendance)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  loadResults(): void {
    this.isLoadingSubject.next(true);
    this.studentService.getResults().pipe(
      tap(results => this.resultsSubject.next(results)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  loadVacancies(): void {
    this.isLoadingSubject.next(true);
    this.studentService.getVacancies().pipe(
      tap(vacancies => this.vacanciesSubject.next(vacancies)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }
}
