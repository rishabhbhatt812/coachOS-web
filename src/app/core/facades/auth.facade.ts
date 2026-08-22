import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { User, Tenant, Role } from '../models/user.model';
import { Router } from '@angular/router';
import { LoginRequest } from '../models/api-schemas';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { environment } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private currentTenantSubject = new BehaviorSubject<Tenant | null>(null);
  public currentTenant$ = this.currentTenantSubject.asObservable();

  private enabledModulesSubject = new BehaviorSubject<any[]>([]);
  public enabledModules$ = this.enabledModulesSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor() {
    this.checkInitialAuth();
  }

  get currentUserValue(): User | null { return this.currentUserSubject.value; }
  get currentTenantValue(): Tenant | null { return this.currentTenantSubject.value; }
  get enabledModulesValue(): any[] { return this.enabledModulesSubject.value; }
  get isAuthenticated(): boolean { return !!this.currentUserSubject.value; }

  login(credentials: LoginRequest): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authService.login(credentials).pipe(
      tap(res => {
        const token = res?.data?.accessToken || res?.token || res?.accessToken || res?.jwtToken || (typeof res === 'string' ? res : null);
        if (token) {
          localStorage.removeItem('active_institute_id');
          if (res?.data?.instituteName || res?.instituteName) {
            const instInfo = {
              name: res?.data?.instituteName || res?.instituteName,
              logo: res?.data?.instituteLogo || res?.instituteLogo,
              code: res?.data?.instituteCode || res?.instituteCode,
              contact: res?.data?.instituteContact || res?.instituteContact,
              email: res?.data?.instituteEmail || res?.instituteEmail,
              address: res?.data?.instituteAddress || res?.instituteAddress
            };
            localStorage.setItem('active_institute_branding', JSON.stringify(instInfo));
          }
          this.handleToken(token);
        } else {
          console.error('No token found in response', res);
          throw new Error('Invalid credentials or authentication token missing.');
        }
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  private handleToken(token: string) {
    localStorage.setItem('auth_token', token);
    try {
      const decoded: any = jwtDecode(token);
      
      // Standard .NET Core Identity Claims parsing
      const rawRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || 'STUDENT';
      const email = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email || '';
      const name = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.name || 'User';
      const id = decoded['UserId'] || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.sub || '0';
      const tenantId = decoded['InstituteId'] || decoded.tenantId || 'default_tenant';

      if (!localStorage.getItem('active_institute_id') && tenantId) {
        localStorage.setItem('active_institute_id', tenantId);
      }
      
      let role: Role = 'STUDENT';
      const upperRole = String(rawRole).toUpperCase();
      if (upperRole.includes('ADMIN')) {
        role = 'ADMIN';
      } else if (upperRole.includes('TEACHER') || upperRole.includes('INSTRUCTOR')) {
        role = 'TEACHER';
      } else if (upperRole.includes('RECEPTIONIST')) {
        role = 'RECEPTIONIST';
      }
      
      let cachedBranding: any = null;
      try {
        const rawBranding = localStorage.getItem('active_institute_branding');
        if (rawBranding) cachedBranding = JSON.parse(rawBranding);
      } catch {}

      const user: User = { 
        id, 
        name, 
        email, 
        role, 
        tenantId, 
        rawRole: String(rawRole),
        instituteName: cachedBranding?.name,
        instituteLogo: cachedBranding?.logo,
        instituteContact: cachedBranding?.contact,
        instituteEmail: cachedBranding?.email,
        instituteAddress: cachedBranding?.address
      };
      this.currentUserSubject.next(user);

      // Load active institute details
      this.loadMyInstitute(tenantId);

      // Fetch dynamic active modules from AuthController
      this.http.get<any[]>(`${environment.apiUrl}/api/auth/my-enabled-modules`).subscribe({
        next: (modules) => {
          const activeModuleCodes = (modules || []).map(m => m.moduleCode.toUpperCase());
          const tenant: Tenant = {
            id: tenantId,
            name: cachedBranding?.name || 'EduNex Academy',
            logoUrl: cachedBranding?.logo || '/logo.png',
            code: cachedBranding?.code || 'EDUNEX',
            contact: cachedBranding?.contact,
            email: cachedBranding?.email,
            address: cachedBranding?.address,
            activeModules: activeModuleCodes
          };
          this.currentTenantSubject.next(tenant);
          this.enabledModulesSubject.next(modules || []);
        },
        error: (err) => {
          console.error('Failed to fetch active modules', err);
          const fallbackCodes = ['CRM', 'FEES', 'ATTENDANCE', 'LEARNING', 'COMMUNICATION', 'STUDENT_PORTAL'];
          const tenant: Tenant = {
            id: tenantId,
            name: cachedBranding?.name || 'EduNex Academy',
            logoUrl: cachedBranding?.logo || '/logo.png',
            activeModules: fallbackCodes
          };
          this.currentTenantSubject.next(tenant);
          this.enabledModulesSubject.next([]);
        }
      });

    } catch (e) {
      console.error('Invalid token', e);
      this.logout();
    }
  }

  loadMyInstitute(tenantId?: string) {
    this.http.get<any>(`${environment.apiUrl}/api/auth/my-institute`).subscribe({
      next: (res) => {
        const data = res?.data || res;
        if (data && data.name) {
          const branding = {
            name: data.name,
            logo: data.logo || '/logo.png',
            code: data.instituteCode,
            contact: data.mobileNumber,
            email: data.emailAddress,
            address: data.address
          };
          localStorage.setItem('active_institute_branding', JSON.stringify(branding));

          const currentTenant = this.currentTenantSubject.value;
          this.currentTenantSubject.next({
            id: tenantId || currentTenant?.id || 'tenant',
            name: data.name,
            code: data.instituteCode,
            logoUrl: data.logo || '/logo.png',
            contact: data.mobileNumber,
            email: data.emailAddress,
            address: data.address,
            activeModules: currentTenant?.activeModules || ['CRM', 'FEES', 'ATTENDANCE', 'LEARNING', 'COMMUNICATION']
          });

          const currentUser = this.currentUserSubject.value;
          if (currentUser) {
            this.currentUserSubject.next({
              ...currentUser,
              instituteName: data.name,
              instituteLogo: data.logo || '/logo.png',
              instituteCode: data.instituteCode,
              instituteContact: data.mobileNumber,
              instituteEmail: data.emailAddress,
              instituteAddress: data.address
            });
          }
        }
      },
      error: () => {}
    });
  }

  private checkInitialAuth() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.handleToken(token);
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('active_institute_id');
      localStorage.removeItem('active_institute_branding');
      this.currentUserSubject.next(null);
      this.currentTenantSubject.next(null);
      this.router.navigate(['/auth/login']);
    });
  }

  hasModuleAccess(moduleName: string): boolean {
    const tenant = this.currentTenantValue;
    return tenant ? tenant.activeModules.includes(moduleName.toUpperCase()) : false;
  }
}
