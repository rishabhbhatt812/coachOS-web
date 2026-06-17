import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isLoading$ = this.authFacade.isLoading$;
  hidePassword = true;

  loginForm = this.fb.group({
    email: ['admin@mycoaching.com', [Validators.required, Validators.email]],
    password: ['Admin@123', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      const req: any = {
        email: formValue.email || '',
        password: formValue.password || ''
      };
      
      this.authFacade.login(req).subscribe({
        next: () => {
          this.snackBar.open('Welcome back, ' + (this.authFacade.currentUserValue?.name || 'User') + '!', 'Dismiss', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          
          const role = this.authFacade.currentUserValue?.role;
          
          if (role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'TEACHER') {
            this.router.navigate(['/teacher/notes']);
          } else if (role === 'RECEPTIONIST') {
            this.router.navigate(['/receptionist/dashboard']);
          } else {
            this.router.navigate(['/student/dashboard']);
          }
        },
        error: (err) => {
          console.error('Login failed in component', err);
          // Handled by global HttpErrorInterceptor, no action needed here
        }
      });
    }
  }
}
