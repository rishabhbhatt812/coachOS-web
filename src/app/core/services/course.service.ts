import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CreateCourseRequest, UpdateCourseRequest } from '../models/api-schemas';

export interface Course {
  id: string;
  name: string;
  description: string;
  courseCode: string;
  courseCategory: string;
  courseType: string;
  durationValue: number;
  durationType: string;
  isActive: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private http = inject(HttpClient);

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(API_ENDPOINTS.ADMIN.COURSES);
  }

  getCourse(id: string): Observable<Course> {
    return this.http.get<Course>(API_ENDPOINTS.ADMIN.COURSES + '/' + id);
  }

  createCourse(data: CreateCourseRequest): Observable<Course> {
    return this.http.post<Course>(API_ENDPOINTS.ADMIN.COURSES, data);
  }

  updateCourse(id: string, data: UpdateCourseRequest): Observable<Course> {
    return this.http.put<Course>(API_ENDPOINTS.ADMIN.COURSES + '/' + id, data);
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.ADMIN.COURSES + '/' + id);
  }
}
