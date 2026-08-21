import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload';

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
    FormsModule,
    FileUploadComponent
  ],
  templateUrl: './teacher-assignments.html',
  styleUrl: './teacher-assignments.scss',
})
export class TeacherAssignments {
  showCreateForm = false;

  assignments = [
    {
      id: 'a1',
      title: 'Algebra Equations & Quadratic Functions',
      batch: 'Class 10 - Mathematics (Morning)',
      batchId: '1',
      dueDate: '2026-05-15',
      marks: 50,
      description: 'Solve problems 1 to 25 from Exercise 4.2 with full step-by-step proofs.',
      submissions: 32,
      totalStudents: 45,
      fileName: 'Algebra_Problem_Set_1.pdf'
    },
    {
      id: 'a2',
      title: 'Newton Laws of Motion & Friction Worksheet',
      batch: 'Class 12 - Physics Crash Course',
      batchId: '2',
      dueDate: '2026-05-20',
      marks: 100,
      description: 'Complete the numericals on inclined planes, pulley systems, and tension forces.',
      submissions: 28,
      totalStudents: 30,
      fileName: 'Physics_Unit2_Worksheet.pdf'
    },
    {
      id: 'a3',
      title: 'Chemical Reactions & Balancing Equations',
      batch: 'Foundation Batch - Chemistry & Science',
      batchId: '3',
      dueDate: '2026-05-25',
      marks: 25,
      description: 'Balance all redox and precipitation equations provided in chapter notes.',
      submissions: 24,
      totalStudents: 29,
      fileName: 'Chemistry_Balancing_Ex.pdf'
    }
  ];

  newAssignment: any = {
    title: '',
    batchId: '1',
    description: '',
    dueDate: new Date().toISOString().substring(0, 10),
    marks: 50
  };
  assignmentFile: File | null = null;

  batches = [
    { id: '1', name: 'Class 10 - Mathematics (Morning)' },
    { id: '2', name: 'Class 12 - Physics Crash Course' },
    { id: '3', name: 'Foundation Batch - Chemistry & Science' }
  ];

  // Grading Modal State
  showGradeModal = false;
  selectedAssignment: any = null;
  studentSubmissions: any[] = [];

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.newAssignment = {
        title: '',
        batchId: '1',
        description: '',
        dueDate: new Date().toISOString().substring(0, 10),
        marks: 50
      };
      this.assignmentFile = null;
    }
  }

  onFileSelected(file: File | null) {
    this.assignmentFile = file;
  }

  submitAssignment() {
    if (!this.newAssignment.title) {
      alert('Please enter an assignment title.');
      return;
    }

    const batchObj = this.batches.find(b => b.id === this.newAssignment.batchId);

    const created = {
      id: 'a' + (this.assignments.length + 1),
      title: this.newAssignment.title,
      batch: batchObj?.name || 'Class 10 - Mathematics',
      batchId: this.newAssignment.batchId,
      dueDate: this.newAssignment.dueDate || '2026-06-01',
      marks: this.newAssignment.marks || 50,
      description: this.newAssignment.description || '',
      submissions: 0,
      totalStudents: 35,
      fileName: this.assignmentFile?.name || 'Assignment_Document.pdf'
    };

    this.assignments.unshift(created);
    alert('✓ Assignment created and assigned to batch students successfully!');
    this.toggleCreateForm();
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
    alert('✓ Student grades and teacher feedback have been saved successfully!');
    this.closeGradeModal();
  }

  deleteAssignment(assignment: any) {
    if (confirm(`Are you sure you want to delete assignment "${assignment.title}"?`)) {
      this.assignments = this.assignments.filter(a => a.id !== assignment.id);
    }
  }
}
