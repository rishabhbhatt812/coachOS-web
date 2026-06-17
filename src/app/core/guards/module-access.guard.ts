import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthFacade } from '../facades/auth.facade';

export const moduleAccessGuard: CanActivateFn = (route, state) => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);
  const requiredModule = route.data['module'] as string;

  const rawRole = authFacade.currentUserValue?.rawRole || '';
  const isGlobalAdmin = rawRole === 'GLOBAL_ADMIN' || rawRole === 'SUPER_ADMIN';
  const activeInstituteId = localStorage.getItem('active_institute_id') || 'system_global';

  if (isGlobalAdmin) {
    if (requiredModule.toUpperCase() === 'ATTENDANCE') {
      return router.createUrlTree(['/admin/dashboard']);
    }
    if (activeInstituteId === 'system_global') {
      return router.createUrlTree(['/admin/dashboard']);
    }
    if (authFacade.hasModuleAccess(requiredModule)) {
      return true;
    }
  } else {
    if (authFacade.hasModuleAccess(requiredModule)) {
      return true;
    }
  }

  const role = authFacade.currentUserValue?.role?.toLowerCase() || 'student';
  return router.createUrlTree([`/${role}/dashboard`]);
};
