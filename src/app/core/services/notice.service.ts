import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CreateNoticeRequest } from '../models/api-schemas';

export interface Notice {
  id: string;
  title: string;
  message: string;
  courseName: string;
  batchName: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NoticeService {
  private http = inject(HttpClient);

  getNotices(): Observable<Notice[]> {
    return this.http.get<Notice[]>(API_ENDPOINTS.ADMIN.NOTICES);
  }

  createNotice(data: CreateNoticeRequest): Observable<Notice> {
    return this.http.post<Notice>(API_ENDPOINTS.ADMIN.NOTICES, data);
  }

  deleteNotice(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.ADMIN.NOTICES + '/' + id);
  }
}
