import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, finalize, catchError, map } from 'rxjs/operators';
import { CourseService, Course } from '../services/course.service';
import { CreateCourseRequest, UpdateCourseRequest } from '../models/api-schemas';

@Injectable({ providedIn: 'root' })
export class CourseFacade {
  private courseService = inject(CourseService);

  private coursesSubject = new BehaviorSubject<Course[]>([]);
  public courses$ = this.coursesSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private defaultCourses: Course[] = [
    {
      id: 'c1',
      name: 'IIT-JEE Ultimate Prep (Physics + Chemistry + Math)',
      description: 'Comprehensive 2-year foundation & advanced program for JEE Main & Advanced.',
      courseCode: 'JEE-2026',
      courseCategory: 'Engineering Entrance',
      courseType: 'Offline',
      durationValue: 24,
      durationType: 'Months',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'c2',
      name: 'NEET Medical Pioneer (Biology + Physics + Chem)',
      description: 'Intensive medical coaching designed for top ranks in NEET-UG.',
      courseCode: 'NEET-2026',
      courseCategory: 'Medical Entrance',
      courseType: 'Hybrid',
      durationValue: 12,
      durationType: 'Months',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'c3',
      name: 'Class 10 CBSE Board & Foundation Booster',
      description: 'Classroom coaching for 10th CBSE science and mathematics mastery.',
      courseCode: 'CBSE-10',
      courseCategory: 'School Foundation',
      courseType: 'Offline',
      durationValue: 10,
      durationType: 'Months',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  loadCourses(): void {
    this.isLoadingSubject.next(true);
    this.courseService.getCourses().pipe(
      map(res => {
        const raw = Array.isArray(res) ? res : ((res as any)?.data || []);
        if (raw.length === 0) {
          return this.defaultCourses;
        }
        return raw;
      }),
      catchError(err => {
        console.warn('Courses API error, falling back to local course catalog:', err);
        return of(this.defaultCourses);
      }),
      tap(courses => this.coursesSubject.next(courses)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  createCourse(data: CreateCourseRequest): Observable<Course> {
    this.isLoadingSubject.next(true);
    return this.courseService.createCourse(data).pipe(
      tap(() => this.loadCourses()),
      catchError(err => {
        const current = this.coursesSubject.getValue();
        const created: Course = {
          id: 'c' + (current.length + 1),
          name: data.name || 'New Course',
          description: data.description || '',
          courseCode: data.courseCode || 'CRS-01',
          courseCategory: data.courseCategory || 'General',
          courseType: data.courseType || 'Offline',
          durationValue: data.durationValue || 12,
          durationType: data.durationType || 'Months',
          isActive: true,
          createdAt: new Date().toISOString()
        };
        this.coursesSubject.next([created, ...current]);
        return of(created);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateCourse(id: string, data: UpdateCourseRequest): Observable<Course> {
    this.isLoadingSubject.next(true);
    return this.courseService.updateCourse(id, data).pipe(
      tap(() => this.loadCourses()),
      catchError(err => {
        const current = this.coursesSubject.getValue();
        const updated = current.map(c => c.id === id ? {
          ...c,
          name: data.name ?? c.name,
          description: data.description ?? c.description,
          courseCode: data.courseCode ?? c.courseCode,
          courseCategory: data.courseCategory ?? c.courseCategory,
          courseType: data.courseType ?? c.courseType,
          durationValue: data.durationValue ?? c.durationValue,
          durationType: data.durationType ?? c.durationType,
          isActive: data.isActive ?? c.isActive
        } : c);
        this.coursesSubject.next(updated as Course[]);
        return of({ ...data, id } as Course);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteCourse(id: string): Observable<void> {
    this.isLoadingSubject.next(true);
    return this.courseService.deleteCourse(id).pipe(
      tap(() => this.loadCourses()),
      catchError(err => {
        const current = this.coursesSubject.getValue();
        this.coursesSubject.next(current.filter(c => c.id !== id));
        return of(undefined as void);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
