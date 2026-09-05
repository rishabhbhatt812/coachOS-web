import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../core/constants/api-endpoints';
import { AuthFacade } from '../../../../core/facades/auth.facade';
import { DialogService } from '../../../../core/services/dialog.service';

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
  private authFacade = inject(AuthFacade);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private dialogService = inject(DialogService);

  showWizard = false;
  isLoading = false;
  teachers: any[] = [];
  subjects: any[] = [];
  activeTab = 0;
  photoPreviewUrl: string | null = null;
  showPassword = false;

  // Subjects multi-select search
  subjectSearchText = '';

  // Interactive View Modal
  showViewModal = false;
  selectedTeacherForView: any = null;
  isLoadingTeacherDetails = false;

  isGlobalAdmin = false;
  institutes: any[] = [];
  selectedInstituteFilter = 'all';

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

  columns: TableColumn[] = [
    { key: 'fullName', header: 'Teacher Name', clickable: true },
    { key: 'staffCode', header: 'Staff Code' },
    { key: 'email', header: 'Email' },
    { key: 'mobile', header: 'Mobile' },
    { key: 'subjectsList', header: 'Assigned Subjects' },
    { key: 'teacherType', header: 'Type' },
    { key: 'statusBadge', header: 'Status', type: 'badge', badgeColorMap: { 'Active': 'green', 'Inactive': 'red' } },
    { key: 'actions', header: 'Actions', type: 'action' }
  ];

  genders = ['Male', 'Female', 'Other'];
  maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
  teacherTypes = ['Full Time', 'Part Time', 'Guest Faculty'];
  documentTypes = ['Aadhaar', 'PAN', 'Resume', 'Certificate', 'Other'];

  ngOnInit() {
    this.loadTeachers();
    this.loadSubjects();
    this.initForm();

    this.authFacade.currentUser$.subscribe(user => {
      if (user) {
        const rawRole = user.rawRole || '';
        this.isGlobalAdmin = rawRole === 'GLOBAL_ADMIN' || rawRole === 'SUPER_ADMIN';
        if (this.isGlobalAdmin) {
          if (!this.columns.some(c => c.key === 'instituteName')) {
            this.columns.splice(2, 0, { key: 'instituteName', header: 'Coaching Center' });
          }
          if (this.institutes.length === 0) {
            this.loadInstitutes();
          }
        }
      }
    });
  }

  loadInstitutes() {
    this.authFacade.getGlobalInstitutes().subscribe({
      next: (res) => {
        this.institutes = Array.isArray(res) ? res : [];
      },
      error: (err) => console.error('Failed to load institutes:', err)
    });
  }

  getFilteredTeachers(): any[] {
    if (!this.isGlobalAdmin || this.selectedInstituteFilter === 'all') {
      return this.teachers;
    }
    return this.teachers.filter(t => t.instituteId === this.selectedInstituteFilter);
  }

  initForm() {
    this.teacherForm = this.fb.group({
      instituteId: [''],
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

  // --- Assigned Subjects Multi-Select Helpers ---
  isSubjectSelected(id: string): boolean {
    const selected: string[] = this.teacherForm.get('subjectIds')?.value || [];
    return selected.includes(id);
  }

  toggleSubject(id: string) {
    const current: string[] = this.teacherForm.get('subjectIds')?.value || [];
    let updated: string[];
    if (current.includes(id)) {
      updated = current.filter(x => x !== id);
    } else {
      updated = [...current, id];
    }
    this.teacherForm.get('subjectIds')?.setValue(updated);
    this.teacherForm.get('subjectIds')?.markAsDirty();
    this.teacherForm.get('subjectIds')?.markAsTouched();
    this.teacherForm.get('subjectIds')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  selectAllSubjects() {
    const filtered = this.getFilteredSubjects();
    const current: string[] = this.teacherForm.get('subjectIds')?.value || [];
    const set = new Set([...current, ...filtered.map(s => s.id)]);
    this.teacherForm.get('subjectIds')?.setValue(Array.from(set));
    this.teacherForm.get('subjectIds')?.markAsDirty();
    this.teacherForm.get('subjectIds')?.markAsTouched();
    this.teacherForm.get('subjectIds')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  clearAllSubjects() {
    this.teacherForm.get('subjectIds')?.setValue([]);
    this.teacherForm.get('subjectIds')?.markAsDirty();
    this.teacherForm.get('subjectIds')?.markAsTouched();
    this.teacherForm.get('subjectIds')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  getFilteredSubjects(): any[] {
    if (!this.subjectSearchText || !this.subjectSearchText.trim()) return this.subjects;
    const term = this.subjectSearchText.toLowerCase().trim();
    return this.subjects.filter(s =>
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.code && s.code.toLowerCase().includes(term))
    );
  }

  getSelectedSubjects(): any[] {
    const ids: string[] = this.teacherForm.get('subjectIds')?.value || [];
    return this.subjects.filter(s => ids.includes(s.id));
  }

  // --- View Details Modal ---
  openTeacherDetails(teacher: any) {
    this.selectedTeacherForView = { ...teacher };
    this.showViewModal = true;
    this.isLoadingTeacherDetails = true;
    this.cdr.detectChanges();

    this.http.get<any>(`${environment.apiUrl}/api/admin/teachers/${teacher.id}`).subscribe({
      next: (res) => {
        this.isLoadingTeacherDetails = false;
        if (res && res.data) {
          this.selectedTeacherForView = res.data;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingTeacherDetails = false;
        console.warn('Using cached teacher details due to API error:', err);
        this.cdr.detectChanges();
      }
    });
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedTeacherForView = null;
    this.cdr.detectChanges();
  }

  // --- Delete Teacher ---
  deleteTeacher(teacher: any) {
    const teacherName = teacher.fullName || 'this teacher';
    this.dialogService.delete(teacherName, `Are you sure you want to delete teacher "${teacherName}"? This will deactivate their login and unlink assigned subjects.`).subscribe(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        this.http.delete<any>(`${environment.apiUrl}/api/admin/teachers/${teacher.id}`).subscribe({
          next: () => {
            this.isLoading = false;
            this.dialogService.success(`Teacher "${teacherName}" has been successfully deleted.`);
            if (this.showViewModal) {
              this.closeViewModal();
            }
            this.loadTeachers();
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Failed to delete teacher:', err);
            this.dialogService.error(err.error?.message || 'Failed to delete teacher.');
          }
        });
      }
    });
  }

  onActionClicked(event: any) {
    if (event.action === 'view') {
      this.openTeacherDetails(event.row);
    } else if (event.action === 'delete') {
      this.deleteTeacher(event.row);
    } else if (event.action === 'edit') {
      this.openTeacherDetails(event.row);
    }
  }

  onRowClicked(row: any) {
    this.openTeacherDetails(row);
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
    this.showPassword = false;
    this.subjectSearchText = '';
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
            staffCode: t.staffCode || 'STF-NA',
            teacherType: t.teacherType || 'Full Time',
            statusBadge: t.isActive ? 'Active' : 'Inactive',
            subjectsList: t.subjects && t.subjects.length > 0
              ? t.subjects.map((s: any) => s.subjectName || s.name || '').filter((name: any) => !!name).join(', ')
              : 'None assigned'
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
        this.cdr.detectChanges();
      }
    });
  }

  loadSubjects() {
    this.http.get<any>(`${environment.apiUrl}/api/admin/Subjects`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.subjects = res.data.data || res.data;
        } else if (Array.isArray(res)) {
          this.subjects = res;
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
      Object.keys(this.teacherForm.controls).forEach(key => {
        this.teacherForm.get(key)?.markAsTouched();
      });
      return;
    }

    const payload = {
      ...this.teacherForm.value,
      instituteId: this.teacherForm.value.instituteId || undefined,
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
