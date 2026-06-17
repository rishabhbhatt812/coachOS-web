import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CreateEnquiryRequest, UpdateEnquiryRequest } from '../models/api-schemas';

export interface Enquiry {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  source: string;
  status: string;
  interestedCourseName: string;
  assignedToName: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CrmService {
  private http = inject(HttpClient);

  getEnquiries(): Observable<Enquiry[]> {
    return this.http.get<Enquiry[]>(API_ENDPOINTS.ADMIN.CRM_ENQUIRIES);
  }

  getEnquiry(id: string): Observable<Enquiry> {
    return this.http.get<Enquiry>(API_ENDPOINTS.ADMIN.CRM_ENQUIRIES + '/' + id);
  }

  createEnquiry(data: CreateEnquiryRequest): Observable<Enquiry> {
    return this.http.post<Enquiry>(API_ENDPOINTS.ADMIN.CRM_ENQUIRIES, data);
  }

  updateEnquiry(id: string, data: UpdateEnquiryRequest): Observable<Enquiry> {
    return this.http.put<Enquiry>(API_ENDPOINTS.ADMIN.CRM_ENQUIRIES + '/' + id, data);
  }

  deleteEnquiry(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.ADMIN.CRM_ENQUIRIES + '/' + id);
  }
}
