import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AdmissionsService } from '../../../../core/services/admissions.service';
import { environment } from '../../../../core/constants/api-endpoints';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [
    CommonModule, 
    MatTabsModule, 
    MatIconModule, 
    MatButtonModule, 
    MatSnackBarModule
  ],
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.scss']
})
export class StudentProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private admissionsService = inject(AdmissionsService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  studentId!: string;
  profileData: any = null;
  feeHistory: any = null;
  batchHistory: any = null;
  isLoading = true;
  isUploading = false;

  // Receipt Modal State
  showAdmissionReceiptModal = false;
  showPaymentReceiptModal = false;
  selectedPayment: any = null;
  todayDate = new Date();

  goBack() {
    this.router.navigate(['/admin/students']);
  }

  ngOnInit() {
    this.studentId = this.route.snapshot.paramMap.get('id')!;
    this.loadProfile();
    this.loadFeeHistory();
    this.loadBatchHistory();
  }

  loadProfile() {
    this.isLoading = true;
    this.admissionsService.getStudentProfile(this.studentId).subscribe({
      next: (data) => {
        this.profileData = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading student profile:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadFeeHistory() {
    this.admissionsService.getFeeHistory(this.studentId).subscribe({
      next: (res) => {
        this.feeHistory = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading fee history:', err)
    });
  }

  loadBatchHistory() {
    this.admissionsService.getBatchHistory(this.studentId).subscribe({
      next: (res) => {
        this.batchHistory = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading batch history:', err)
    });
  }

  onTabChange(event: any) {
    if (event.index === 1 && !this.batchHistory) {
      this.loadBatchHistory();
    } else if (event.index === 2 && !this.feeHistory) {
      this.loadFeeHistory();
    }
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
    this.cdr.detectChanges();

    this.admissionsService.uploadProfilePicture(this.studentId, formData).subscribe({
      next: (res) => {
        this.isUploading = false;
        if (res.success || res.isSuccess) {
          this.snackBar.open('Profile picture updated successfully!', 'Close', { duration: 3000 });
          if (this.profileData) {
            this.profileData.profileImagePath = res.data;
          }
        } else {
          this.snackBar.open(res.message || 'Failed to upload profile picture.', 'Close', { duration: 3000 });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isUploading = false;
        this.snackBar.open(err.error?.message || 'Error uploading profile picture.', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  // --- Modal & Receipt Management ---
  downloadAdmissionReceipt() {
    this.openAdmissionReceiptModal();
  }

  openAdmissionReceiptModal() {
    this.showAdmissionReceiptModal = true;
    this.cdr.detectChanges();
  }

  closeAdmissionReceiptModal() {
    this.showAdmissionReceiptModal = false;
  }

  openPaymentReceiptModal(payment: any) {
    this.selectedPayment = payment;
    this.showPaymentReceiptModal = true;
    this.cdr.detectChanges();
  }

  closePaymentReceiptModal() {
    this.showPaymentReceiptModal = false;
    this.selectedPayment = null;
  }

  downloadSinglePaymentReceipt(payment: any) {
    this.openPaymentReceiptModal(payment);
  }

  // Helper getters for robust receipt rendering
  getCourseName(): string {
    return this.feeHistory?.feePlans?.[0]?.courseName || 
           this.batchHistory?.[0]?.courseName || 
           this.profileData?.currentBatch?.courseName || 
           'Classroom Coaching Program';
  }

  getBatchName(): string {
    return this.feeHistory?.feePlans?.[0]?.batchName || 
           this.batchHistory?.[0]?.batchName || 
           this.profileData?.currentBatch?.name || 
           'Standard Batch';
  }

  getTotalFee(): number {
    const plan = this.feeHistory?.feePlans?.[0];
    if (plan && plan.totalFee) return plan.totalFee;
    if (plan && plan.finalFee) return plan.finalFee + (plan.discountAmount || 0);
    return 45000;
  }

  getDiscountAmount(): number {
    return this.feeHistory?.feePlans?.[0]?.discountAmount || 5000;
  }

  getNetFee(): number {
    return this.feeHistory?.feePlans?.[0]?.finalFee || (this.getTotalFee() - this.getDiscountAmount());
  }

  getPaidAmount(): number {
    if (!this.feeHistory?.payments || this.feeHistory.payments.length === 0) {
      return 0;
    }
    return this.feeHistory.payments.reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
  }

  getDueAmount(): number {
    const net = this.getNetFee();
    const paid = this.getPaidAmount();
    return Math.max(0, net - paid);
  }

  // --- Print Handler using Hidden IFrame ---
  printReceiptElement(elementId: string) {
    const printContent = document.getElementById(elementId);
    if (!printContent) return;

    let iframe = document.getElementById('print-receipt-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'print-receipt-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admission Receipt - ${this.profileData?.fullName || 'Student'}</title>
          <style>
            @page { size: A4 portrait; margin: 12mm; }
            * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
            body { margin: 0; padding: 0; color: #0f172a; background: #ffffff; }
            .receipt-print-wrapper { width: 100%; max-width: 760px; margin: 0 auto; padding: 20px; }
            .receipt-document { border: 2px solid #e2e8f0; border-radius: 12px; padding: 28px; background: #ffffff; }
            .receipt-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 20px; }
            .brand-col h2 { font-size: 22px; font-weight: 800; color: #1e1b4b; margin: 0 0 4px; }
            .brand-col p { font-size: 11px; color: #64748b; margin: 0; }
            .badge-col { text-align: right; }
            .receipt-title-badge { display: inline-block; font-size: 12px; font-weight: 800; text-transform: uppercase; background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; padding: 4px 10px; border-radius: 6px; }
            .receipt-meta-row { font-size: 11px; color: #64748b; margin-top: 6px; }
            .section-box { margin-bottom: 18px; }
            .section-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; font-size: 12px; line-height: 1.5; }
            .info-item { display: flex; }
            .info-item .lbl { width: 130px; font-weight: 600; color: #64748b; flex-shrink: 0; }
            .info-item .val { font-weight: 700; color: #0f172a; word-break: break-word; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 700; color: #475569; }
            .text-right { text-align: right; }
            .total-row { background-color: #f1f5f9; font-weight: 800; }
            .declaration-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 10px; font-size: 10px; color: #64748b; line-height: 1.4; margin-top: 16px; }
            .signatures-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
            .signature-block { width: 180px; text-align: center; border-top: 1px solid #94a3b8; padding-top: 6px; font-size: 11px; font-weight: 600; color: #475569; }
            .stamp-box { width: 80px; height: 80px; border: 2px dashed #94a3b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; text-align: center; transform: rotate(-10deg); }
          </style>
        </head>
        <body>
          <div class="receipt-print-wrapper">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 250);
  }
}
