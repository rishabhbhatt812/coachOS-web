import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. Handle 401 Unauthorized
      if (error.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('active_institute_id');
        localStorage.removeItem('active_institute_branding');

        const isLoginRequest = req.url.toLowerCase().includes('/api/auth/login');
        if (isLoginRequest) {
          snackBar.open('Invalid email or password. Please verify your credentials.', 'Close', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        } else {
          // Silent redirect on expired token for background queries
          router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      }

      // 2. Handle 403 Forbidden
      if (error.status === 403) {
        snackBar.open('Access Denied: You do not have permissions for this action.', 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        return throwError(() => error);
      }

      // 3. Handle Server Offline (status 0)
      if (error.status === 0) {
        snackBar.open('Unable to connect to the backend server. Please ensure the API is running.', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        return throwError(() => error);
      }

      // 4. Clean error message extraction for other statuses
      let errorMessage = 'An error occurred while processing your request.';

      if (error.error) {
        if (typeof error.error === 'string' && !error.error.startsWith('<!doctype')) {
          errorMessage = error.error;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        } else if (Array.isArray(error.error.errors) && error.error.errors.length > 0) {
          errorMessage = error.error.errors.join(', ');
        } else if (error.error.errors && typeof error.error.errors === 'object') {
          const validationErrors = Object.values(error.error.errors).flat();
          if (validationErrors.length > 0) {
            errorMessage = validationErrors.join(', ');
          }
        }
      }

      // Filter out technical Angular/HTTP framework strings
      if (errorMessage.includes('Http failure response') || errorMessage.includes('status code')) {
        if (error.status === 404) {
          errorMessage = 'The requested resource could not be found.';
        } else if (error.status >= 500) {
          errorMessage = 'Internal server error. Please try again shortly.';
        } else {
          errorMessage = 'Request could not be completed.';
        }
      }

      // Suppress toast for background polling / optional requests
      const isBackgroundReq = req.url.includes('/my-enabled-modules') || req.url.includes('/my-institute');
      if (!isBackgroundReq) {
        snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }

      return throwError(() => error);
    })
  );
};
