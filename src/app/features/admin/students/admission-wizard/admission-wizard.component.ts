import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { AdmissionsService } from '../../../../core/services/admissions.service';
import { CourseFacade } from '../../../../core/facades/course.facade';
import { BatchFacade } from '../../../../core/facades/batch.facade';

@Component({
  selector: 'app-admission-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './admission-wizard.component.html',
  styleUrls: ['./admission-wizard.component.scss']
})
export class AdmissionWizardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private admissionsService = inject(AdmissionsService);
  private courseFacade = inject(CourseFacade);
  private batchFacade = inject(BatchFacade);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  courses$ = this.courseFacade.courses$;
  batches$ = this.batchFacade.batches$;

  studentForm!: FormGroup;
  parentForm!: FormGroup;
  academicForm!: FormGroup;
  feeForm!: FormGroup;

  ngOnInit() {
    this.courseFacade.loadCourses();
    this.batchFacade.loadBatches();

    this.studentForm = this.fb.group({
      studentCode: ['', Validators.required],
      fullName: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', Validators.email],
      dateOfBirth: ['', Validators.required],
      admissionDate: [new Date(), Validators.required],
      admissionType: ['Permanent', Validators.required],
      demoDurationDays: [null]
    });

    // Fetch initial student code for Permanent Admission
    this.fetchNextStudentCode('STU');

    this.studentForm.get('admissionType')?.valueChanges.subscribe(type => {
      const prefix = type === 'Demo' ? 'DEMO' : 'STU';
      this.fetchNextStudentCode(prefix);

      const demoDaysControl = this.studentForm.get('demoDurationDays');
      if (type === 'Demo') {
        demoDaysControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        demoDaysControl?.clearValidators();
        demoDaysControl?.setValue(null);
      }
      demoDaysControl?.updateValueAndValidity();
    });

    this.parentForm = this.fb.group({
      parentName: ['', Validators.required],
      parentMobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      parentEmail: ['', Validators.email],
      parentOccupation: [''],
      parentRelationship: ['Parent', Validators.required]
    });

    this.academicForm = this.fb.group({
      courseId: ['', Validators.required],
      batchId: ['', Validators.required]
    });

    this.feeForm = this.fb.group({
      totalFee: [0, [Validators.required, Validators.min(1)]],
      discountAmount: [0, Validators.min(0)],
      planType: ['Installments', Validators.required],
      initialPaymentAmount: [0, Validators.min(0)],
      paymentMode: ['Cash']
    });
  }

  private fetchNextStudentCode(prefix: string) {
    this.admissionsService.getNextStudentCode(prefix).subscribe({
      next: (res) => {
        let code = '';
        if (typeof res === 'string') {
          code = res;
        } else if (res && typeof res === 'object') {
          code = res.data || res.code || (res.success && res.data ? res.data : '');
        }

        if (code) {
          this.studentForm.get('studentCode')?.setValue(code);
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error fetching student code:', err)
    });
  }

  onStudentCodeBlur() {
    const val = this.studentForm.get('studentCode')?.value || '';
    if (val && !val.includes('-')) {
      this.fetchNextStudentCode(val);
    }
  }

  submitAdmission() {
    if (this.studentForm.valid && this.parentForm.valid && this.academicForm.valid && this.feeForm.valid) {
      
      const formatDate = (val: any): string => {
        if (!val) return '';
        const dateObj = val instanceof Date ? val : new Date(val);
        if (isNaN(dateObj.getTime())) return '';
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const payload = {
        ...this.studentForm.value,
        ...this.parentForm.value,
        ...this.academicForm.value,
        dateOfBirth: formatDate(this.studentForm.value.dateOfBirth),
        admissionDate: formatDate(this.studentForm.value.admissionDate),
        admissionType: this.studentForm.value.admissionType,
        demoDurationDays: this.studentForm.value.demoDurationDays,
        totalFee: this.feeForm.value.totalFee,
        discountAmount: this.feeForm.value.discountAmount,
        planType: this.feeForm.value.planType,
        installments: [
          {
            installmentNo: 1,
            dueDate: formatDate(new Date()),
            amount: this.feeForm.value.totalFee - this.feeForm.value.discountAmount
          }
        ],
        initialPayment: this.feeForm.value.initialPaymentAmount > 0 ? {
          amount: this.feeForm.value.initialPaymentAmount,
          paymentMode: this.feeForm.value.paymentMode,
          transactionNo: ''
        } : null
      };

      this.admissionsService.fullAdmission(payload).subscribe({
        next: (res) => {
          this.snackBar.open('Student admission completed successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/students/profile', res.studentId]);
        },
        error: (err) => {
          this.snackBar.open('Error during admission. Please check inputs.', 'Close', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }
}
