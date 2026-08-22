import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../core/constants/api-endpoints';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-admin-teachers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTabsModule,
    MatSnackBarModule,
    PageHeaderComponent,
    DataTableComponent
  ],
  templateUrl: './admin-teachers.component.html',
  styleUrls: ['./admin-teachers.component.scss']
})
export class AdminTeachersComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  showWizard = false;
  isLoading = false;
  teachers: any[] = [];
  subjects: any[] = [];
  activeTab = 0;
  photoPreviewUrl: string | null = null;

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreviewUrl = e.target?.result as string;
        this.teacherForm.patchValue({ profilePhotoPath: this.photoPreviewUrl });
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.photoPreviewUrl = null;
    this.teacherForm.patchValue({ profilePhotoPath: '' });
    this.cdr.detectChanges();
  }

  teacherForm!: FormGroup;

  // Qualifications list
  qualificationsList: any[] = [];
  tempQual = {
    qualification: '',
    specialization: '',
    university: '',
    passingYear: null as number | null,
    percentageOrCGPA: '',
    certificateFilePath: ''
  };

  // Documents list
  documentsList: any[] = [];
  tempDoc = {
    documentType: 'Aadhaar',
    fileName: '',
    filePath: ''
  };

  columns = [
    { key: 'fullName', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'mobile', header: 'Mobile' },
    { key: 'subjectsList', header: 'Subjects' }
  ];

  genders = ['Male', 'Female', 'Other'];
  maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
  teacherTypes = ['Full Time', 'Part Time', 'Guest Faculty'];
  documentTypes = ['Aadhaar', 'PAN', 'Resume', 'Certificate', 'Other'];

  ngOnInit() {
    this.loadTeachers();
    this.loadSubjects();
    this.initForm();
  }

  initForm() {
    this.teacherForm = this.fb.group({
      // Basic Info
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      password: ['Password123', [Validators.required, Validators.minLength(6)]],
      gender: ['Male', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      alternateMobileNumber: ['', [Validators.pattern('^[0-9]{10,15}$')]],
      maritalStatus: ['Single'],
      profilePhotoPath: [''],

      // Address
      currentAddress: ['', [Validators.required]],
      permanentAddress: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      country: ['India', [Validators.required]],

      // Professional
      joiningDate: [new Date().toISOString().split('T')[0], [Validators.required]],
      teacherType: ['Full Time', [Validators.required]],
      department: [''],
      designation: [''],
      experienceYears: [0, [Validators.required, Validators.min(0)]],
      previousInstituteName: [''],

      // Mapping
      subjectIds: [[] as string[], [Validators.required]]
    });
  }

  toggleWizard() {
    this.showWizard = !this.showWizard;

    if (!this.showWizard) {
      this.resetForm();
    }
  }

  resetForm() {
    this.activeTab = 0;
    this.qualificationsList = [];
    this.documentsList = [];
    this.initForm();
    this.resetTempQual();
    this.resetTempDoc();
  }

  resetTempQual() {
    this.tempQual = {
      qualification: '',
      specialization: '',
      university: '',
      passingYear: null,
      percentageOrCGPA: '',
      certificateFilePath: ''
    };
  }

  resetTempDoc() {
    this.tempDoc = {
      documentType: 'Aadhaar',
      fileName: '',
      filePath: ''
    };
  }

  loadTeachers() {
    debugger;
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/api/admin/teachers`).subscribe({
      next: (res) => {
        try {
          let list: any[] = [];
          if (Array.isArray(res)) {
            list = res;
          } else if (res && typeof res === 'object') {
            if (res.success && res.data) {
              if (Array.isArray(res.data)) {
                list = res.data;
              } else if (typeof res.data === 'object' && res.data.id) {
                list = [res.data];
              }
            } else if (res.id) {
              list = [res];
            } else if (res.data && Array.isArray(res.data)) {
              list = res.data;
            }
          }

          this.teachers = list.map((t: any) => ({
            ...t,
            subjectsList: t.subjects ? t.subjects.map((s: any) => s.subjectName || s.name || '').filter((name: any) => !!name).join(', ') : ''
          }));
          
        } catch (e) {
          console.error('Error mapping teachers list:', e);
        } finally {

          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching teachers:', err);
        this.isLoading = false;
      }
    });
  }

  loadSubjects() {
    this.http.get<any>(`${environment.apiUrl}/api/admin/subjects`).subscribe({
      next: (res) => {
        try {
          this.subjects = Array.isArray(res) ? res : (res?.data?.data || res?.data || []);
        } catch (e) {
          console.error('Error mapping subjects list:', e);
        }
      },
      error: (err) => {
        console.error('Error loading subjects:', err);
      }
    });
  }

  addQualification() {
    if (!this.tempQual.qualification || !this.tempQual.university || !this.tempQual.passingYear) {
      this.snackBar.open('Please fill qualification, university and passing year', 'Dismiss', { duration: 3000 });
      return;
    }
    this.qualificationsList.push({ ...this.tempQual });
    this.resetTempQual();
  }

  removeQualification(index: number) {
    this.qualificationsList.splice(index, 1);
  }

  addDocument() {
    if (!this.tempDoc.fileName || !this.tempDoc.filePath) {
      this.snackBar.open('Please enter document name and file path', 'Dismiss', { duration: 3000 });
      return;
    }
    this.documentsList.push({ ...this.tempDoc });
    this.resetTempDoc();
  }

  removeDocument(index: number) {
    this.documentsList.splice(index, 1);
  }

  nextTab() {
    if (this.activeTab < 3) {
      this.activeTab++;
    }
  }

  prevTab() {
    if (this.activeTab > 0) {
      this.activeTab--;
    }
  }

  submitTeacher() {
    if (this.teacherForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly.', 'Close', { duration: 3000 });
      // Touch all controls to show validation
      Object.keys(this.teacherForm.controls).forEach(key => {
        this.teacherForm.get(key)?.markAsTouched();
      });
      return;
    }

    const payload = {
      ...this.teacherForm.value,
      qualifications: this.qualificationsList,
      documents: this.documentsList
    };

    this.http.post<any>(`${environment.apiUrl}/api/admin/teachers`, payload).subscribe({
      next: (res) => {
        this.isLoading = true;
        if (res.isSuccess || res.success) {
          this.snackBar.open('Teacher registered successfully!', 'Close', { duration: 3000 });
          this.toggleWizard();
          this.loadTeachers();
        } else {
          this.snackBar.open(res.message || 'Error registering teacher', 'Close', { duration: 3000 });
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'An error occurred during registration.', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}
