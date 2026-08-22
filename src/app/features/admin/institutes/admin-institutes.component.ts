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
  logoPreviewUrl: string | null = null;

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreviewUrl = e.target?.result as string;
        this.instituteForm.patchValue({ logo: this.logoPreviewUrl });
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo() {
    this.logoPreviewUrl = null;
    this.instituteForm.patchValue({ logo: '' });
    this.cdr.detectChanges();
  }

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
    this.cdr.detectChanges();

    this.http.get<any>(`${environment.apiUrl}/api/admin/GlobalAdmin/institutes/${instituteId}/modules`).subscribe({
      next: (res) => {
        let list: any[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && Array.isArray(res.data)) {
          list = res.data;
        }
        this.instituteModules = list;
        this.isLoadingModules = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load institute modules:', err);
        this.isLoadingModules = false;
        this.instituteModules = [];
        this.snackBar.open('Error loading module access settings.', '', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  saveInstituteModules() {
    if (!this.activeInstituteForModules) return;
    this.isSavingModules = true;
    this.cdr.detectChanges();

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
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to save institute modules:', err);
        this.isSavingModules = false;
        this.snackBar.open('Error saving module access settings.', 'Dismiss', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

  loadInstitutes() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.http.get<any>(`${environment.apiUrl}/api/admin/GlobalAdmin/institutes`).subscribe({
      next: (res) => {
        let list: any[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && typeof res === 'object') {
          if (Array.isArray(res.data)) {
            list = res.data;
          } else if (Array.isArray(res.data?.data)) {
            list = res.data.data;
          } else if (res.id) {
            list = [res];
          }
        }

        this.institutes = list.map((item: any) => ({
          ...item,
          isActive: item.isActive ? 'true' : 'false'
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load institutes:', err);
        this.isLoading = false;
        this.institutes = [];
        this.snackBar.open('Error loading coaching centers.', 'Dismiss', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
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

  onSubmit() {
    if (this.instituteForm.valid) {
      this.isLoading = true;
      this.cdr.detectChanges();
      
      const payload = {
        ...this.instituteForm.value,
        subjectNames: this.subjectsList,
        expiryDate: new Date(this.instituteForm.value.expiryDate).toISOString()
      };

      this.http.post<any>(API_ENDPOINTS.AUTH.REGISTER_INSTITUTE, payload).subscribe({
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
          this.cdr.detectChanges();
        }
      });
    }
  }
}
