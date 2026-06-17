import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/api-endpoints';

export interface QuickAdmissionReq {
  fullName: string;
  mobile: string;
  email?: string;
  courseId: string;
  batchId: string;
}

export interface FullAdmissionReq {
  studentCode: string;
  fullName: string;
  mobile: string;
  email?: string;
  dateOfBirth: string;
  admissionDate: string;
  admissionType?: string;
  demoDurationDays?: number;
  parentName: string;
  parentMobile: string;
  parentEmail?: string;
  parentOccupation?: string;
  parentRelationship: string;
  courseId: string;
  batchId: string;
  totalFee: number;
  discountAmount: number;
  planType: string;
  installments: any[];
  initialPayment?: any;
}

@Injectable({ providedIn: 'root' })
export class AdmissionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/admin/admissions`;

  getNextStudentCode(prefix: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/admin/students/next-code`, { params: { prefix } });
  }

  quickAdmission(data: QuickAdmissionReq): Observable<any> {
    return this.http.post(`${this.apiUrl}/quick-admission`, data);
  }

  fullAdmission(data: FullAdmissionReq): Observable<any> {
    return this.http.post(`${this.apiUrl}/full-admission`, data);
  }

  getStudentProfile(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/profile`);
  }

  getBatchHistory(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/batch-history`);
  }

  getFeeHistory(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/fee-history`);
  }

  transferBatch(id: string, newBatchId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/transfer-batch`, { newBatchId });
  }

  uploadProfilePicture(studentId: string, formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/admin/students/${studentId}/profile-picture`, formData);
  }
}
