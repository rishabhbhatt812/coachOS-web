import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '../../core/facades/auth.facade';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../core/constants/api-endpoints';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher-layout.html',
  styleUrl: './teacher-layout.scss',
})
export class TeacherLayout implements OnInit {
  private authFacade = inject(AuthFacade);
  private http = inject(HttpClient);
  
  user$ = this.authFacade.currentUser$;
  currentTenant$ = this.authFacade.currentTenant$;
  sidebarOpen = false;
  
  notifications: any[] = [];
  unreadCount = 0;
  showNotifications = false;

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.http.get<any>(`${environment.apiUrl}/api/teacher/notifications`).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.notifications = res.data;
          this.unreadCount = this.notifications.filter(n => !n.isRead).length;
        }
      }
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(id: string) {
    this.http.post(`${environment.apiUrl}/api/teacher/notifications/${id}/read`, {}).subscribe({
      next: () => {
        this.loadNotifications();
      }
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarOnMobile() {
    if (window.innerWidth <= 1024) {
      this.sidebarOpen = false;
    }
  }

  hasModuleAccess(moduleName: string): boolean {
    return this.authFacade.hasModuleAccess(moduleName);
  }

  logout(): void {
    this.authFacade.logout();
  }
}
