import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialog = inject(MatDialog);

  /**
   * Shows a confirmation dialog with Confirm and Cancel buttons
   */
  confirm(options: string | Partial<ConfirmDialogData>): Observable<boolean> {
    const data: ConfirmDialogData = typeof options === 'string'
      ? {
          title: 'Confirm Action',
          message: options,
          type: 'warning',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          isAlert: false
        }
      : {
          title: options.title || 'Confirm Action',
          message: options.message || 'Are you sure you want to proceed?',
          type: options.type || 'warning',
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          isAlert: false
        };

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data,
      width: '440px',
      panelClass: 'custom-dialog-panel',
      disableClose: false,
      autoFocus: false
    });

    return dialogRef.afterClosed().pipe(map(result => !!result));
  }

  /**
   * Shows a dedicated delete confirmation dialog with red warning styling
   */
  delete(itemName: string, customMessage?: string): Observable<boolean> {
    const data: ConfirmDialogData = {
      title: 'Delete Confirmation',
      message: customMessage || `Are you sure you want to permanently delete "${itemName}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      isAlert: false
    };

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data,
      width: '440px',
      panelClass: 'custom-dialog-panel',
      disableClose: false,
      autoFocus: false
    });

    return dialogRef.afterClosed().pipe(map(result => !!result));
  }

  /**
   * Shows an alert popup with an OK button to replace native window.alert()
   */
  alert(message: string, title: string = 'Notice', type: 'info' | 'success' | 'warning' | 'danger' = 'info'): Observable<boolean> {
    const data: ConfirmDialogData = {
      title,
      message,
      type,
      confirmText: 'Got It',
      isAlert: true
    };

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data,
      width: '440px',
      panelClass: 'custom-dialog-panel',
      disableClose: false,
      autoFocus: false
    });

    return dialogRef.afterClosed().pipe(map(result => !!result));
  }

  /**
   * Shows a success popup
   */
  success(message: string, title: string = 'Success!'): Observable<boolean> {
    return this.alert(message, title, 'success');
  }

  /**
   * Shows an error popup
   */
  error(message: string, title: string = 'Error Occurred'): Observable<boolean> {
    return this.alert(message, title, 'danger');
  }
}
