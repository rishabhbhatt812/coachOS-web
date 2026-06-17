import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CreateStudentRequest, UpdateStudentRequest } from '../models/api-schemas';

export interface AdminStudentInfo {
  id: string;
  studentCode: string;
  fullName: string;
  mobile: string;
  email: string;
  dateOfBirth: string;
  admissionDate: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class StudentAdminService {
  private http = inject(HttpClient);

  getStudents(): Observable<AdminStudentInfo[]> {
    return this.http.get<AdminStudentInfo[]>(API_ENDPOINTS.ADMIN.STUDENTS);
  }

  getStudent(id: string): Observable<AdminStudentInfo> {
    return this.http.get<AdminStudentInfo>(API_ENDPOINTS.ADMIN.STUDENTS + '/' + id);
  }

  createStudent(data: CreateStudentRequest): Observable<AdminStudentInfo> {
    return this.http.post<AdminStudentInfo>(API_ENDPOINTS.ADMIN.STUDENTS, data);
  }

  updateStudent(id: string, data: UpdateStudentRequest): Observable<AdminStudentInfo> {
    return this.http.put<AdminStudentInfo>(API_ENDPOINTS.ADMIN.STUDENTS + '/' + id, data);
  }

  deleteStudent(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.ADMIN.STUDENTS + '/' + id);
  }
}
