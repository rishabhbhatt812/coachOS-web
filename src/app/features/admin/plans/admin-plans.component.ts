import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PlanFacade } from '../../../core/facades/plan.facade';
import { SubscriptionPlan, PlanPurchaseInquiry } from '../../../core/models/plan.model';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-admin-plans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './admin-plans.component.html',
  styleUrls: ['./admin-plans.component.scss']
})
export class AdminPlansComponent implements OnInit {
  private planFacade = inject(PlanFacade);
  private fb = inject(FormBuilder);
  private dialogService = inject(DialogService);

  plans$ = this.planFacade.plans$;
  inquiries$ = this.planFacade.inquiries$;
  isLoading$ = this.planFacade.isLoading$;

  activeTab: 'plans' | 'inquiries' = 'plans';
  showPlanModal = false;
  editingPlan: SubscriptionPlan | null = null;
  featureInput = '';
  featuresList: string[] = [];

  planForm!: FormGroup;

  ngOnInit(): void {
    this.planFacade.loadPlans();
    this.planFacade.loadInquiries();
    this.initForm();
  }

  initForm(): void {
    this.planForm = this.fb.group({
      id: [''],
      code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_]+$/)]],
      name: ['', Validators.required],
      tagline: ['', Validators.required],
      description: [''],
      monthlyPrice: [2999, [Validators.required, Validators.min(0)]],
      annualPrice: [28790, [Validators.required, Validators.min(0)]],
      discountPercentage: [20, [Validators.min(0), Validators.max(100)]],
      maxStudents: [500, [Validators.required, Validators.min(1)]],
      maxTeachers: [20, [Validators.required, Validators.min(1)]],
      maxBranches: [2, [Validators.required, Validators.min(1)]],
      isPopular: [false],
      isActive: [true],
      badgeText: [''],
      accentColor: ['#4f46e5'],
      crm: [true],
      fees: [true],
      attendance: [true],
      lms: [false],
      tests: [false],
      assignments: [false],
      communication: [true],
      studentPortal: [true],
      teacherPortal: [true],
      multiBranch: [false],
      customDomain: [false],
      prioritySupport: [false],
      apiAccess: [false]
    });
  }

  openCreateModal(): void {
    this.editingPlan = null;
    this.featuresList = [
      'Full Admissions & Student Profiles',
      'Digital Fee Collections & Receipts',
      'Daily Attendance Management'
    ];
    this.planForm.reset({
      id: '',
      code: 'NEW_TIER',
      name: 'Professional Tier',
      tagline: 'Empower your growing coaching institute with modern tools.',
      description: '',
      monthlyPrice: 2499,
      annualPrice: 23990,
      discountPercentage: 20,
      maxStudents: 500,
      maxTeachers: 25,
      maxBranches: 2,
      isPopular: false,
      isActive: true,
      badgeText: 'RECOMMENDED',
      accentColor: '#4f46e5',
      crm: true,
      fees: true,
      attendance: true,
      lms: true,
      tests: true,
      assignments: true,
      communication: true,
      studentPortal: true,
      teacherPortal: true,
      multiBranch: false,
      customDomain: false,
      prioritySupport: false,
      apiAccess: false
    });
    this.showPlanModal = true;
  }

  openEditModal(plan: SubscriptionPlan): void {
    this.editingPlan = plan;
    this.featuresList = [...(plan.features || [])];
    this.planForm.patchValue({
      id: plan.id,
      code: plan.code,
      name: plan.name,
      tagline: plan.tagline,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      discountPercentage: plan.discountPercentage,
      maxStudents: plan.maxStudents,
      maxTeachers: plan.maxTeachers,
      maxBranches: plan.maxBranches,
      isPopular: plan.isPopular,
      isActive: plan.isActive,
      badgeText: plan.badgeText || '',
      accentColor: plan.accentColor || '#4f46e5',
      crm: plan.modules?.crm ?? true,
      fees: plan.modules?.fees ?? true,
      attendance: plan.modules?.attendance ?? true,
      lms: plan.modules?.lms ?? false,
      tests: plan.modules?.tests ?? false,
      assignments: plan.modules?.assignments ?? false,
      communication: plan.modules?.communication ?? true,
      studentPortal: plan.modules?.studentPortal ?? true,
      teacherPortal: plan.modules?.teacherPortal ?? true,
      multiBranch: plan.modules?.multiBranch ?? false,
      customDomain: plan.modules?.customDomain ?? false,
      prioritySupport: plan.modules?.prioritySupport ?? false,
      apiAccess: plan.modules?.apiAccess ?? false
    });
    this.showPlanModal = true;
  }

  closeModal(): void {
    this.showPlanModal = false;
    this.editingPlan = null;
    this.featureInput = '';
    this.featuresList = [];
  }

  addFeature(): void {
    if (this.featureInput.trim()) {
      this.featuresList.push(this.featureInput.trim());
      this.featureInput = '';
    }
  }

  removeFeature(index: number): void {
    this.featuresList.splice(index, 1);
  }

  onSavePlan(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    const val = this.planForm.value;
    const plan: SubscriptionPlan = {
      id: val.id || 'plan-' + Date.now(),
      code: val.code,
      name: val.name,
      tagline: val.tagline,
      description: val.description,
      monthlyPrice: Number(val.monthlyPrice),
      annualPrice: Number(val.annualPrice),
      discountPercentage: Number(val.discountPercentage),
      maxStudents: Number(val.maxStudents),
      maxTeachers: Number(val.maxTeachers),
      maxBranches: Number(val.maxBranches),
      isPopular: !!val.isPopular,
      isActive: !!val.isActive,
      badgeText: val.badgeText,
      accentColor: val.accentColor,
      features: this.featuresList,
      modules: {
        crm: !!val.crm,
        fees: !!val.fees,
        attendance: !!val.attendance,
        lms: !!val.lms,
        tests: !!val.tests,
        assignments: !!val.assignments,
        communication: !!val.communication,
        studentPortal: !!val.studentPortal,
        teacherPortal: !!val.teacherPortal,
        multiBranch: !!val.multiBranch,
        customDomain: !!val.customDomain,
        prioritySupport: !!val.prioritySupport,
        apiAccess: !!val.apiAccess
      }
    };

    this.planFacade.savePlan(plan).subscribe({
      next: () => {
        this.dialogService.alert('Subscription plan updated and synchronized with public pricing portal successfully!');
        this.closeModal();
      },
      error: () => {
        this.dialogService.error('Failed to save plan configuration.');
      }
    });
  }

  onDeletePlan(plan: SubscriptionPlan): void {
    this.dialogService.delete(`Are you sure you want to delete "${plan.name}"? Institutes will no longer be able to select this tier.`).subscribe(confirmed => {
      if (confirmed) {
        this.planFacade.deletePlan(plan.id).subscribe({
          next: () => {
            this.dialogService.alert(`Plan "${plan.name}" removed successfully.`);
          }
        });
      }
    });
  }
}
