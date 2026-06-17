import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '../../core/facades/auth.facade';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-layout.component.html',
  styleUrl: './student-layout.component.scss'
})
export class StudentLayoutComponent {
  private authFacade = inject(AuthFacade);
  user$ = this.authFacade.currentUser$;

  logout(): void {
    this.authFacade.logout();
  }

  hasModuleAccess(moduleName: string): boolean {
    return this.authFacade.hasModuleAccess(moduleName);
  }
}
