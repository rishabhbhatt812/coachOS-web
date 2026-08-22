import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SubscriptionPlan, PlanPurchaseInquiry } from '../models/plan.model';
import { environment } from '../constants/api-endpoints';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private http = inject(HttpClient);
  private readonly STORAGE_KEY = 'edunex_subscription_plans';
  private readonly INQUIRIES_KEY = 'edunex_plan_inquiries';

  private defaultPlans: SubscriptionPlan[] = [
    {
      id: 'plan-starter',
      code: 'STARTER',
      name: 'Foundation Tier',
      tagline: 'Essential academic management for small coaching centers and boutique institutes.',
      description: 'Ideal for coaching setups getting started with digital admissions, student tracking, and automated fees.',
      monthlyPrice: 1499,
      annualPrice: 14390, // ~20% off
      discountPercentage: 20,
      maxStudents: 150,
      maxTeachers: 10,
      maxBranches: 1,
      isPopular: false,
      isActive: true,
      badgeText: 'STARTER',
      accentColor: '#3b82f6',
      features: [
        'Up to 150 Active Students',
        'Up to 10 Teacher & Staff Accounts',
        'Student Admissions & Profiles',
        'Fee Collection & Receipts',
        'Daily Attendance Tracker',
        'Notice & Announcements Board',
        '1 Main Institute Branch',
        'Standard Email Support'
      ],
      modules: {
        crm: true,
        fees: true,
        attendance: true,
        lms: false,
        tests: false,
        assignments: false,
        communication: true,
        studentPortal: true,
        teacherPortal: true,
        multiBranch: false,
        customDomain: false,
        prioritySupport: false,
        apiAccess: false
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'plan-growth',
      code: 'GROWTH_PRO',
      name: 'Growth Professional',
      tagline: 'Complete automation with online exams, assignments, multi-batch scheduling & LMS.',
      description: 'The most popular choice for fast-growing institutes preparing students for competitive exams like JEE & NEET.',
      monthlyPrice: 3499,
      annualPrice: 33590, // ~20% off
      discountPercentage: 20,
      maxStudents: 1000,
      maxTeachers: 40,
      maxBranches: 3,
      isPopular: true,
      isActive: true,
      badgeText: 'MOST POPULAR',
      accentColor: '#4f46e5',
      features: [
        'Up to 1,000 Active Students',
        'Up to 40 Teachers & Coordinators',
        'LMS Study Materials & Video Notes',
        'Online Homework & Assignment Grading',
        'Exams, Tests & Instant Rank Generation',
        'Automated Fee Reminder & Overdue Alerts',
        'Multi-Branch Support (Up to 3 Branches)',
        'Full Student & Teacher Portal Access',
        'Priority Phone & WhatsApp Support'
      ],
      modules: {
        crm: true,
        fees: true,
        attendance: true,
        lms: true,
        tests: true,
        assignments: true,
        communication: true,
        studentPortal: true,
        teacherPortal: true,
        multiBranch: true,
        customDomain: false,
        prioritySupport: true,
        apiAccess: false
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'plan-enterprise',
      code: 'ENTERPRISE',
      name: 'Apex Enterprise',
      tagline: 'Unlimited scale, custom domain, full API access, and dedicated technical account manager.',
      description: 'Tailored for multi-city academies, franchise networks, and prestigious colleges seeking top-tier infrastructure.',
      monthlyPrice: 7999,
      annualPrice: 76790, // ~20% off
      discountPercentage: 20,
      maxStudents: 999999, // Unlimited
      maxTeachers: 999999,
      maxBranches: 999999,
      isPopular: false,
      isActive: true,
      badgeText: 'UNLIMITED SCALE',
      accentColor: '#0f172a',
      features: [
        'Unlimited Students & Batch Enrollments',
        'Unlimited Faculty & Staff Accounts',
        'Unlimited Multi-City Branches & Franchises',
        'White-label Custom Domain & Brand Styling',
        'Advanced CRM Lead Pipeline & Conversion Funnels',
        'Audit Logging & Role-Based Permissions (RBAC)',
        'Automated SMS & WhatsApp Gateway Integration',
        'Full REST API & Custom Webhooks Access',
        'Dedicated 24/7 VIP Technical Account Manager',
        '99.9% Uptime SLA Guaranteed'
      ],
      modules: {
        crm: true,
        fees: true,
        attendance: true,
        lms: true,
        tests: true,
        assignments: true,
        communication: true,
        studentPortal: true,
        teacherPortal: true,
        multiBranch: true,
        customDomain: true,
        prioritySupport: true,
        apiAccess: true
      },
      createdAt: new Date().toISOString()
    }
  ];

  getPlans(): Observable<SubscriptionPlan[]> {
    const local = localStorage.getItem(this.STORAGE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return of(parsed);
        }
      } catch (e) {
        console.warn('Error reading stored plans:', e);
      }
    }
    // Save defaults
    this.saveToStorage(this.defaultPlans);
    return of(this.defaultPlans);
  }

  savePlan(plan: SubscriptionPlan): Observable<SubscriptionPlan> {
    const plans = this.getLocalPlans();
    const idx = plans.findIndex(p => p.id === plan.id);
    if (idx >= 0) {
      plans[idx] = { ...plan, updatedAt: new Date().toISOString() };
    } else {
      plan.id = plan.id || 'plan-' + Date.now();
      plan.createdAt = new Date().toISOString();
      plans.push(plan);
    }
    this.saveToStorage(plans);
    return of(plan);
  }

  deletePlan(id: string): Observable<boolean> {
    const plans = this.getLocalPlans().filter(p => p.id !== id);
    this.saveToStorage(plans);
    return of(true);
  }

  submitInquiry(data: Omit<PlanPurchaseInquiry, 'id' | 'createdAt' | 'status'>): Observable<{ success: boolean; message: string; ticketId: string }> {
    return this.http.post<any>(`${environment.apiUrl}/api/PublicInquiries/submit`, data).pipe(
      map((res: any): { success: boolean; message: string; ticketId: string } => {
        const ticketId: string = (res && res.ticketId) ? String(res.ticketId) : ('INQ-' + Math.floor(100000 + Math.random() * 900000));
        const inquiry: PlanPurchaseInquiry = {
          ...data,
          id: ticketId,
          status: 'New',
          createdAt: new Date().toISOString()
        };
        const inquiries = this.getStoredInquiries();
        inquiries.unshift(inquiry);
        localStorage.setItem(this.INQUIRIES_KEY, JSON.stringify(inquiries));
        return {
          success: true,
          message: res?.message || 'Plan subscription application received!',
          ticketId: ticketId
        };
      }),
      catchError(() => {
        const generatedId = 'INQ-' + Math.floor(100000 + Math.random() * 900000);
        const inquiry: PlanPurchaseInquiry = {
          ...data,
          id: generatedId,
          status: 'New',
          createdAt: new Date().toISOString()
        };
        const inquiries = this.getStoredInquiries();
        inquiries.unshift(inquiry);
        localStorage.setItem(this.INQUIRIES_KEY, JSON.stringify(inquiries));
        return of<{ success: boolean; message: string; ticketId: string }>({
          success: true,
          message: 'Plan subscription inquiry received!',
          ticketId: generatedId
        });
      })
    );
  }

  getInquiries(): Observable<PlanPurchaseInquiry[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/PublicInquiries`).pipe(
      map((res: any) => {
        if (res && res.data && Array.isArray(res.data)) {
          return res.data;
        }
        return this.getStoredInquiries();
      }),
      catchError(() => of(this.getStoredInquiries()))
    );
  }

  private getLocalPlans(): SubscriptionPlan[] {
    const local = localStorage.getItem(this.STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return [...this.defaultPlans];
      }
    }
    return [...this.defaultPlans];
  }

  private saveToStorage(plans: SubscriptionPlan[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plans));
  }

  private getStoredInquiries(): PlanPurchaseInquiry[] {
    const local = localStorage.getItem(this.INQUIRIES_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return [];
      }
    }
    return [];
  }
}
