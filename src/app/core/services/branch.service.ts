import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export interface BranchItem {
  id: string;
  code: string;
  name: string;
  address?: string;
  contactNumber?: string;
  isActive: boolean | string;
}

export interface CreateBranchRequest {
  code: string;
  name: string;
  address?: string;
  contactNumber?: string;
}

export interface UpdateBranchRequest {
  code: string;
  name: string;
  address?: string;
  contactNumber?: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class BranchService {
  private http = inject(HttpClient);

  getBranches(): Observable<BranchItem[]> {
    return this.http.get<BranchItem[]>(API_ENDPOINTS.ADMIN.BRANCHES);
  }

  getBranch(id: string): Observable<BranchItem> {
    return this.http.get<BranchItem>(`${API_ENDPOINTS.ADMIN.BRANCHES}/${id}`);
  }

  createBranch(data: CreateBranchRequest): Observable<BranchItem> {
    return this.http.post<BranchItem>(API_ENDPOINTS.ADMIN.BRANCHES, data);
  }

  updateBranch(id: string, data: UpdateBranchRequest): Observable<BranchItem> {
    return this.http.put<BranchItem>(`${API_ENDPOINTS.ADMIN.BRANCHES}/${id}`, data);
  }

  deleteBranch(id: string): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.ADMIN.BRANCHES}/${id}`);
  }
}
