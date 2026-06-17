import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthFacade } from '../facades/auth.facade';

export const authGuard: CanActivateFn = (route, state) => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  if (authFacade.isAuthenticated) {
    return true;
  }

  // Not logged in, redirect to login page with the return url
  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};
