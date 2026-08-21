import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CreateAttendanceSessionRequest, CreateNoteRequest, CreateTestRequest } from '../models/api-schemas';

export interface TeacherNote {
  id: string;
  title: string;
  description: string;
  courseName: string;
  batchName: string;
  subjectName: string;
  createdAt: string;
}

export interface TeacherTest {
  id: string;
  testName: string;
  testDate: string;
  maxMarks: number;
  courseName: string;
  batchName: string;
  subjectName: string;
}

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private http = inject(HttpClient);

  // Batches
  getMyBatches(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.TEACHER.BATCHES);
  }

  getBatchStudents(batchId: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.TEACHER.BATCHES}/${batchId}/students`);
  }

  // Attendance
  getAttendanceSessions(): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.TEACHER.ATTENDANCE);
  }

  createAttendanceSession(data: any): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.TEACHER.ATTENDANCE, data);
  }

  deleteAttendanceSession(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.TEACHER.ATTENDANCE + '/' + id);
  }

  // Notes
  getNotes(): Observable<TeacherNote[]> {
    return this.http.get<TeacherNote[]>(API_ENDPOINTS.TEACHER.NOTES);
  }

  createNote(data: FormData): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.TEACHER.NOTES, data);
  }

  deleteNote(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.TEACHER.NOTES + '/' + id);
  }

  // Tests
  getTests(): Observable<TeacherTest[]> {
    return this.http.get<TeacherTest[]>(API_ENDPOINTS.TEACHER.TESTS);
  }

  createTest(data: CreateTestRequest): Observable<TeacherTest> {
    return this.http.post<TeacherTest>(API_ENDPOINTS.TEACHER.TESTS, data);
  }

  deleteTest(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.TEACHER.TESTS + '/' + id);
  }
}
