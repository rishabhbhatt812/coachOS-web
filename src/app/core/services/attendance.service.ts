import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CreateAttendanceSessionRequest } from '../models/api-schemas';

export interface AttendanceSession {
  id: string;
  batchName: string;
  attendanceDate: string;
  takenByName: string;
  totalStudents: number;
  presentCount: number;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);

  getSessions(): Observable<AttendanceSession[]> {
    return this.http.get<AttendanceSession[]>(API_ENDPOINTS.ADMIN.ATTENDANCE);
  }

  createSession(data: CreateAttendanceSessionRequest): Observable<AttendanceSession> {
    return this.http.post<AttendanceSession>(API_ENDPOINTS.ADMIN.ATTENDANCE, data);
  }

  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.ADMIN.ATTENDANCE + '/' + id);
  }
}
