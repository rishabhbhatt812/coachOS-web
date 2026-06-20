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
  branchName?: string;
}

export interface Tenant {
  id: string;
  name: string;
  logoUrl?: string;
  activeModules: string[];
}
