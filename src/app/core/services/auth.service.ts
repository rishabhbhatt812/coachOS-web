import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest } from '../models/api-schemas';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.AUTH.ME);
  }

  // Assuming logout clears token locally, or could call a logout endpoint if it existed
  logout(): Observable<boolean> {
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }
}
