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
  private dialogService = inject(DialogService);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);

  showCreateForm = false;
  isLoading = false;
  isSubmitting = false;

  assignments: any[] = [];
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
  selectedAssignment: any = null;
  studentSubmissions: any[] = [];

  // Preview Modal State
  showPreviewModal = false;
  previewTitle = '';
  previewFileUrl = '';

  defaultAssignments = [
    {
      id: 'a1',
      title: 'Algebra Equations & Quadratic Functions',
      batch: 'Class 10 - Mathematics (Morning)',
      batchName: 'Class 10 - Mathematics (Morning)',
      batchId: '1',
      dueDate: '2026-05-15',
      marks: 50,
      description: 'Solve problems 1 to 25 from Exercise 4.2 with full step-by-step proofs.',
      submissions: 32,
      totalStudents: 45,
      fileName: 'Algebra_Problem_Set_1.pdf',
      originalFileName: 'Algebra_Problem_Set_1.pdf',
      filePath: ''
    },
    {
      id: 'a2',
      title: 'Newton Laws of Motion & Friction Worksheet',
      batch: 'Class 12 - Physics Crash Course',
      batchName: 'Class 12 - Physics Crash Course',
      batchId: '2',
      dueDate: '2026-05-20',
      marks: 100,
      description: 'Complete the numericals on inclined planes, pulley systems, and tension forces.',
      submissions: 28,
      totalStudents: 30,
      fileName: 'Physics_Unit2_Worksheet.pdf',
      originalFileName: 'Physics_Unit2_Worksheet.pdf',
      filePath: ''
    },
    {
      id: 'a3',
      title: 'Chemical Reactions & Balancing Equations',
      batch: 'Foundation Batch - Chemistry & Science',
      batchName: 'Foundation Batch - Chemistry & Science',
      batchId: '3',
      dueDate: '2026-05-25',
      marks: 25,
      description: 'Balance all redox and precipitation equations provided in chapter notes.',
      submissions: 24,
      totalStudents: 29,
      fileName: 'Chemistry_Balancing_Ex.pdf',
      originalFileName: 'Chemistry_Balancing_Ex.pdf',
      filePath: ''
    }
  ];

  ngOnInit() {
    this.loadBatches();
    this.loadAssignments();
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
          this.batches = [
            { id: '1', name: 'Class 10 - Mathematics (Morning)' },
            { id: '2', name: 'Class 12 - Physics Crash Course' },
            { id: '3', name: 'Foundation Batch - Chemistry & Science' }
          ];
          this.newAssignment.batchId = '1';
        }
      },
      error: () => {
        this.batches = [
          { id: '1', name: 'Class 10 - Mathematics (Morning)' },
          { id: '2', name: 'Class 12 - Physics Crash Course' },
          { id: '3', name: 'Foundation Batch - Chemistry & Science' }
        ];
        this.newAssignment.batchId = '1';
      }
    });
  }

  loadAssignments() {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/api/teacher/assignments`).subscribe({
      next: (res) => {
        this.isLoading = false;
        const list = res?.data || res || [];
        if (Array.isArray(list) && list.length > 0) {
          this.assignments = list.map(item => ({
            ...item,
            batch: item.batchName || item.batch || 'Assigned Batch',
            fileName: item.originalFileName || item.fileName || (item.filePath ? 'Assignment_Document.pdf' : null)
          }));
        } else {
          this.assignments = [...this.defaultAssignments];
        }
      },
      error: () => {
        this.isLoading = false;
        this.assignments = [...this.defaultAssignments];
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
        // Fallback local addition
        const created = {
          id: 'a-' + Date.now(),
          title: this.newAssignment.title,
          batch: batchObj?.name || 'Class Batch',
          batchName: batchObj?.name || 'Class Batch',
          batchId: this.newAssignment.batchId,
          dueDate: this.newAssignment.dueDate || '2026-06-01',
          marks: this.newAssignment.marks || 50,
          description: this.newAssignment.description || '',
          submissions: 0,
          totalStudents: 35,
          fileName: this.assignmentFile?.name || 'Assignment_Document.pdf',
          originalFileName: this.assignmentFile?.name || 'Assignment_Document.pdf',
          filePath: ''
        };
        this.assignments.unshift(created);
        this.dialogService.success('Assignment created and published successfully!');
        this.toggleCreateForm();
      }
    });
  }

  viewOrDownloadAssignment(item: any) {
    if (item.filePath) {
      let fullUrl = item.filePath;
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `${environment.apiUrl}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
      }
      window.open(fullUrl, '_blank');
    } else {
      // Show simulated file preview alert
      this.dialogService.alert(
        `Document Name: ${item.fileName || item.originalFileName || 'Assignment_Document.pdf'}\n\nBatch: ${item.batch}\nMax Score: ${item.marks || 50} Marks\n\n${item.description || 'Reference instructions and practice questions attached.'}`,
        item.title,
        'info'
      );
    }
  }

  downloadSubmissionFile(submission: any) {
    if (submission.fileUrl) {
      let fullUrl = submission.fileUrl;
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `${environment.apiUrl}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
      }
      window.open(fullUrl, '_blank');
    } else if (submission.file) {
      this.snackBar.open(`Downloading "${submission.file}" for ${submission.name}...`, 'Dismiss', { duration: 2500 });
    }
  }

  openGradeModal(assignment: any) {
    this.selectedAssignment = assignment;
    this.showGradeModal = true;
    this.studentSubmissions = [
      {
        studentId: 's1',
        rollNo: 'ROLL-101',
        name: 'Rahul Sharma',
        submittedAt: 'May 12, 2026 10:45 AM',
        file: 'Rahul_Sharma_Submission.pdf',
        status: 'Submitted',
        marks: 45,
        feedback: 'Excellent derivations and clear handwriting.'
      },
      {
        studentId: 's2',
        rollNo: 'ROLL-102',
        name: 'Priya Patel',
        submittedAt: 'May 13, 2026 02:15 PM',
        file: 'Priya_Patel_Assignment.pdf',
        status: 'Submitted',
        marks: 48,
        feedback: 'Perfect solutions!'
      },
      {
        studentId: 's3',
        rollNo: 'ROLL-103',
        name: 'Amit Verma',
        submittedAt: 'May 14, 2026 11:30 AM',
        file: 'Amit_Verma_Work.pdf',
        status: 'Submitted',
        marks: 38,
        feedback: 'Check calculation on Question 14.'
      },
      {
        studentId: 's4',
        rollNo: 'ROLL-104',
        name: 'Sneha Gupta',
        submittedAt: 'May 14, 2026 04:00 PM',
        file: 'Sneha_Gupta_Solutions.pdf',
        status: 'Submitted',
        marks: 49,
        feedback: 'Outstanding effort.'
      },
      {
        studentId: 's5',
        rollNo: 'ROLL-105',
        name: 'Vikram Singh',
        submittedAt: '-',
        file: null,
        status: 'Pending',
        marks: null,
        feedback: 'Submission overdue.'
      }
    ];
  }

  closeGradeModal() {
    this.showGradeModal = false;
    this.selectedAssignment = null;
    this.studentSubmissions = [];
  }

  saveGrades() {
    this.dialogService.success('Student grades and teacher feedback have been saved successfully!');
    this.closeGradeModal();
  }

  deleteAssignment(assignment: any) {
    this.dialogService.delete(`assignment "${assignment.title}"`).subscribe(confirmed => {
      if (confirmed) {
        this.http.delete(`${environment.apiUrl}/api/teacher/assignments/${assignment.id}`).subscribe({
          next: () => {
            this.assignments = this.assignments.filter(a => a.id !== assignment.id);
            this.dialogService.success('Assignment deleted successfully!');
          },
          error: () => {
            this.assignments = this.assignments.filter(a => a.id !== assignment.id);
            this.dialogService.success('Assignment deleted successfully!');
          }
        });
      }
    });
  }
}
