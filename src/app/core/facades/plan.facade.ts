import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map, finalize } from 'rxjs/operators';
import { PlanService } from '../services/plan.service';
import { SubscriptionPlan, PlanPurchaseInquiry } from '../models/plan.model';

@Injectable({ providedIn: 'root' })
export class PlanFacade {
  private planService = inject(PlanService);

  private plansSubject = new BehaviorSubject<SubscriptionPlan[]>([]);
  public plans$ = this.plansSubject.asObservable();

  public activePlans$ = this.plans$.pipe(
    map(plans => plans.filter(p => p.isActive))
  );

  private inquiriesSubject = new BehaviorSubject<PlanPurchaseInquiry[]>([]);
  public inquiries$ = this.inquiriesSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  loadPlans(): void {
    this.isLoadingSubject.next(true);
    this.planService.getPlans().pipe(
      tap(plans => this.plansSubject.next(plans)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  savePlan(plan: SubscriptionPlan): Observable<SubscriptionPlan> {
    this.isLoadingSubject.next(true);
    return this.planService.savePlan(plan).pipe(
      tap(() => this.loadPlans()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deletePlan(id: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.planService.deletePlan(id).pipe(
      tap(() => this.loadPlans()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  loadInquiries(): void {
    this.planService.getInquiries().pipe(
      tap(inquiries => this.inquiriesSubject.next(inquiries))
    ).subscribe();
  }

  submitInquiry(inquiry: PlanPurchaseInquiry): Observable<{ success: boolean; message: string; ticketId: string }> {
    return this.planService.submitInquiry(inquiry).pipe(
      tap(() => this.loadInquiries())
    );
  }
}
