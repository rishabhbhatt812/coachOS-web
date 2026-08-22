import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PlanFacade } from '../../../core/facades/plan.facade';
import { SubscriptionPlan, PlanPurchaseInquiry } from '../../../core/models/plan.model';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-public-pricing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PublicPricingComponent implements OnInit {
  private planFacade = inject(PlanFacade);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  activePlans$ = this.planFacade.activePlans$;
  isLoading$ = this.planFacade.isLoading$;

  billingCycle: 'monthly' | 'yearly' = 'yearly';
  showInquiryModal = false;
  selectedPlan: SubscriptionPlan | null = null;
  submissionSuccess = false;
  submittedTicketId = '';

  inquiryForm!: FormGroup;

  faqs = [
    {
      q: 'Can I upgrade or downgrade our institute plan later?',
      a: 'Yes, absolutely. You can upgrade your subscription at any time directly from the admin console. Any remaining credit from your current billing cycle will be prorated automatically towards your new tier.',
      open: true
    },
    {
      q: 'Is there a free trial or guided demonstration available?',
      a: 'Yes! When you submit a purchase inquiry or registration form, our educational solutions specialist will set up a dedicated 14-day sandbox environment loaded with sample coaching data and provide a personalized live walkthrough.',
      open: false
    },
    {
      q: 'How does the student count limit work?',
      a: 'The student limit applies only to active students currently enrolled in batches. Archived or graduated alumni records do not count towards your active student threshold.',
      open: false
    },
    {
      q: 'Can we import our existing student data from Excel or other software?',
      a: 'Yes. EduNex includes automated Excel/CSV bulk import tools for students, parents, faculty profiles, and historical fee ledgers. Our technical team also assists with seamless database migration at zero extra charge.',
      open: false
    },
    {
      q: 'What payment methods are supported for subscription billing?',
      a: 'We accept all major corporate credit/debit cards, UPI, Net Banking, NEFT/RTGS, and automated e-Mandate invoicing with complete GST input tax invoices.',
      open: false
    }
  ];

  comparisonModules = [
    { name: 'Admissions & Student Management', starter: true, growth: true, enterprise: true },
    { name: 'Fee Collection, Receipts & Invoices', starter: true, growth: true, enterprise: true },
    { name: 'Attendance & Biometric / QR Tracking', starter: true, growth: true, enterprise: true },
    { name: 'Notice Board & Announcements', starter: true, growth: true, enterprise: true },
    { name: 'Student & Parent Portal Web App', starter: true, growth: true, enterprise: true },
    { name: 'Teacher Portal & Faculty Schedule', starter: true, growth: true, enterprise: true },
    { name: 'LMS Notes, Study Material & Videos', starter: false, growth: true, enterprise: true },
    { name: 'Homework & Assignment Grading Tool', starter: false, growth: true, enterprise: true },
    { name: 'Online Exams & Test Result Analytics', starter: false, growth: true, enterprise: true },
    { name: 'Automated SMS & WhatsApp Reminders', starter: false, growth: true, enterprise: true },
    { name: 'Multi-Branch Coaching Management', starter: false, growth: 'Up to 3 Branches', enterprise: 'Unlimited Branches' },
    { name: 'Custom Domain & Institute White-Label', starter: false, growth: false, enterprise: true },
    { name: 'Granular Role Permissions (RBAC)', starter: false, growth: false, enterprise: true },
    { name: 'Full REST API & Webhooks Access', starter: false, growth: false, enterprise: true },
    { name: 'Dedicated VIP Support & SLA', starter: 'Email (24h)', growth: 'Priority WhatsApp', enterprise: '24/7 VIP Account Mgr' }
  ];

  ngOnInit(): void {
    this.planFacade.loadPlans();
    this.initForm();
  }

  initForm(): void {
    this.inquiryForm = this.fb.group({
      instituteName: ['', [Validators.required, Validators.minLength(3)]],
      contactPerson: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+ -]{10,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      expectedStudents: [100, [Validators.required, Validators.min(10)]],
      remarks: ['']
    });
  }

  setBillingCycle(cycle: 'monthly' | 'yearly'): void {
    this.billingCycle = cycle;
  }

  getCalculatedPrice(plan: SubscriptionPlan): number {
    return this.billingCycle === 'yearly' ? plan.annualPrice : plan.monthlyPrice;
  }

  getMonthlyEquivalent(plan: SubscriptionPlan): number {
    return this.billingCycle === 'yearly' ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
  }

  openPurchaseModal(plan: SubscriptionPlan): void {
    this.selectedPlan = plan;
    this.showInquiryModal = true;
    this.submissionSuccess = false;
  }

  closePurchaseModal(): void {
    this.showInquiryModal = false;
    this.selectedPlan = null;
    this.submissionSuccess = false;
    this.inquiryForm.reset({ expectedStudents: 100 });
  }

  onSubmitInquiry(): void {
    if (this.inquiryForm.invalid || !this.selectedPlan) {
      this.inquiryForm.markAllAsTouched();
      return;
    }

    const val = this.inquiryForm.value;
    const inquiry: PlanPurchaseInquiry = {
      planId: this.selectedPlan.id,
      planName: this.selectedPlan.name,
      billingCycle: this.billingCycle,
      calculatedAmount: this.getCalculatedPrice(this.selectedPlan),
      instituteName: val.instituteName,
      contactPerson: val.contactPerson,
      phone: val.phone,
      email: val.email,
      city: val.city,
      state: val.state,
      expectedStudents: val.expectedStudents,
      remarks: val.remarks
    };

    this.planFacade.submitInquiry(inquiry).subscribe({
      next: (res) => {
        this.submittedTicketId = res.ticketId;
        this.submissionSuccess = true;
      },
      error: () => {
        this.dialogService.error('Failed to submit registration. Please check your details and retry.');
      }
    });
  }

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
