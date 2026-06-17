import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { NoticeService, Notice } from '../services/notice.service';
import { CreateNoticeRequest } from '../models/api-schemas';

@Injectable({ providedIn: 'root' })
export class NoticeFacade {
  private noticeService = inject(NoticeService);

  private noticesSubject = new BehaviorSubject<Notice[]>([]);
  public notices$ = this.noticesSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  loadNotices(): void {
    this.isLoadingSubject.next(true);
    this.noticeService.getNotices().pipe(
      tap(notices => this.noticesSubject.next(notices)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  createNotice(data: CreateNoticeRequest): Observable<Notice> {
    this.isLoadingSubject.next(true);
    return this.noticeService.createNotice(data).pipe(
      tap(() => this.loadNotices()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteNotice(id: string): Observable<void> {
    this.isLoadingSubject.next(true);
    return this.noticeService.deleteNotice(id).pipe(
      tap(() => this.loadNotices()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
