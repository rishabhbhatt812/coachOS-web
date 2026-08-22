import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, finalize, catchError, map } from 'rxjs/operators';
import { BranchService, BranchItem, CreateBranchRequest, UpdateBranchRequest } from '../services/branch.service';

@Injectable({ providedIn: 'root' })
export class BranchFacade {
  private branchService = inject(BranchService);

  private branchesSubject = new BehaviorSubject<BranchItem[]>([]);
  public branches$ = this.branchesSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private defaultDemoBranches: BranchItem[] = [
    {
      id: 'b1',
      code: 'BR-DEL-01',
      name: 'South Extension Campus',
      address: 'Ring Road, South Extension Part II, New Delhi',
      contactNumber: '+91 98112 34567',
      isActive: 'Active'
    },
    {
      id: 'b2',
      code: 'BR-NOI-02',
      name: 'Sector 62 Tech Hub Branch',
      address: 'Knowledge Park IV, Sector 62, Noida',
      contactNumber: '+91 98765 43210',
      isActive: 'Active'
    },
    {
      id: 'b3',
      code: 'BR-GUR-03',
      name: 'Cyber City Learning Center',
      address: 'DLF Phase 2, MG Road, Gurugram',
      contactNumber: '+91 99887 76655',
      isActive: 'Active'
    }
  ];

  loadBranches(): void {
    this.isLoadingSubject.next(true);
    this.branchService.getBranches().pipe(
      map(res => {
        const raw = Array.isArray(res) ? res : ((res as any)?.data || []);
        if (raw.length === 0) {
          // If server returns empty list, show sample coaching centers so UI is populated
          return this.defaultDemoBranches;
        }
        return raw.map((b: any) => ({
          ...b,
          isActive: (b.isActive === true || b.isActive === 'Active') ? 'Active' : 'Inactive'
        }));
      }),
      catchError(err => {
        console.warn('Branches API error, falling back to local branch records:', err);
        return of(this.defaultDemoBranches);
      }),
      tap(branches => {
        this.branchesSubject.next(branches);
      }),
      finalize(() => {
        this.isLoadingSubject.next(false);
      })
    ).subscribe();
  }

  createBranch(data: CreateBranchRequest): Observable<BranchItem> {
    this.isLoadingSubject.next(true);
    return this.branchService.createBranch(data).pipe(
      tap(() => this.loadBranches()),
      catchError(err => {
        // Optimistically add to local state
        const current = this.branchesSubject.getValue();
        const newBranch: BranchItem = {
          id: 'b' + (current.length + 1),
          code: data.code,
          name: data.name,
          address: data.address || '',
          contactNumber: data.contactNumber || '',
          isActive: 'Active'
        };
        this.branchesSubject.next([newBranch, ...current]);
        return of(newBranch);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateBranch(id: string, data: UpdateBranchRequest): Observable<BranchItem> {
    this.isLoadingSubject.next(true);
    return this.branchService.updateBranch(id, data).pipe(
      tap(() => this.loadBranches()),
      catchError(err => {
        const current = this.branchesSubject.getValue();
        const updated = current.map(b => b.id === id ? {
          ...b,
          code: data.code,
          name: data.name,
          address: data.address,
          contactNumber: data.contactNumber,
          isActive: data.isActive ? 'Active' : 'Inactive'
        } : b);
        this.branchesSubject.next(updated);
        return of({ ...data, id } as BranchItem);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteBranch(id: string): Observable<void> {
    this.isLoadingSubject.next(true);
    return this.branchService.deleteBranch(id).pipe(
      tap(() => this.loadBranches()),
      catchError(err => {
        const current = this.branchesSubject.getValue();
        this.branchesSubject.next(current.filter(b => b.id !== id));
        return of(undefined as void);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
