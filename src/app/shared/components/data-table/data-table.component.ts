import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  header: string;
  type?: 'text' | 'badge' | 'date' | 'action' | 'currency';
  badgeColorMap?: Record<string, string>; // e.g. { 'Active': 'green', 'Inactive': 'red' }
  clickable?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <div class="table-toolbar" *ngIf="showSearch">
        <input type="text" class="form-control search-input" placeholder="Search..." (input)="onSearch($event)" />
      </div>

      <div class="table-responsive">
        <table class="app-table">
          <thead>
            <tr>
              <th *ngFor="let col of columns">{{ col.header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              *ngFor="let row of filteredData; let i = index"
              [class.clickable-row]="isRowClickable || rowClicked.observed"
              (click)="onRowClick(row)">
              <td *ngFor="let col of columns">
                <ng-container [ngSwitch]="col.type">
                  <!-- Badge Type -->
                  <span *ngSwitchCase="'badge'" class="badge" [ngClass]="col.badgeColorMap?.[row[col.key]] || 'gray'">
                    {{ row[col.key] }}
                  </span>
                  
                  <!-- Date Type -->
                  <span *ngSwitchCase="'date'">
                    {{ row[col.key] | date:'dd MMM yyyy' }}
                  </span>
                  
                  <!-- Currency Type -->
                  <span *ngSwitchCase="'currency'">
                    {{ row[col.key] | currency:'INR':'symbol':'1.0-0' }}
                  </span>
                  
                  <!-- Action Type -->
                  <div *ngSwitchCase="'action'" class="action-buttons" (click)="$event.stopPropagation()">
                    <button class="btn-icon" *ngIf="row.filePath" (click)="$event.stopPropagation(); actionClicked.emit({ action: 'download', row: row })" title="Download">📥</button>
                    <!-- Modules button shown only on Coaching Centers (institutes) list -->
                    <button class="btn-icon" *ngIf="row.organizationId || (row.instituteCode && !row.studentCode && !row.email)" (click)="$event.stopPropagation(); actionClicked.emit({ action: 'modules', row: row })" title="Manage Modules">⚙️</button>
                    
                    <!-- View button for students -->
                    <button class="btn-icon view" *ngIf="row.studentCode" (click)="$event.stopPropagation(); actionClicked.emit({ action: 'view', row: row })" title="View Full Profile">👁️</button>

                    <!-- Standard edit/delete buttons shown for all standard entities -->
                    <button class="btn-icon" *ngIf="!row.organizationId" (click)="$event.stopPropagation(); actionClicked.emit({ action: 'edit', row: row })" title="Edit">✏️</button>
                    <button class="btn-icon delete" *ngIf="!row.organizationId" (click)="$event.stopPropagation(); actionClicked.emit({ action: 'delete', row: row })" title="Delete">🗑️</button>
                  </div>
                  
                  <!-- Default Text -->
                  <span 
                    *ngSwitchDefault 
                    [class.table-link]="col.clickable"
                    (click)="col.clickable ? onCellClick($event, col, row) : null">
                    {{ row[col.key] }}
                  </span>
                </ng-container>
              </td>
            </tr>
            <tr *ngIf="filteredData.length === 0">
              <td [attr.colspan]="columns.length" class="text-center text-muted">No records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pagination" *ngIf="showPagination">
        <span class="text-muted">Showing {{ filteredData.length }} of {{ data.length }} entries</span>
        <!-- Dummy pagination controls -->
        <div class="page-controls">
          <button class="btn btn-light" [disabled]="true">Previous</button>
          <button class="btn btn-light" [disabled]="true">Next</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-container { background: white; border-radius: var(--border-radius-lg); border: 1px solid var(--border-light); }
    .table-toolbar { padding: 16px; border-bottom: 1px solid var(--border-table); }
    .search-input { max-width: 300px; }
    .text-center { text-align: center; padding: 30px !important; }
    .clickable-row { cursor: pointer; transition: background-color 0.15s ease; }
    .clickable-row:hover td { background-color: #f1f5f9 !important; }
    .table-link { color: #6366f1; font-weight: 600; cursor: pointer; }
    .table-link:hover { text-decoration: underline; color: #4338ca; }
    .action-buttons { display: flex; gap: 8px; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; opacity: 0.7; transition: all 0.2s; }
    .btn-icon:hover { opacity: 1; transform: scale(1.1); }
    .btn-icon.view { opacity: 0.85; }
    .pagination { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-top: 1px solid var(--border-table); font-size: 13px; }
    .page-controls { display: flex; gap: 8px; }
    .page-controls button { padding: 6px 12px; font-size: 13px; }
  `]
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() set data(value: any[]) {
    this._data = value || [];
    this.filteredData = value ? [...value] : [];
  }
  get data() { return this._data; }
  private _data: any[] = [];
  
  @Input() showSearch = true;
  @Input() showPagination = true;
  @Input() isRowClickable = false;
  
  @Output() actionClicked = new EventEmitter<{action: string, row: any}>();
  @Output() rowClicked = new EventEmitter<any>();

  filteredData: any[] = [];

  onSearch(event: any) {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.filteredData = [...this.data];
      return;
    }
    this.filteredData = this.data.filter(item => {
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(term)
      );
    });
  }

  onRowClick(row: any) {
    if (this.isRowClickable || this.rowClicked.observed) {
      this.rowClicked.emit(row);
    }
  }

  onCellClick(event: MouseEvent, col: TableColumn, row: any) {
    if (col.clickable) {
      event.stopPropagation();
      this.rowClicked.emit(row);
    }
  }
}
