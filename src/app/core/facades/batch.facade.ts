import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { BatchService, Batch } from '../services/batch.service';
import { CreateBatchRequest, UpdateBatchRequest } from '../models/api-schemas';

@Injectable({ providedIn: 'root' })
export class BatchFacade {
  private batchService = inject(BatchService);

  private batchesSubject = new BehaviorSubject<Batch[]>([]);
  public batches$ = this.batchesSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  loadBatches(): void {
    this.isLoadingSubject.next(true);
    this.batchService.getBatches().pipe(
      tap(batches => this.batchesSubject.next(batches)),
      finalize(() => this.isLoadingSubject.next(false))
    ).subscribe();
  }

  createBatch(data: CreateBatchRequest): Observable<Batch> {
    this.isLoadingSubject.next(true);
    return this.batchService.createBatch(data).pipe(
      tap(() => this.loadBatches()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateBatch(id: string, data: UpdateBatchRequest): Observable<Batch> {
    this.isLoadingSubject.next(true);
    return this.batchService.updateBatch(id, data).pipe(
      tap(() => this.loadBatches()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteBatch(id: string): Observable<void> {
    this.isLoadingSubject.next(true);
    return this.batchService.deleteBatch(id).pipe(
      tap(() => this.loadBatches()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
