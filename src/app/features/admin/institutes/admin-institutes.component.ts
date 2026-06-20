import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { API_ENDPOINTS, environment } from '../../../core/constants/api-endpoints';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-admin-institutes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PageHeaderComponent,
    DataTableComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-institutes.component.html',
  styleUrl: './admin-institutes.component.scss'
})
export class AdminInstitutesComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  institutes: any[] = [];
  isLoading = false;
  showAddForm = false;
  instituteForm!: FormGroup;
  currentStep = 1;
  subjectsList: string[] = [];
  selectedLogoFile: File | null = null;
  logoError: string | null = null;

  columns: TableColumn[] = [
    { key: 'instituteCode', header: 'Code' },
    { key: 'name', header: 'Coaching Center Name' },
    { key: 'instituteType', header: 'Type' },
    { key: 'planName', header: 'Plan' },
    { key: 'contactPersonName', header: 'Contact Person' },
    { key: 'mobileNumber', header: 'Mobile' },
    { key: 'isActive', header: 'Status', type: 'badge', badgeColorMap: { 'true': 'green', 'false': 'red' } },
    { key: 'actions', header: 'Actions', type: 'action' }
  ];

  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  instituteTypes: string[] = [
    'Coaching Institute', 'School', 'College', 'Training Center', 'Tuition Center'
  ];

  plans = [
    { name: 'Free Trial', students: 100, teachers: 10, isTrial: true },
    { name: 'Basic', students: 500, teachers: 25, isTrial: false },
    { name: 'Standard', students: 2000, teachers: 75, isTrial: false },
    { name: 'Premium', students: 10000, teachers: 250, isTrial: false }
  ];

  currencies: string[] = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD'];

  // Drawer states
  activeInstituteForModules: any = null;
  instituteModules: any[] = [];
  isLoadingModules = false;
  isSavingModules = false;

  ngOnInit() {
    this.loadInstitutes();
    this.initForm();
  }

  onActionClicked(event: { action: string, row: any }) {
    if (event.action === 'modules') {
      this.openModulesDrawer(event.row);
    }
  }

  openModulesDrawer(institute: any) {
    this.activeInstituteForModules = institute;
    this.loadInstituteModules(institute.id);
  }

  closeModulesDrawer() {
    this.activeInstituteForModules = null;
    this.instituteModules = [];
  }

  loadInstituteModules(instituteId: string) {
    this.isLoadingModules = true;
    this.http.get<any>(`${environment.apiUrl}/api/admin/GlobalAdmin/institutes/${instituteId}/modules`).subscribe({
      next: (res) => {
        this.instituteModules = res || [];
        this.isLoadingModules = false;
      },
      error: (err) => {
        console.error('Failed to load institute modules:', err);
        this.isLoadingModules = false;
        this.snackBar.open('Error loading module access settings.', '', { duration: 3000 });
      }
    });
     this.cdr.detectChanges();
  }

  saveInstituteModules() {
    if (!this.activeInstituteForModules) return;
    this.isSavingModules = true;

    const enabledModuleIds = this.instituteModules
      .filter(m => m.isEnabled)
      .map(m => m.moduleId);

    this.http.post<any>(`${environment.apiUrl}/api/admin/GlobalAdmin/institutes/${this.activeInstituteForModules.id}/modules`, enabledModuleIds).subscribe({
      next: () => {
        this.isSavingModules = false;
        this.snackBar.open('Modules saved successfully!', 'Dismiss', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.closeModulesDrawer();
      },
      error: (err) => {
        console.error('Failed to save institute modules:', err);
        this.isSavingModules = false;
        this.snackBar.open('Error saving module access settings.', 'Dismiss', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadInstitutes() {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/api/admin/GlobalAdmin/institutes`).subscribe({
      next: (res) => {
        const data = res || [];
        this.institutes = data.map((item: any) => ({
          ...item,
          isActive: item.isActive ? 'true' : 'false'
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load institutes:', err);
        this.isLoading = false;
        this.snackBar.open('Error loading coaching centers.', 'Dismiss', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  initForm() {
    this.instituteForm = this.fb.group({
      // Step 1: Basic & Academic Details
      instituteCode: ['', [Validators.required, Validators.minLength(2)]],
      instituteName: ['', [Validators.required, Validators.minLength(3)]],
      shortName: [''],
      logo: [''],
      description: [''],
      instituteType: ['Coaching Institute', [Validators.required]],
      establishedYear: [null, [Validators.min(1900), Validators.max(new Date().getFullYear())]],
      academicSessionStartMonth: ['January', [Validators.required]],
      academicSessionEndMonth: ['December', [Validators.required]],

      // Step 2: Contact & Address Information
      contactPersonName: ['', [Validators.required]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      alternateMobileNumber: ['', [Validators.pattern('^[0-9]{10,15}$')]],
      emailAddress: ['', [Validators.required, Validators.email]],
      websiteUrl: ['', [Validators.pattern('^(https?:\\/\\/)?(www\\.)?[a-zA-Z0-9-]+(\\.[a-zA-Z]{2,})+.*$')]],
      addressLine1: ['', [Validators.required]],
      addressLine2: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['India', [Validators.required]],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],

      // Step 3: Owner & Subscription Info
      ownerName: ['', [Validators.required]],
      ownerMobile: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      ownerEmail: ['', [Validators.email]],
      aadhaarNumber: ['', [Validators.pattern('^[0-9]{12}$')]],
      panNumber: ['', [Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],
      gstNumber: [''],
      planName: ['Free Trial', [Validators.required]],
      maxStudentsAllowed: [100, [Validators.required, Validators.min(1)]],
      maxTeachersAllowed: [10, [Validators.required, Validators.min(1)]],
      expiryDate: [new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], [Validators.required]],
      isTrial: [true, [Validators.required]],

      // Step 4: Settings & Security
      smsEnabled: [true],
      emailEnabled: [true],
      whatsAppEnabled: [false],
      currency: ['INR', [Validators.required]],
      password: ['Password123', [Validators.required, Validators.minLength(6)]]
    });

    // Auto-populate values when Plan Name changes
    this.instituteForm.get('planName')?.valueChanges.subscribe(planName => {
      const selectedPlan = this.plans.find(p => p.name === planName);
      if (selectedPlan) {
        this.instituteForm.patchValue({
          maxStudentsAllowed: selectedPlan.students,
          maxTeachersAllowed: selectedPlan.teachers,
          isTrial: selectedPlan.isTrial
        });
      }
    });
  }

  toggleForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.currentStep = 1;
      this.subjectsList = [];
      this.selectedLogoFile = null;
      this.logoError = null;
      this.initForm();
    }
  }

  addSubject(val: string) {
    const trimmed = val.trim();
    if (trimmed && !this.subjectsList.includes(trimmed)) {
      this.subjectsList.push(trimmed);
    }
  }

  removeSubject(index: number) {
    this.subjectsList.splice(index, 1);
  }

  isStepValid(step: number): boolean {
    const controls = this.instituteForm.controls;
    if (step === 1) {
      return controls['instituteCode'].valid &&
             controls['instituteName'].valid &&
             controls['instituteType'].valid &&
             controls['establishedYear'].valid &&
             controls['academicSessionStartMonth'].valid &&
             controls['academicSessionEndMonth'].valid;
    } else if (step === 2) {
      return controls['contactPersonName'].valid &&
             controls['mobileNumber'].valid &&
             controls['alternateMobileNumber'].valid &&
             controls['emailAddress'].valid &&
             controls['websiteUrl'].valid &&
             controls['addressLine1'].valid &&
             controls['city'].valid &&
             controls['state'].valid &&
             controls['country'].valid &&
             controls['pincode'].valid;
    } else if (step === 3) {
      return controls['ownerName'].valid &&
             controls['ownerMobile'].valid &&
             controls['ownerEmail'].valid &&
             controls['aadhaarNumber'].valid &&
             controls['panNumber'].valid &&
             controls['gstNumber'].valid &&
             controls['planName'].valid &&
             controls['maxStudentsAllowed'].valid &&
             controls['maxTeachersAllowed'].valid &&
             controls['expiryDate'].valid &&
             controls['isTrial'].valid;
    } else if (step === 4) {
      return controls['currency'].valid && controls['password'].valid;
    }
    return false;
  }

  nextStep() {
    if (this.isStepValid(this.currentStep)) {
      this.currentStep++;
    } else {
      // Mark all controls in the current step as touched to show validation errors
      this.touchCurrentStepControls();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  touchCurrentStepControls() {
    const controls = this.instituteForm.controls;
    let stepFields: string[] = [];

    if (this.currentStep === 1) {
      stepFields = ['instituteCode', 'instituteName', 'instituteType', 'establishedYear', 'academicSessionStartMonth', 'academicSessionEndMonth'];
    } else if (this.currentStep === 2) {
      stepFields = ['contactPersonName', 'mobileNumber', 'alternateMobileNumber', 'emailAddress', 'websiteUrl', 'addressLine1', 'city', 'state', 'country', 'pincode'];
    } else if (this.currentStep === 3) {
      stepFields = ['ownerName', 'ownerMobile', 'ownerEmail', 'aadhaarNumber', 'panNumber', 'gstNumber', 'planName', 'maxStudentsAllowed', 'maxTeachersAllowed', 'expiryDate', 'isTrial'];
    } else if (this.currentStep === 4) {
      stepFields = ['currency', 'password'];
    }

    stepFields.forEach(field => {
      controls[field]?.markAsTouched();
    });
  }

  onLogoFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.logoError = 'Invalid image type. Please select a JPG, PNG, or WEBP image.';
        this.selectedLogoFile = null;
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.logoError = 'File size too large. Maximum size is 2MB.';
        this.selectedLogoFile = null;
        return;
      }
      this.logoError = null;
      this.selectedLogoFile = file;
    }
  }

  onSubmit() {
    if (this.logoError) {
      this.snackBar.open('Please fix logo validation errors before submitting.', 'Dismiss', { duration: 3000 });
      return;
    }

    if (this.instituteForm.valid) {
      this.isLoading = true;
      
      const formData = new FormData();
      const formValue = this.instituteForm.value;

      Object.keys(formValue).forEach(key => {
        if (key !== 'logo' && formValue[key] !== null && formValue[key] !== undefined) {
          if (key === 'expiryDate') {
            formData.append('ExpiryDate', new Date(formValue[key]).toISOString());
          } else {
            formData.append(key, formValue[key]);
          }
        }
      });

      if (this.selectedLogoFile) {
        formData.append('LogoFile', this.selectedLogoFile);
      }

      if (this.subjectsList && this.subjectsList.length > 0) {
        this.subjectsList.forEach(subject => {
          formData.append('SubjectNames', subject);
        });
      }

      this.http.post<any>(API_ENDPOINTS.AUTH.REGISTER_INSTITUTE, formData).subscribe({
        next: (res) => {
          this.snackBar.open('Coaching Center and Admin User registered successfully!', 'Dismiss', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.toggleForm();
          this.loadInstitutes();
        },
        error: (err) => {
          console.error('Failed to register institute:', err);
          this.isLoading = false;
          const errorMsg = err.error?.message || 'Failed to register coaching center. Email or code may already exist.';
          this.snackBar.open(errorMsg, 'Dismiss', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
