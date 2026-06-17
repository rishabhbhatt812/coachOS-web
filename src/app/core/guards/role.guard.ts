import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthFacade } from '../facades/auth.facade';

export const roleGuard: CanActivateFn = (route, state) => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);
  const expectedRoles = route.data['roles'] as Array<string>;

  const currentUser = authFacade.currentUserValue;

  if (currentUser && expectedRoles.includes(currentUser.role)) {
    const rawRole = currentUser.rawRole || '';
    const isGlobalAdmin = rawRole === 'GLOBAL_ADMIN' || rawRole === 'SUPER_ADMIN';

    if (isGlobalAdmin) {
      const url = state.url;
      // Global admins are allowed to see all other admin pages when impersonating,
      // EXCEPT the Attendance page which is completely forbidden.
      if (url.startsWith('/admin/attendance')) {
        return router.createUrlTree(['/admin/dashboard']);
      }
    } else {
      const requiresGlobalAdmin = route.data['requiresGlobalAdmin'] as boolean;
      if (requiresGlobalAdmin) {
        return router.createUrlTree([`/${currentUser.role.toLowerCase()}/dashboard`]);
      }
    }
    return true;
  }

  // Role not authorized, redirect to their respective dashboard
  if (currentUser) {
    if (currentUser.role === 'TEACHER') {
      return router.createUrlTree(['/teacher/notes']);
    }
    return router.createUrlTree([`/${currentUser.role.toLowerCase()}/dashboard`]);
  }
  
  return router.createUrlTree(['/auth/login']);
};
