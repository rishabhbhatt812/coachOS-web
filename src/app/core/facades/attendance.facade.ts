import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { AttendanceService, AttendanceSession } from '../services/attendance.service';
import { CreateAttendanceSessionRequest } from '../models/api-schemas';

@Injectable({ providedIn: 'root' })
export class AttendanceFacade {
  private attendanceService = inject(AttendanceService);

  private sessionsSubject = new BehaviorSubject<AttendanceSession[]>([]);
  public sessions$ = this.sessionsSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  loadSessions(): void {
    this.isLoadingSubject.next(true);
    this.attendanceService.getSessions().pipe(
      tap(sessions => this.sessionsSubject.next(sessions)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  createSession(data: CreateAttendanceSessionRequest): Observable<AttendanceSession> {
    this.isLoadingSubject.next(true);
    return this.attendanceService.createSession(data).pipe(
      tap(() => this.loadSessions()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteSession(id: string): Observable<void> {
    this.isLoadingSubject.next(true);
    return this.attendanceService.deleteSession(id).pipe(
      tap(() => this.loadSessions()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
