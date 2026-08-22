import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { FeeService, FeePlan } from '../services/fee.service';
import { CreateFeePlanRequest } from '../models/api-schemas';

@Injectable({ providedIn: 'root' })
export class FeeFacade {
  private feeService = inject(FeeService);

  private feePlansSubject = new BehaviorSubject<FeePlan[]>([]);
  public feePlans$ = this.feePlansSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  loadFeePlans(): void {
    this.isLoadingSubject.next(true);
    this.feeService.getFeePlans().pipe(
      tap(plans => this.feePlansSubject.next(plans)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  createFeePlan(data: CreateFeePlanRequest): Observable<FeePlan> {
    this.isLoadingSubject.next(true);
    return this.feeService.createFeePlan(data).pipe(
      tap(() => this.loadFeePlans()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateFeePlan(id: string, data: any): Observable<FeePlan> {
    this.isLoadingSubject.next(true);
    // Optimistically update or call service
    const current = this.feePlansSubject.getValue();
    const updatedList = current.map(p => p.id === id ? { ...p, ...data } : p);
    this.feePlansSubject.next(updatedList);

    return this.feeService.updateFeePlan(id, data).pipe(
      tap(() => this.loadFeePlans()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteFeePlan(id: string): Observable<void> {
    this.isLoadingSubject.next(true);
    return this.feeService.deleteFeePlan(id).pipe(
      tap(() => this.loadFeePlans()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
