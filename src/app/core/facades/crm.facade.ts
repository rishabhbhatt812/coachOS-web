import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { CrmService, Enquiry } from '../services/crm.service';
import { CreateEnquiryRequest, UpdateEnquiryRequest } from '../models/api-schemas';

@Injectable({ providedIn: 'root' })
export class CrmFacade {
  private crmService = inject(CrmService);

  private enquiriesSubject = new BehaviorSubject<Enquiry[]>([]);
  public enquiries$ = this.enquiriesSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  loadEnquiries(): void {
    this.isLoadingSubject.next(true);
    this.crmService.getEnquiries().pipe(
      tap(enqs => this.enquiriesSubject.next(enqs)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  createEnquiry(data: CreateEnquiryRequest): Observable<Enquiry> {
    this.isLoadingSubject.next(true);
    return this.crmService.createEnquiry(data).pipe(
      tap(() => this.loadEnquiries()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateEnquiry(id: string, data: UpdateEnquiryRequest): Observable<Enquiry> {
    this.isLoadingSubject.next(true);
    return this.crmService.updateEnquiry(id, data).pipe(
      tap(() => this.loadEnquiries()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteEnquiry(id: string): Observable<void> {
    this.isLoadingSubject.next(true);
    return this.crmService.deleteEnquiry(id).pipe(
      tap(() => this.loadEnquiries()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
