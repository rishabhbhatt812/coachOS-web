import { Component, inject, OnInit } from '@angular/core';
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

  studentId!: string;
  profileData: any;
  feeHistory: any;
  batchHistory: any;
  isUploading = false;

  goBack() {
    this.router.navigate(['/admin/students']);
  }

  ngOnInit() {
    this.studentId = this.route.snapshot.paramMap.get('id')!;
    this.loadProfile();
    // Load fee history eagerly for admission receipts
    this.admissionsService.getFeeHistory(this.studentId).subscribe(res => this.feeHistory = res);
  }

  loadProfile() {
    this.admissionsService.getStudentProfile(this.studentId).subscribe(data => {
      this.profileData = data;
    });
  }

  onTabChange(event: any) {
    if (event.index === 1 && !this.batchHistory) { // Batches Tab
      this.admissionsService.getBatchHistory(this.studentId).subscribe(res => this.batchHistory = res);
    } else if (event.index === 2 && !this.feeHistory) { // Fees Tab
      this.admissionsService.getFeeHistory(this.studentId).subscribe(res => this.feeHistory = res);
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
      },
      error: (err) => {
        this.isUploading = false;
        this.snackBar.open(err.error?.message || 'Error uploading profile picture.', 'Close', { duration: 3000 });
      }
    });
  }

  downloadAdmissionReceipt() {
    if (!this.profileData) return;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      this.snackBar.open('Pop-up blocked. Please allow popups to print.', 'Dismiss', { duration: 3000 });
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Admission Receipt - ${this.profileData.fullName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 20px; }
            .receipt-card { border: 2px solid #e2e8f0; padding: 30px; border-radius: 12px; max-width: 700px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px; }
            .logo-title { font-size: 24px; font-weight: bold; color: #1e3a8a; }
            .title { font-size: 18px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #3b82f6; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .field { font-size: 13px; line-height: 1.5; }
            .label { font-weight: bold; color: #64748b; display: inline-block; width: 130px; }
            .value { color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; font-size: 13px; }
            th { background-color: #f8fafc; color: #475569; font-weight: bold; }
            .total-row { font-weight: bold; background-color: #f1f5f9; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .signature-block { border-top: 1px solid #94a3b8; width: 200px; text-align: center; padding-top: 5px; font-size: 12px; color: #64748b; }
            @media print {
              body { padding: 0; }
              .receipt-card { border: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <div>
                <div class="logo-title">EduNex</div>
                <div style="font-size: 12px; color: #64748b;">Premier Coaching Institute Management</div>
              </div>
              <div class="title">Admission Receipt</div>
            </div>

            <div class="section">
              <div class="section-title">Student Details</div>
              <div class="grid">
                <div class="field"><span class="label">Student Code:</span><span class="value">${this.profileData.studentCode || 'N/A'}</span></div>
                <div class="field"><span class="label">Admission Date:</span><span class="value">${this.profileData.admissionDate || 'N/A'}</span></div>
                <div class="field"><span class="label">Full Name:</span><span class="value">${this.profileData.fullName || 'N/A'}</span></div>
                <div class="field"><span class="label">Mobile Number:</span><span class="value">${this.profileData.mobile || 'N/A'}</span></div>
                <div class="field"><span class="label">Email Address:</span><span class="value">${this.profileData.email || 'N/A'}</span></div>
                <div class="field"><span class="label">Date of Birth:</span><span class="value">${this.profileData.dateOfBirth || 'N/A'}</span></div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Academic Details</div>
              <div class="grid">
                <div class="field"><span class="label">Course Name:</span><span class="value">${this.profileData.currentBatch?.courseName || 'N/A'}</span></div>
                <div class="field"><span class="label">Batch Name:</span><span class="value">${this.profileData.currentBatch?.name || 'N/A'}</span></div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Fee Summary</div>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="text-align: right;">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Course Program Fees</td>
                    <td style="text-align: right;">₹${(this.feeHistory?.feePlans?.[0]?.totalFee || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Applied Scholarship / Discount</td>
                    <td style="text-align: right; color: #b91c1c;">- ₹${(this.feeHistory?.feePlans?.[0]?.discountAmount || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr class="total-row">
                    <td>Net Payable Course Fee</td>
                    <td style="text-align: right; color: #1e3a8a;">₹${(this.feeHistory?.feePlans?.[0]?.finalFee || 0).toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="footer">
              <div class="signature-block" style="margin-top: 60px;">
                Student / Parent Signature
              </div>
              <div class="signature-block" style="margin-top: 60px;">
                Authorized Signatory
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  downloadSinglePaymentReceipt(payment: any) {
    if (!this.profileData) return;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      this.snackBar.open('Pop-up blocked. Please allow popups to print.', 'Dismiss', { duration: 3000 });
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Payment Receipt - ${payment.receiptNo}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 20px; }
            .receipt-card { border: 2px solid #e2e8f0; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; position: relative; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 25px; }
            .logo-title { font-size: 24px; font-weight: bold; color: #065f46; }
            .title { font-size: 16px; font-weight: bold; color: #059669; text-transform: uppercase; letter-spacing: 1px; }
            .field { font-size: 14px; line-height: 1.8; margin-bottom: 10px; }
            .label { font-weight: bold; color: #64748b; display: inline-block; width: 160px; }
            .value { color: #1e293b; }
            .amount-box { background-color: #ecfdf5; border: 1px dashed #10b981; padding: 15px; border-radius: 8px; font-size: 18px; font-weight: bold; color: #065f46; margin: 20px 0; text-align: center; }
            .footer { margin-top: 50px; display: flex; justify-content: flex-end; }
            .signature-block { border-top: 1px solid #94a3b8; width: 200px; text-align: center; padding-top: 5px; font-size: 12px; color: #64748b; }
            @media print {
              body { padding: 0; }
              .receipt-card { border: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <div>
                <div class="logo-title">EduNex</div>
                <div style="font-size: 11px; color: #64748b;">Transaction Confirmation</div>
              </div>
              <div class="title">Payment Receipt</div>
            </div>

            <div class="field"><span class="label">Receipt Number:</span><span class="value" style="font-family: monospace; font-weight: bold;">${payment.receiptNo}</span></div>
            <div class="field"><span class="label">Payment Date:</span><span class="value">${new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
            <div class="field"><span class="label">Student Code:</span><span class="value">${this.profileData.studentCode || 'N/A'}</span></div>
            <div class="field"><span class="label">Received From:</span><span class="value" style="font-weight: bold;">${this.profileData.fullName}</span></div>
            <div class="field"><span class="label">Payment Mode:</span><span class="value">${payment.paymentMode || 'N/A'}</span></div>

            <div class="amount-box">
              Amount Paid: ₹${payment.amount.toLocaleString('en-IN')}.00
            </div>

            <div class="field" style="margin-top: 15px; font-size: 12px; color: #64748b; font-style: italic;">
              This is a computer-generated transaction receipt. No physical signature is required.
            </div>

            <div class="footer">
              <div class="signature-block" style="margin-top: 30px;">
                Authorized Cashier / System
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
