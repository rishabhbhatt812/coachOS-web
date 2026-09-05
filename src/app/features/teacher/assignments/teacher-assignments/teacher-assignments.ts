import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload';
import { DialogService } from '../../../../core/services/dialog.service';
import { environment } from '../../../../core/constants/api-endpoints';

export interface AssignmentItem {
  id: string;
  title: string;
  batch: string;
  batchName?: string;
  batchId?: string;
  courseName?: string;
  dueDate: string;
  marks: number;
  description: string;
  submissions: number;
  totalStudents: number;
  fileName?: string;
  originalFileName?: string;
  filePath?: string;
  status?: 'Active' | 'Due Soon' | 'Past Due';
}

export interface StudentSubmissionItem {
  studentId: string;
  submissionId?: string | null;
  rollNo: string;
  name: string;
  submittedAt?: string | null;
  file?: string | null;
  fileUrl?: string | null;
  status: string;
  marks?: number | null;
  feedback?: string | null;
}

@Component({
  selector: 'app-teacher-assignments',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatDatepickerModule, 
    MatNativeDateModule, 
    MatSnackBarModule,
    FormsModule, 
    FileUploadComponent
  ],
  templateUrl: './teacher-assignments.html',
  styleUrl: './teacher-assignments.scss',
})
export class TeacherAssignments implements OnInit {
  Math = Math;
  private dialogService = inject(DialogService);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);

  showCreateForm = false;
  isLoading = false;
  isSubmitting = false;

  searchQuery = '';
  selectedBatchFilter = 'ALL';

  assignments: AssignmentItem[] = [];
  batches: any[] = [];

  newAssignment: any = {
    title: '',
    batchId: '',
    description: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
    marks: 50
  };
  assignmentFile: File | null = null;

  // Grading Modal State
  showGradeModal = false;
  isLoadingSubmissions = false;
  isSavingGrades = false;
  selectedAssignment: AssignmentItem | null = null;
  studentSubmissions: StudentSubmissionItem[] = [];

  ngOnInit() {
    this.loadBatches();
    this.loadAssignments();
  }

  get filteredAssignments(): AssignmentItem[] {
    let list = this.assignments;
    if (this.selectedBatchFilter && this.selectedBatchFilter !== 'ALL') {
      list = list.filter(a => a.batchId === this.selectedBatchFilter || a.batch === this.selectedBatchFilter);
    }
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.description?.toLowerCase().includes(q) || 
        a.batch?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  // Stats Counters - 100% dynamic
  get totalAssignmentsCount(): number {
    return this.assignments.length;
  }

  get totalSubmissionsCount(): number {
    return this.assignments.reduce((acc, curr) => acc + (curr.submissions || 0), 0);
  }

  get totalStudentsCount(): number {
    return this.assignments.reduce((acc, curr) => acc + (curr.totalStudents || 0), 0);
  }

  get overallCompletionRate(): number {
    if (this.totalStudentsCount === 0) return 0;
    return Math.round((this.totalSubmissionsCount / this.totalStudentsCount) * 100);
  }

  get pendingEvaluationCount(): number {
    return this.assignments.reduce((sum, a) => sum + (a.submissions || 0), 0);
  }

  get upcomingDeadline(): { dateStr: string; title: string } {
    const now = new Date();
    const upcoming = this.assignments
      .filter(a => a.dueDate && new Date(a.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    if (upcoming.length > 0) {
      const d = new Date(upcoming[0].dueDate);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { dateStr, title: upcoming[0].batch || upcoming[0].title };
    }
    return { dateStr: 'None', title: 'No pending deadlines' };
  }

  loadBatches() {
    this.http.get<any>(`${environment.apiUrl}/api/teacher/batches`).subscribe({
      next: (res) => {
        const list = res?.data || res || [];
        if (Array.isArray(list) && list.length > 0) {
          this.batches = list;
          if (!this.newAssignment.batchId) {
            this.newAssignment.batchId = list[0].id;
          }
        } else {
          this.batches = [];
        }
      },
      error: () => {
        this.batches = [];
      }
    });
  }

  loadAssignments() {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/api/teacher/assignments`).subscribe({
      next: (res) => {
        this.isLoading = false;
        const list = res?.data || res || [];
        if (Array.isArray(list)) {
          this.assignments = list.map(item => ({
            id: item.id,
            title: item.title,
            batch: item.batchName || item.batch || 'Assigned Batch',
            batchName: item.batchName || item.batch || 'Assigned Batch',
            batchId: item.batchId,
            courseName: item.courseName || '',
            dueDate: item.dueDate,
            marks: item.marks || 50,
            description: item.description || '',
            submissions: item.submissions ?? 0,
            totalStudents: item.totalStudents ?? 0,
            fileName: item.originalFileName || item.fileName || 'Assignment_Brief.pdf',
            originalFileName: item.originalFileName,
            filePath: item.filePath,
            status: 'Active'
          }));
        } else {
          this.assignments = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load assignments', err);
        this.assignments = [];
      }
    });
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.newAssignment = {
        title: '',
        batchId: this.batches[0]?.id || '1',
        description: '',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
        marks: 50
      };
      this.assignmentFile = null;
    }
  }

  onFileSelected(file: File | null) {
    this.assignmentFile = file;
  }

  submitAssignment() {
    if (!this.newAssignment.title?.trim()) {
      this.dialogService.alert('Please enter an assignment title.', 'Validation Error', 'warning');
      return;
    }

    if (!this.newAssignment.batchId) {
      this.dialogService.alert('Please select a target batch.', 'Validation Error', 'warning');
      return;
    }

    const batchObj = this.batches.find(b => b.id === this.newAssignment.batchId);

    const formData = new FormData();
    formData.append('title', this.newAssignment.title.trim());
    formData.append('batchId', this.newAssignment.batchId);
    formData.append('description', this.newAssignment.description || '');
    formData.append('dueDate', this.newAssignment.dueDate || new Date().toISOString());
    formData.append('maxMarks', (this.newAssignment.marks || 50).toString());
    if (this.assignmentFile) {
      formData.append('file', this.assignmentFile);
    }

    this.isSubmitting = true;
    this.http.post<any>(`${environment.apiUrl}/api/teacher/assignments`, formData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.snackBar.open('✓ Assignment published and distributed to students successfully!', 'Dismiss', {
          duration: 3500,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.toggleCreateForm();
        this.loadAssignments();
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err?.error?.message || 'Failed to publish assignment. Please try again.';
        this.dialogService.alert(msg, 'Creation Error', 'danger');
      }
    });
  }

  /**
   * Real browser document download for teacher & student assignment brief
   */
  viewOrDownloadAssignment(item: AssignmentItem) {
    if (!item.id) return;
    this.snackBar.open(`Downloading "${item.title}"...`, undefined, { duration: 2000 });

    const downloadUrl = `${environment.apiUrl}/api/teacher/assignments/download/${item.id}`;
    this.http.get(downloadUrl, { responseType: 'blob', observe: 'response' }).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) return;

        let filename = item.fileName || item.originalFileName || `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '').trim();
          }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download error', err);
        this.snackBar.open('Unable to download assignment document.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  /**
   * Real browser document download for student submission files
   */
  downloadSubmissionFile(submission: StudentSubmissionItem) {
    if (!submission) return;

    if (submission.submissionId) {
      const downloadUrl = `${environment.apiUrl}/api/teacher/assignments/submissions/${submission.submissionId}/download`;
      this.http.get(downloadUrl, { responseType: 'blob', observe: 'response' }).subscribe({
        next: (response) => {
          const blob = response.body;
          if (!blob) return;

          let filename = submission.file || `${submission.name.replace(/\s+/g, '_')}_Submission.pdf`;
          const contentDisposition = response.headers.get('content-disposition');
          if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
            if (matches != null && matches[1]) {
              filename = matches[1].replace(/['"]/g, '').trim();
            }
          }

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Submission download failed', err);
          this.snackBar.open('Could not download submission document.', 'Dismiss', { duration: 2500 });
        }
      });
    } else if (submission.fileUrl) {
      let fullUrl = submission.fileUrl;
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `${environment.apiUrl}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
      }
      window.open(fullUrl, '_blank');
    } else {
      this.snackBar.open('No file attached for this student submission.', 'Dismiss', { duration: 2500 });
    }
  }

  /**
   * Open evaluation modal and dynamically fetch real enrolled students for the assignment's batch
   */
  openGradeModal(assignment: AssignmentItem) {
    this.selectedAssignment = assignment;
    this.showGradeModal = true;
    this.isLoadingSubmissions = true;
    this.studentSubmissions = [];

    this.http.get<any>(`${environment.apiUrl}/api/teacher/assignments/${assignment.id}/submissions`).subscribe({
      next: (res) => {
        this.isLoadingSubmissions = false;
        const payload = res?.data || res;
        const list = Array.isArray(payload?.students) ? payload.students : (Array.isArray(payload) ? payload : []);
        if (payload?.maxMarks && this.selectedAssignment) {
          this.selectedAssignment.marks = payload.maxMarks;
        }
        this.studentSubmissions = list.map((s: any) => ({
          studentId: s.studentId,
          submissionId: s.submissionId,
          rollNo: s.rollNo || 'N/A',
          name: s.name || 'Student',
          submittedAt: s.submittedAt,
          file: s.file,
          fileUrl: s.fileUrl,
          status: s.status || (s.marks != null ? 'Submitted' : 'Pending'),
          marks: s.marks,
          feedback: s.feedback || ''
        }));
      },
      error: (err) => {
        this.isLoadingSubmissions = false;
        console.error('Error fetching submissions for assignment', err);
        this.snackBar.open('Failed to load batch student submissions.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  closeGradeModal() {
    this.showGradeModal = false;
    this.selectedAssignment = null;
    this.studentSubmissions = [];
    this.isLoadingSubmissions = false;
  }

  /**
   * Persist teacher grades and remarks to the database
   */
  saveGrades() {
    if (!this.selectedAssignment) return;

    this.isSavingGrades = true;
    const payload = {
      grades: this.studentSubmissions.map(s => ({
        studentId: s.studentId,
        marks: s.marks !== null && s.marks !== undefined && s.marks !== '' ? Number(s.marks) : null,
        feedback: s.feedback || ''
      }))
    };

    this.http.post<any>(`${environment.apiUrl}/api/teacher/assignments/${this.selectedAssignment.id}/evaluate`, payload).subscribe({
      next: (res) => {
        this.isSavingGrades = false;
        this.dialogService.success('Student evaluation and grades saved successfully!');
        this.closeGradeModal();
        this.loadAssignments(); // Refresh turnout counts dynamically from DB
      },
      error: (err) => {
        this.isSavingGrades = false;
        const msg = err?.error?.message || 'Failed to save evaluation grades. Please try again.';
        this.dialogService.alert(msg, 'Evaluation Error', 'danger');
      }
    });
  }

  deleteAssignment(assignment: AssignmentItem) {
    this.dialogService.delete(`assignment "${assignment.title}"`).subscribe(confirmed => {
      if (confirmed) {
        this.http.delete(`${environment.apiUrl}/api/teacher/assignments/${assignment.id}`).subscribe({
          next: () => {
            this.assignments = this.assignments.filter(a => a.id !== assignment.id);
            this.dialogService.success('Assignment deleted successfully!');
          },
          error: (err) => {
            const msg = err?.error?.message || 'Failed to delete assignment.';
            this.dialogService.alert(msg, 'Delete Error', 'danger');
          }
        });
      }
    });
  }
}
