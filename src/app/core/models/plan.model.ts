export interface PlanModuleInclusion {
  code: string;
  name: string;
  included: boolean;
  limitDescription?: string;
}

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  discountPercentage: number;
  maxStudents: number; // e.g. 150, 1000, 999999 for unlimited
  maxTeachers: number;
  maxBranches: number;
  isPopular: boolean;
  isActive: boolean;
  badgeText?: string;
  accentColor?: string;
  features: string[];
  modules: {
    crm: boolean;
    fees: boolean;
    attendance: boolean;
    lms: boolean;
    tests: boolean;
    assignments: boolean;
    communication: boolean;
    studentPortal: boolean;
    teacherPortal: boolean;
    multiBranch: boolean;
    customDomain: boolean;
    prioritySupport: boolean;
    apiAccess: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanPurchaseInquiry {
  id?: string;
  planId: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  calculatedAmount: number;
  instituteName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  expectedStudents: number;
  remarks?: string;
  status?: 'New' | 'Contacted' | 'Approved' | 'Rejected';
  createdAt?: string;
}
