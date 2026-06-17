import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CreateBatchRequest, UpdateBatchRequest } from '../models/api-schemas';

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  teacherUserId: string;
  teacherName: string;
  defaultFee: number;
}

@Injectable({ providedIn: 'root' })
export class BatchService {
  private http = inject(HttpClient);

  getBatches(): Observable<Batch[]> {
    return this.http.get<Batch[]>(API_ENDPOINTS.ADMIN.BATCHES);
  }

  getBatch(id: string): Observable<Batch> {
    return this.http.get<Batch>(API_ENDPOINTS.ADMIN.BATCHES + '/' + id);
  }

  createBatch(data: CreateBatchRequest): Observable<Batch> {
    return this.http.post<Batch>(API_ENDPOINTS.ADMIN.BATCHES, data);
  }

  updateBatch(id: string, data: UpdateBatchRequest): Observable<Batch> {
    return this.http.put<Batch>(API_ENDPOINTS.ADMIN.BATCHES + '/' + id, data);
  }

  deleteBatch(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.ADMIN.BATCHES + '/' + id);
  }
}
