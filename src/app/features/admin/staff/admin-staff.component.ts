import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { StaffService } from '../../../core/services/staff.service';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { environment } from '../../../core/constants/api-endpoints';
import { ChangeDetectorRef } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-admin-staff',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    DataTableComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-staff.component.html',
  styleUrls: ['./admin-staff.component.scss']
})
export class AdminStaffComponent implements OnInit {
  private staffService = inject(StaffService);
  private authFacade = inject(AuthFacade);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private dialogService = inject(DialogService);

  staff: any[] = [];
  branches: any[] = [];
  roles: any[] = [];
  isLoading = false;
  showForm = false;
  editingId: string | null = null;
  staffForm!: FormGroup;

  isGlobalAdmin = false;
  institutes: any[] = [];
  selectedInstituteFilter = 'all';

  columns: TableColumn[] = [
    { key: 'fullName', header: 'Full Name' },
    { key: 'roleName', header: 'Role' },
    { key: 'branchName', header: 'Branch' },
    { key: 'email', header: 'Email' },
    { key: 'mobileNumber', header: 'Mobile Number' },
    { key: 'staffCode', header: 'Staff Code' },
    { key: 'staffType', header: 'Staff Type' },
    { key: 'isActive', header: 'Status', type: 'badge', badgeColorMap: { 'true': 'green', 'false': 'red', 'Active': 'green', 'Inactive': 'red' } },
    { key: 'actions', header: 'Actions', type: 'action' }
  ];

  ngOnInit() {
    this.initForm();
    this.loadRoles();
    this.loadBranches();
    this.loadStaff();

    this.authFacade.currentUser$.subscribe(user => {
      if (user) {
        const rawRole = user.rawRole || '';
        this.isGlobalAdmin = rawRole === 'GLOBAL_ADMIN' || rawRole === 'SUPER_ADMIN';
        if (this.isGlobalAdmin) {
          if (!this.columns.some(c => c.key === 'instituteName')) {
            this.columns.splice(1, 0, { key: 'instituteName', header: 'Coaching Center' });
          }
          this.loadInstitutes();
        }
      }
    });
  }

  loadInstitutes() {
    this.http.get<any>(`${environment.apiUrl}/api/admin/GlobalAdmin/institutes`).subscribe({
      next: (res) => {
        this.institutes = Array.isArray(res) ? res : (res?.data || []);
      },
      error: (err) => console.error('Failed to load institutes:', err)
    });
  }

  getFilteredStaff(): any[] {
    if (!this.isGlobalAdmin || this.selectedInstituteFilter === 'all') {
      return this.staff;
    }
    return this.staff.filter(s => s.instituteId === this.selectedInstituteFilter);
  }

  initForm() {
    this.staffForm = this.fb.group({
      instituteId: [''],
      fullName: ['', [Validators.required]],
      email: ['', [Validators.email]],
      mobileNumber: ['', [Validators.pattern('^[0-9]{10}$')]],
      roleId: ['', [Validators.required]],
      branchId: ['', [Validators.required]],
      staffCode: [''],
      staffType: ['Full-Time', [Validators.required]],
      joiningDate: [new Date(), [Validators.required]],
      designation: [''],
      department: [''],
      qualification: [''],
      experienceYears: [0, [Validators.min(0)]],
      address: [''],
      emergencyContactName: [''],
      emergencyContactNumber: ['', [Validators.pattern('^[0-9]{10}$')]],
      isActive: [true],

      // Teacher-specific fields
      subjectExpertise: [''],
      teacherType: ['Permanent'],
      teachingExperienceYears: [0],
      bio: ['']
    });

    // Listen to role changes to add/remove validators for teacher fields
    this.staffForm.get('roleId')?.valueChanges.subscribe((roleId) => {
      this.handleRoleValidators(roleId);
    });
  }

  isTeacherSelected(): boolean {
    const selectedRole = this.roles.find(r => r.id === this.staffForm.get('roleId')?.value);
    return selectedRole?.code === 'TEACHER';
  }

  handleRoleValidators(roleId: string) {
    const selectedRole = this.roles.find(r => r.id === roleId);
    const isTeacher = selectedRole?.code === 'TEACHER';

    const subjectExpertiseControl = this.staffForm.get('subjectExpertise');
    const teacherTypeControl = this.staffForm.get('teacherType');

    if (isTeacher) {
      subjectExpertiseControl?.setValidators([Validators.required]);
      teacherTypeControl?.setValidators([Validators.required]);
    } else {
      subjectExpertiseControl?.clearValidators();
      teacherTypeControl?.clearValidators();
    }

    subjectExpertiseControl?.updateValueAndValidity();
    teacherTypeControl?.updateValueAndValidity();
  }

  loadRoles() {
    this.staffService.getRoles().subscribe({
      next: (res) => {
        this.roles = Array.isArray(res) ? res : (res?.data || []);
      },
      error: (err) => console.error('Failed to load roles:', err)
    });
  }

  loadBranches() {
    this.staffService.getBranches().subscribe({
      next: (res) => {
        this.branches = Array.isArray(res) ? res : (res?.data || []);
      },
      error: (err) => console.error('Failed to load branches:', err)
    });
  }

  loadStaff() {
    this.isLoading = true;
    this.staffService.getAllStaff().subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : (res?.data || []);
        this.staff = data.map((s: any) => ({
          ...s,
          isActive: s.isActive ? 'Active' : 'Inactive'
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load staff:', err);
        this.isLoading = false;
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingId = null;
      this.staffForm.reset({
        staffType: 'Full-Time',
        joiningDate: new Date(),
        experienceYears: 0,
        isActive: true,
        teacherType: 'Permanent',
        teachingExperienceYears: 0
      });
    }
  }

  onSubmit() {
    if (this.staffForm.valid) {
      this.isLoading = true;
      const formValue = this.staffForm.value;

      const payload = {
        instituteId: formValue.instituteId || undefined,
        fullName: formValue.fullName,
        email: formValue.email || null,
        mobileNumber: formValue.mobileNumber || null,
        roleId: formValue.roleId,
        branchId: formValue.branchId,
        staffCode: formValue.staffCode || null,
        staffType: formValue.staffType,
        joiningDate: formValue.joiningDate,
        designation: formValue.designation || null,
        department: formValue.department || null,
        qualification: formValue.qualification || null,
        experienceYears: formValue.experienceYears || 0,
        address: formValue.address || null,
        emergencyContactName: formValue.emergencyContactName || null,
        emergencyContactNumber: formValue.emergencyContactNumber || null,
        isActive: formValue.isActive,

        // Teacher fields
        subjectExpertise: this.isTeacherSelected() ? (formValue.subjectExpertise || null) : null,
        teacherType: this.isTeacherSelected() ? (formValue.teacherType || null) : null,
        teachingExperienceYears: this.isTeacherSelected() ? (formValue.teachingExperienceYears || 0) : 0,
        bio: this.isTeacherSelected() ? (formValue.bio || null) : null
      };

      if (this.editingId) {
        this.staffService.updateStaff(this.editingId, payload).subscribe({
          next: () => {
            this.snackBar.open('Staff updated successfully!', 'Dismiss', { duration: 3000 });
            this.toggleForm();
            this.loadStaff();
            this.isLoading = false;
          },
          error: (err) => {
            const msg = err.error?.message || 'Failed to update staff.';
            this.snackBar.open(msg, 'Dismiss', { duration: 5000 });
            this.isLoading = false;
          }
        });
      } else {
        this.staffService.createStaff(payload).subscribe({
          next: (res) => {
            const tempPasswordText = res.message || '';
            this.snackBar.open('Staff created successfully! ' + tempPasswordText, 'Dismiss', { duration: 10000 });
            this.toggleForm();
            this.loadStaff();
            this.isLoading = false;
          },
          error: (err) => {
            const msg = err.error?.message || 'Failed to create staff.';
            this.snackBar.open(msg, 'Dismiss', { duration: 5000 });
            this.isLoading = false;
          }
        });
      }
    }
  }

  onActionClicked(event: any) {
    if (event.action === 'edit') {
      this.editingId = event.row.id;
      
      const sp = event.row.staffProfile || {};
      const tp = event.row.teacherProfile || {};

      this.staffForm.patchValue({
        fullName: event.row.fullName,
        email: event.row.email,
        mobileNumber: event.row.mobileNumber,
        roleId: event.row.roleId,
        branchId: event.row.branchId,
        staffCode: sp.staffCode,
        staffType: sp.staffType || 'Full-Time',
        joiningDate: sp.joiningDate ? new Date(sp.joiningDate) : new Date(),
        designation: sp.designation,
        department: sp.department,
        qualification: sp.qualification,
        experienceYears: sp.experienceYears || 0,
        address: sp.address,
        emergencyContactName: sp.emergencyContactName,
        emergencyContactNumber: sp.emergencyContactNumber,
        isActive: event.row.isActive === 'Active',

        // Teacher fields
        subjectExpertise: tp.subjectExpertise || '',
        teacherType: tp.teacherType || 'Permanent',
        teachingExperienceYears: tp.teachingExperienceYears || 0,
        bio: tp.bio || ''
      });

      this.showForm = true;
    } else if (event.action === 'delete') {
      this.dialogService.delete(event.row.fullName ? `staff member: ${event.row.fullName}` : 'Staff').subscribe(confirmed => {
        if (confirmed) {
          this.isLoading = true;
          this.staffService.deleteStaff(event.row.id).subscribe({
            next: () => {
              this.dialogService.success('Staff deleted successfully!');
              this.loadStaff();
              this.isLoading = false;
            },
            error: (err) => {
              const msg = err.error?.message || 'Failed to delete staff.';
              this.dialogService.error(msg);
              this.isLoading = false;
            }
          });
        }
      });
    }
  }
}
