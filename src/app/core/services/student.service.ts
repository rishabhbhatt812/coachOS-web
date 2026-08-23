import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export interface StudentDashboardData {
  courseName: string;
  batchTiming: string;
  attendancePercent: number;
  feeDueAmount: number;
  feeDueDate: string;
  lastTestName: string;
  lastTestScore: string;
  courseDetails: any;
  todaysClass: any;
  notices: any[];
  testResults: any[];
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private http = inject(HttpClient);

  getDashboardData(): Observable<StudentDashboardData> {
    return this.http.get<StudentDashboardData>(API_ENDPOINTS.STUDENT.DASHBOARD);
  }

  getCourses(): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.STUDENT.COURSES);
  }

  getFees(): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.STUDENT.FEES);
  }

  getNotes(): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.STUDENT.NOTES);
  }

  getAttendance(): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.STUDENT.ATTENDANCE);
  }

  getResults(): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.STUDENT.RESULTS);
  }

  getVacancies(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.STUDENT.VACANCIES).pipe(
      map((res: any) => {
        if (res?.data?.vacancies) {
          return {
            studentQualification: res.data.studentQualification,
            vacancies: res.data.vacancies
          };
        }
        if (res?.vacancies) {
          return res;
        }
        const list = res?.data || res || [];
        return {
          studentQualification: 'High School / Graduate',
          vacancies: Array.isArray(list) ? list : []
        };
      })
    );
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.STUDENT.PORTAL + '/profile');
  }

  uploadProfilePicture(formData: FormData): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.STUDENT.PORTAL + '/profile-picture', formData);
  }
}
