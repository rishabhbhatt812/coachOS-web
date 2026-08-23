import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINTS, environment } from '../constants/api-endpoints';

export interface VacancyItem {
  id: string;
  instituteId?: string;
  instituteName?: string;
  title: string;
  department?: string;
  examCategory: string;
  qualificationRequired?: string;
  ageLimit?: string;
  totalPosts?: string;
  salaryRange?: string;
  applicationFee?: string;
  startDate?: string;
  lastDate: string;
  officialLink?: string;
  description?: string;
  eligibilityDetails?: string;
  notificationPdfUrl?: string;
  notificationSent?: boolean;
  isActive: boolean;
  eligibleStudentsCount?: number;
  daysRemaining?: number;
  isExpired?: boolean;
  createdAt?: string;
}

export interface VacancyMetrics {
  totalVacancies: number;
  activeVacancies: number;
  totalEligibleMatches: number;
  expiringThisWeek: number;
}

export interface EligibleStudent {
  studentId: string;
  studentCode: string;
  fullName: string;
  email?: string;
  mobile?: string;
  qualification: string;
  enrolledCourse: string;
  matchReason: string;
}

@Injectable({ providedIn: 'root' })
export class VacanciesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/admin/vacancies`;

  getCategories(): Observable<string[]> {
    return this.http.get<any>(`${this.baseUrl}/categories`).pipe(
      map(res => res?.data || res || [])
    );
  }

  getVacancies(category?: string, search?: string): Observable<VacancyItem[]> {
    let params = new HttpParams();
    if (category && category !== 'ALL') {
      params = params.set('category', category);
    }
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(this.baseUrl, { params }).pipe(
      map(res => res?.data || res || [])
    );
  }

  getVacancyById(id: string): Observable<{ vacancy: VacancyItem, eligibleStudents: EligibleStudent[] }> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(res => res?.data || res)
    );
  }

  getMetrics(): Observable<VacancyMetrics> {
    return this.http.get<any>(`${this.baseUrl}/metrics`).pipe(
      map(res => res?.data || { totalVacancies: 0, activeVacancies: 0, totalEligibleMatches: 0, expiringThisWeek: 0 })
    );
  }

  createVacancy(formData: FormData): Observable<any> {
    return this.http.post<any>(this.baseUrl, formData);
  }

  updateVacancy(id: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, formData);
  }

  deleteVacancy(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  notifyStudents(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/notify`, {});
  }
}
