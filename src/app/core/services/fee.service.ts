import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CreateFeePlanRequest } from '../models/api-schemas';

export interface FeePlan {
  id: string;
  studentName: string;
  courseName: string;
  totalFee: number;
  discountAmount: number;
  finalFee: number;
  paidAmount: number;
  dueAmount: number;
  planType: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class FeeService {
  private http = inject(HttpClient);

  getFeePlans(): Observable<FeePlan[]> {
    return this.http.get<FeePlan[]>(API_ENDPOINTS.ADMIN.FEES_PLANS);
  }

  getFeePlan(id: string): Observable<FeePlan> {
    return this.http.get<FeePlan>(API_ENDPOINTS.ADMIN.FEES_PLANS + '/' + id);
  }

  createFeePlan(data: CreateFeePlanRequest): Observable<FeePlan> {
    return this.http.post<FeePlan>(API_ENDPOINTS.ADMIN.FEES_PLANS, data);
  }

  deleteFeePlan(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.ADMIN.FEES_PLANS + '/' + id);
  }
}
