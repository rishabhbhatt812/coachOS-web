import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { StudentService } from '../../../core/services/student.service';
import { environment } from '../../../core/constants/api-endpoints';

@Component({
  selector: 'app-student-profile-portal',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './student-profile-portal.component.html',
  styleUrls: ['./student-profile-portal.component.scss']
})
export class StudentProfilePortalComponent implements OnInit {
  private studentService = inject(StudentService);
  private snackBar = inject(MatSnackBar);

  profileData: any;
  feeHistory: any;
  batchHistory: any;
  isUploading = false;

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.studentService.getProfile().subscribe({
      next: (data: any) => {
        this.profileData = data;
        // Pre-fetch related histories for clean experience
        this.studentService.getFees().subscribe((fees: any) => this.feeHistory = { feePlans: fees, installments: [], payments: [] });
        this.studentService.getCourses().subscribe((courses: any) => this.batchHistory = courses);
      },
      error: (err: any) => console.error('Failed to load profile:', err)
    });
  }

  getProfileUrl(): string {
    if (this.profileData?.profileImagePath) {
      return `${environment.apiUrl}/${this.profileData.profileImagePath}`;
    }
    return 'https://www.w3schools.com/howto/img_avatar.png';
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.snackBar.open('Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.', 'Close', { duration: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.isUploading = true;
    this.studentService.uploadProfilePicture(formData).subscribe({
      next: (res: any) => {
        this.isUploading = false;
        if (res.success || res.isSuccess) {
          this.snackBar.open('Profile picture updated successfully!', 'Close', { duration: 3000 });
          if (this.profileData) {
            this.profileData.profileImagePath = res.data;
          }
        } else {
          this.snackBar.open(res.message || 'Failed to upload profile picture.', 'Close', { duration: 3000 });
        }
      },
      error: (err: any) => {
        this.isUploading = false;
        this.snackBar.open(err.error?.message || 'Error uploading profile picture.', 'Close', { duration: 3000 });
      }
    });
  }
}
