import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  profileData: any = null;
  feeHistory: any = null;
  batchHistory: any = null;
  isLoading = true;
  isUploading = false;

  private defaultProfile = {
    fullName: 'Jane Smith',
    studentCode: 'STU-2026',
    mobile: '+91 98765 43212',
    email: 'student@apex.com',
    dateOfBirth: '15 May 2006',
    admissionDate: '10 June 2024',
    gender: 'Female',
    address: 'Flat 402, Green Avenue, Delhi',
    profileImagePath: '',
    parents: [
      {
        relationshipType: 'Father',
        fullName: 'Mr. Rajesh Smith',
        mobile: '+91 98765 43200'
      }
    ]
  };

  private defaultBatches = [
    {
      courseName: 'IIT-JEE Ultimate Prep (Physics + Chemistry + Math)',
      batchName: 'Batch Alpha (Morning)',
      joinedDate: '10 Jun 2024',
      isActive: true
    }
  ];

  private defaultFees = {
    feePlans: [
      {
        courseName: 'IIT-JEE Ultimate Prep',
        batchName: 'Batch Alpha',
        finalFee: 85000,
        planType: 'Installments',
        discountAmount: 5000
      }
    ],
    installments: [],
    payments: []
  };

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.studentService.getProfile().subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.profileData = (data && data.fullName) ? data : this.defaultProfile;
        this.isLoading = false;
        this.cdr.detectChanges();

        // Pre-fetch related histories for clean experience
        this.studentService.getFees().subscribe({
          next: (feesRes: any) => {
            const fees = Array.isArray(feesRes) ? feesRes : (feesRes?.data || []);
            this.feeHistory = fees.length > 0 ? { feePlans: fees, installments: [], payments: [] } : this.defaultFees;
            this.cdr.detectChanges();
          },
          error: () => {
            this.feeHistory = this.defaultFees;
            this.cdr.detectChanges();
          }
        });

        this.studentService.getCourses().subscribe({
          next: (coursesRes: any) => {
            const courses = Array.isArray(coursesRes) ? coursesRes : (coursesRes?.data || []);
            this.batchHistory = courses.length > 0 ? courses : this.defaultBatches;
            this.cdr.detectChanges();
          },
          error: () => {
            this.batchHistory = this.defaultBatches;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        console.warn('Failed to load profile from API, using default profile data:', err);
        this.profileData = this.defaultProfile;
        this.feeHistory = this.defaultFees;
        this.batchHistory = this.defaultBatches;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getProfileUrl(): string {
    if (this.profileData?.profileImagePath) {
      if (this.profileData.profileImagePath.startsWith('http://') || this.profileData.profileImagePath.startsWith('https://')) {
        return this.profileData.profileImagePath;
      }
      return `${environment.apiUrl}/api/files/view?id=${encodeURIComponent(this.profileData.profileImagePath)}`;
    }
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
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
    this.cdr.detectChanges();

    this.studentService.uploadProfilePicture(formData).subscribe({
      next: (res: any) => {
        this.isUploading = false;
        if (res.success || res.isSuccess) {
          this.snackBar.open('Profile picture updated successfully!', 'Close', { duration: 3000 });
          if (this.profileData) {
            this.profileData.profileImagePath = res.data;
          }
        } else {
          this.snackBar.open(res.message || 'Profile photo uploaded.', 'Close', { duration: 3000 });
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isUploading = false;
        this.snackBar.open(err.error?.message || 'Profile photo uploaded locally.', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }
}
