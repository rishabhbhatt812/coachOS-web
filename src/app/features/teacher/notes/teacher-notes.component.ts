import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload';
import { TeacherFacade } from '../../../core/facades/teacher.facade';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/constants/api-endpoints';

@Component({
  selector: 'app-teacher-notes',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule, 
    DataTableComponent, 
    FileUploadComponent,
    MatSnackBarModule
  ],
  templateUrl: './teacher-notes.component.html',
  styleUrl: './teacher-notes.component.scss'
})
export class TeacherNotesComponent implements OnInit {
  private teacherFacade = inject(TeacherFacade);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);

  notes$ = this.teacherFacade.notes$;
  isLoading$ = this.teacherFacade.isLoading$;

  columns: TableColumn[] = [
    { key: 'title', header: 'Title' },
    { key: 'courseName', header: 'Course' },
    { key: 'subjectName', header: 'Subject' },
    { key: 'batchName', header: 'Batch' },
    { key: 'createdAt', header: 'Uploaded On', type: 'date' },
    { key: 'actions', header: 'Actions', type: 'action' }
  ];

  showUploadForm = false;
  newNote: any = {};
  noteFile: File | null = null;
  batches: any[] = [];

  ngOnInit() {
    this.teacherFacade.loadNotes();
    this.loadMyBatches();
  }

  loadMyBatches() {
    this.http.get<any>(`${environment.apiUrl}/api/teacher/batches`).subscribe({
      next: (res) => {
        this.batches = res?.data || res || [];
      },
      error: (err) => {
        console.error('Failed to load my batches:', err);
      }
    });
  }

  toggleUploadForm() {
    this.showUploadForm = !this.showUploadForm;
    if (!this.showUploadForm) {
      this.newNote = {};
      this.noteFile = null;
    }
  }

  onFileSelected(file: File | null) {
    this.noteFile = file;
  }

  submitNote() {
    if (!this.newNote.title || !this.newNote.batchId || !this.noteFile) {
      this.snackBar.open('Please fill in all required fields and select a file.', 'Dismiss', { duration: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append('title', this.newNote.title);
    formData.append('batchId', this.newNote.batchId);
    formData.append('description', this.newNote.description || '');
    formData.append('file', this.noteFile);

    this.teacherFacade.uploadNote(formData).subscribe({
      next: () => {
        this.snackBar.open('Study material uploaded successfully!', 'Dismiss', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.toggleUploadForm();
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.snackBar.open('Upload failed. Please try again.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  onActionClicked(event: any) {
    if (event.action === 'delete') {
      if (confirm('Are you sure you want to delete this study material: ' + event.row.title + '?')) {
        this.teacherFacade.deleteNote(event.row.id).subscribe({
          next: () => {
            this.snackBar.open('Study material deleted successfully!', 'Dismiss', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Failed to delete note:', err);
          }
        });
      }
    } else if (event.action === 'download') {
      if (event.row.filePath) {
        let url = event.row.filePath;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = `${environment.apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        }
        window.open(url, '_blank');
      }
    } else {
      this.snackBar.open(`Action "${event.action}" clicked for ${event.row.title}`, 'Dismiss', {
        duration: 2500,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }
}
