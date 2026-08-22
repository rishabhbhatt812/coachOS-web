export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'RECEPTIONIST';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  tenantId: string;
  rawRole?: string;
  instituteName?: string;
  instituteCode?: string;
  instituteLogo?: string;
  instituteContact?: string;
  instituteEmail?: string;
  instituteAddress?: string;
}

export interface Tenant {
  id: string;
  name: string;
  code?: string;
  logoUrl?: string;
  contact?: string;
  email?: string;
  address?: string;
  activeModules: string[];
}
