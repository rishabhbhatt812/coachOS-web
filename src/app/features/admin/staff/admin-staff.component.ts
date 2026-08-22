import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ChangeDetectorRef } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-admin-staff',
  standalone: true,
  imports: [
    CommonModule,
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
  }

  initForm() {
    this.staffForm = this.fb.group({
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

  handleRoleValidators(roleId: string) {
    const isTeacherRole = this.isTeacherRoleId(roleId);
    const subExpCtrl = this.staffForm.get('subjectExpertise');
    const teacherTypeCtrl = this.staffForm.get('teacherType');

    if (isTeacherRole) {
      subExpCtrl?.setValidators([Validators.required]);
      teacherTypeCtrl?.setValidators([Validators.required]);
    } else {
      subExpCtrl?.clearValidators();
      teacherTypeCtrl?.clearValidators();
    }
    subExpCtrl?.updateValueAndValidity();
    teacherTypeCtrl?.updateValueAndValidity();
  }

  isTeacherRoleId(roleId: string): boolean {
    const role = this.roles.find(r => r.id === roleId);
    return role?.code === 'TEACHER';
  }

  isTeacherSelected(): boolean {
    const roleId = this.staffForm.get('roleId')?.value;
    return this.isTeacherRoleId(roleId);
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

      // Map empty strings to null or keep appropriate value
      const payload = {
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
