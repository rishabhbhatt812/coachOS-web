import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { NoticeFacade } from '../../../core/facades/notice.facade';
import { CourseFacade } from '../../../core/facades/course.facade';
import { BatchFacade } from '../../../core/facades/batch.facade';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateNoticeRequest } from '../../../core/models/api-schemas';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-admin-notices',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    DataTableComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-notices.component.html',
  styleUrl: './admin-notices.component.scss'
})
export class AdminNoticesComponent implements OnInit {
  private noticeFacade = inject(NoticeFacade);
  private courseFacade = inject(CourseFacade);
  private batchFacade = inject(BatchFacade);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialogService = inject(DialogService);

  notices$ = this.noticeFacade.notices$;
  courses$ = this.courseFacade.courses$;
  batches$ = this.batchFacade.batches$;
  isLoading$ = this.noticeFacade.isLoading$;
  showAddForm = false;
  editingId: string | null = null;
  noticeForm!: FormGroup;

  columns: TableColumn[] = [
    { key: 'title', header: 'Title' },
    { key: 'message', header: 'Message' },
    { key: 'courseName', header: 'Target Course' },
    { key: 'batchName', header: 'Target Batch' },
    { key: 'createdAt', header: 'Date Posted', type: 'date' },
    { key: 'actions', header: 'Actions', type: 'action' }
  ];

  ngOnInit() {
    this.noticeFacade.loadNotices();
    this.courseFacade.loadCourses();
    this.batchFacade.loadBatches();
    this.initForm();
  }

  initForm() {
    this.noticeForm = this.fb.group({
      title: ['', [Validators.required]],
      message: ['', [Validators.required]],
      courseId: [''],
      batchId: ['']
    });
  }

  toggleForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.editingId = null;
      this.noticeForm.reset({ courseId: '', batchId: '' });
    }
  }

  onSubmit() {
    if (this.noticeForm.valid) {
      const val = this.noticeForm.value;
      if (this.editingId) {
        // Delete old + create new (notices API only supports create/delete)
        this.noticeFacade.deleteNotice(this.editingId).subscribe({
          next: () => {
            const req: CreateNoticeRequest = {
              title: val.title,
              message: val.message,
              courseId: val.courseId || undefined,
              batchId: val.batchId || undefined
            };
            this.noticeFacade.createNotice(req).subscribe({
              next: () => {
                this.snackBar.open('Announcement updated successfully!', 'Dismiss', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: ['success-snackbar'] });
                this.toggleForm();
              }
            });
          },
          error: (err) => console.error('Failed to update notice:', err)
        });
      } else {
        const req: CreateNoticeRequest = {
          title: val.title,
          message: val.message,
          courseId: val.courseId || undefined,
          batchId: val.batchId || undefined
        };
        this.noticeFacade.createNotice(req).subscribe({
          next: () => {
            this.snackBar.open('Announcement posted successfully!', 'Dismiss', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: ['success-snackbar'] });
            this.toggleForm();
          },
          error: (err) => console.error('Failed to create notice:', err)
        });
      }
    }
  }

  onActionClicked(event: any) {
    if (event.action === 'edit') {
      this.editingId = event.row.id;
      this.noticeForm.patchValue({
        title: event.row.title,
        message: event.row.message,
        courseId: event.row.courseId || '',
        batchId: event.row.batchId || ''
      });
      this.showAddForm = true;
    } else if (event.action === 'delete') {
      this.dialogService.delete(event.row.title ? `notice: "${event.row.title}"` : 'Notice').subscribe(confirmed => {
        if (confirmed) {
          this.noticeFacade.deleteNotice(event.row.id).subscribe({
            next: () => {
              this.dialogService.success('Announcement deleted successfully!');
            },
            error: (err) => {
              console.error('Failed to delete notice:', err);
              this.dialogService.error('Failed to delete announcement.');
            }
          });
        }
      });
    }
  }
}
