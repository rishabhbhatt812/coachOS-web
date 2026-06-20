import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize, catchError } from 'rxjs/operators';
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
      
      const user: User = { id, name, email, role, tenantId, rawRole: String(rawRole) };
      this.currentUserSubject.next(user);

      // Call /api/auth/me to get institute name, logoUrl, profilePhotoUrl
      this.authService.getCurrentUser().subscribe({
        next: (profileRes) => {
          const profile = profileRes?.data || profileRes;
          if (profile) {
            // Update user details
            const updatedUser: User = {
              ...user,
              name: profile.fullName || user.name,
              email: profile.email || user.email,
              avatarUrl: profile.profilePhotoUrl,
              instituteName: profile.instituteName,
              branchName: profile.branchName
            };
            this.currentUserSubject.next(updatedUser);

            // Fetch dynamic active modules from AuthController
            this.http.get<any[]>(`${environment.apiUrl}/api/auth/my-enabled-modules`).subscribe({
              next: (modules) => {
                const activeModuleCodes = (modules || []).map(m => m.moduleCode.toUpperCase());
                const tenant: Tenant = {
                  id: String(profile.instituteId || tenantId),
                  name: profile.instituteName || 'My Institute',
                  logoUrl: profile.instituteLogoUrl,
                  activeModules: activeModuleCodes
                };
                this.currentTenantSubject.next(tenant);
                this.enabledModulesSubject.next(modules || []);
              },
              error: (err) => {
                console.error('Failed to fetch active modules', err);
                const fallbackCodes = ['CRM', 'FEES', 'ATTENDANCE', 'LEARNING', 'COMMUNICATION', 'STUDENT_PORTAL'];
                const tenant: Tenant = {
                  id: String(profile.instituteId || tenantId),
                  name: profile.instituteName || 'My Institute',
                  logoUrl: profile.instituteLogoUrl,
                  activeModules: fallbackCodes
                };
                this.currentTenantSubject.next(tenant);
                this.enabledModulesSubject.next([]);
              }
            });
          }
        },
        error: (err) => {
          console.error('Failed to fetch profile', err);
          // Fallback module fetching if profile fails
          this.http.get<any[]>(`${environment.apiUrl}/api/auth/my-enabled-modules`).subscribe({
            next: (modules) => {
              const activeModuleCodes = (modules || []).map(m => m.moduleCode.toUpperCase());
              const tenant: Tenant = {
                id: tenantId,
                name: 'My Institute',
                activeModules: activeModuleCodes
              };
              this.currentTenantSubject.next(tenant);
              this.enabledModulesSubject.next(modules || []);
            },
            error: (modulesErr) => {
              const fallbackCodes = ['CRM', 'FEES', 'ATTENDANCE', 'LEARNING', 'COMMUNICATION', 'STUDENT_PORTAL'];
              const tenant: Tenant = {
                id: tenantId,
                name: 'My Institute',
                activeModules: fallbackCodes
              };
              this.currentTenantSubject.next(tenant);
            }
          });
        }
      });

    } catch (e) {
      console.error('Invalid token', e);
      this.logout();
    }
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
