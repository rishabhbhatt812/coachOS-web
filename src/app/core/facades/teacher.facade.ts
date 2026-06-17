import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { TeacherService, TeacherNote, TeacherTest } from '../services/teacher.service';

@Injectable({ providedIn: 'root' })
export class TeacherFacade {
  private teacherService = inject(TeacherService);

  private notesSubject = new BehaviorSubject<TeacherNote[]>([]);
  public notes$ = this.notesSubject.asObservable();

  private testsSubject = new BehaviorSubject<TeacherTest[]>([]);
  public tests$ = this.testsSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  loadNotes(): void {
    this.isLoadingSubject.next(true);
    this.teacherService.getNotes().pipe(
      tap(notes => this.notesSubject.next(notes)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  loadTests(): void {
    this.isLoadingSubject.next(true);
    this.teacherService.getTests().pipe(
      tap(tests => this.testsSubject.next(tests)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  uploadNote(formData: FormData): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.teacherService.createNote(formData).pipe(
      tap(() => this.loadNotes()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteNote(id: string): Observable<void> {
    this.isLoadingSubject.next(true);
    return this.teacherService.deleteNote(id).pipe(
      tap(() => this.loadNotes()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteTest(id: string): Observable<void> {
    this.isLoadingSubject.next(true);
    return this.teacherService.deleteTest(id).pipe(
      tap(() => this.loadTests()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
