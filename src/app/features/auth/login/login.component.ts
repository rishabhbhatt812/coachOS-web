import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatIconModule,
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
  rememberMe = true;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  fillCredentials(email: string, pass: string = 'Password123') {
    this.loginForm.patchValue({
      email,
      password: pass
    });
    this.loginForm.markAsDirty();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      const req: any = {
        email: formValue.email || '',
        password: formValue.password || ''
      };
      
      this.authFacade.login(req).subscribe({
        next: () => {
          const user = this.authFacade.currentUserValue;
          this.snackBar.open(`✓ Welcome back, ${user?.name || 'User'}!`, 'Dismiss', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          
          const role = user?.role as string;
          
          if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'GLOBAL_ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'TEACHER') {
            this.router.navigate(['/teacher/my-batches']);
          } else if (role === 'RECEPTIONIST') {
            this.router.navigate(['/receptionist/dashboard']);
          } else {
            this.router.navigate(['/student/dashboard']);
          }
        },
        error: (err) => {
          console.error('Login failed', err);
          const errorMsg = err?.error?.message || err?.message || 'Invalid email or password. Please check your credentials.';
          this.snackBar.open(`⚠️ ${errorMsg}`, 'Dismiss', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}

