import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { StudentAdminService, AdminStudentInfo } from '../services/student-admin.service';
import { CreateStudentRequest, UpdateStudentRequest } from '../models/api-schemas';

@Injectable({ providedIn: 'root' })
export class StudentAdminFacade {
  private studentService = inject(StudentAdminService);

  private studentsSubject = new BehaviorSubject<AdminStudentInfo[]>([]);
  public students$ = this.studentsSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  loadStudents(): void {
    this.isLoadingSubject.next(true);
    this.studentService.getStudents().pipe(
      tap(students => this.studentsSubject.next(students)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  createStudent(data: CreateStudentRequest): Observable<AdminStudentInfo> {
    this.isLoadingSubject.next(true);
    return this.studentService.createStudent(data).pipe(
      tap(() => this.loadStudents()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateStudent(id: string, data: UpdateStudentRequest): Observable<AdminStudentInfo> {
    this.isLoadingSubject.next(true);
    return this.studentService.updateStudent(id, data).pipe(
      tap(() => this.loadStudents()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteStudent(id: string): Observable<void> {
    this.isLoadingSubject.next(true);
    return this.studentService.deleteStudent(id).pipe(
      tap(() => this.loadStudents()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
