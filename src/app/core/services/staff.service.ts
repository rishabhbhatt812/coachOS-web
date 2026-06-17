import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS, environment } from '../constants/api-endpoints';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private http = inject(HttpClient);

  getAllStaff(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.ADMIN.STAFF);
  }

  getStaffById(id: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.ADMIN.STAFF}/${id}`);
  }

  createStaff(data: any): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.ADMIN.STAFF, data);
  }

  updateStaff(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${API_ENDPOINTS.ADMIN.STAFF}/${id}`, data);
  }

  deleteStaff(id: string): Observable<any> {
    return this.http.delete<any>(`${API_ENDPOINTS.ADMIN.STAFF}/${id}`);
  }

  getStaffByRole(roleName: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.ADMIN.STAFF}/by-role/${roleName}`);
  }

  getTeachers(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.ADMIN.TEACHERS);
  }

  getTeacherById(id: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.ADMIN.TEACHERS}/${id}`);
  }

  updateTeacherProfile(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${API_ENDPOINTS.ADMIN.TEACHERS}/${id}/profile`, data);
  }

  getBranches(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/admin/branches`);
  }

  getRoles(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.ADMIN.STAFF}/roles`);
  }
}
