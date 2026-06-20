import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthFacade } from '../facades/auth.facade';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.endsWith('/api/auth/login')) {
        const authFacade = injector.get(AuthFacade);
        authFacade.clearAuthStateAndRedirect();
        return throwError(() => error);
      }

      let errorMessage = 'An unexpected error occurred.';

      if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        } else if (Array.isArray(error.error.errors) && error.error.errors.length > 0) {
          errorMessage = error.error.errors.join(', ');
        } else if (error.error.errors && typeof error.error.errors === 'object') {
          // Model validation errors
          const validationErrors = Object.values(error.error.errors).flat();
          if (validationErrors.length > 0) {
            errorMessage = validationErrors.join(', ');
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });

      return throwError(() => error);
    })
  );
};
