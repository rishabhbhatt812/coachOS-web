import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  selectedRoleTab = 'admin';

  loginForm = this.fb.group({
    email: ['superadmin@apex.com', [Validators.required, Validators.email]],
    password: ['Password@123', Validators.required]
  });

  quickFill(role: string) {
    this.selectedRoleTab = role;
    if (role === 'admin') {
      this.loginForm.patchValue({
        email: 'superadmin@apex.com',
        password: 'Password@123'
      });
    } else if (role === 'teacher') {
      this.loginForm.patchValue({
        email: 'physics@apex.com',
        password: 'Password@123'
      });
    } else if (role === 'maths') {
      this.loginForm.patchValue({
        email: 'maths@apex.com',
        password: 'Password@123'
      });
    } else if (role === 'reception') {
      this.loginForm.patchValue({
        email: 'reception@apex.com',
        password: 'Password@123'
      });
    }
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
        }
      });
    }
  }
}

