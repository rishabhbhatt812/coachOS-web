import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { CrmFacade } from '../../../core/facades/crm.facade';
import { CourseFacade } from '../../../core/facades/course.facade';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateEnquiryRequest, UpdateEnquiryRequest } from '../../../core/models/api-schemas';

@Component({
  selector: 'app-admin-crm',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    DataTableComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-crm.component.html',
  styleUrl: './admin-crm.component.scss'
})
export class AdminCrmComponent implements OnInit {
  private crmFacade = inject(CrmFacade);
  private courseFacade = inject(CourseFacade);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  enquiries$ = this.crmFacade.enquiries$;
  courses$ = this.courseFacade.courses$;
  isLoading$ = this.crmFacade.isLoading$;
  showAddForm = false;
  editingId: string | null = null;
  crmForm!: FormGroup;

  columns: TableColumn[] = [
    { key: 'fullName', header: 'Name' },
    { key: 'interestedCourseName', header: 'Course' },
    { key: 'mobile', header: 'Mobile' },
    { key: 'source', header: 'Source' },
    { key: 'status', header: 'Status', type: 'badge', badgeColorMap: { 'Hot': 'orange', 'Warm': 'blue', 'Cold': 'gray', 'Converted': 'green' } },
    { key: 'actions', header: 'Actions', type: 'action' }
  ];

  ngOnInit() {
    this.crmFacade.loadEnquiries();
    this.courseFacade.loadCourses();
    this.initForm();
  }

  initForm() {
    this.crmForm = this.fb.group({
      fullName: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      interestedCourseId: ['', [Validators.required]],
      previousSchoolOrCollege: [''],
      source: ['Website', [Validators.required]],
      status: ['Hot']
    });
  }

  toggleForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.editingId = null;
      this.crmForm.reset({ source: 'Website', interestedCourseId: '', status: 'Hot' });
    }
  }

  onSubmit() {
    if (this.crmForm.valid) {
      const val = this.crmForm.value;
      if (this.editingId) {
        const req: UpdateEnquiryRequest = {
          fullName: val.fullName,
          mobile: val.mobile,
          email: val.email,
          interestedCourseId: val.interestedCourseId,
          previousSchoolOrCollege: val.previousSchoolOrCollege || undefined,
          source: val.source,
          status: val.status
        };
        this.crmFacade.updateEnquiry(this.editingId, req).subscribe({
          next: () => {
            this.snackBar.open('Enquiry updated successfully!', 'Dismiss', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: ['success-snackbar'] });
            this.toggleForm();
          },
          error: (err) => console.error('Failed to update enquiry:', err)
        });
      } else {
        const req: CreateEnquiryRequest = {
          fullName: val.fullName,
          mobile: val.mobile,
          email: val.email,
          interestedCourseId: val.interestedCourseId,
          previousSchoolOrCollege: val.previousSchoolOrCollege || undefined,
          source: val.source
        };
        this.crmFacade.createEnquiry(req).subscribe({
          next: () => {
            this.snackBar.open('Lead enquiry added successfully!', 'Dismiss', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: ['success-snackbar'] });
            this.toggleForm();
          },
          error: (err) => console.error('Failed to create enquiry:', err)
        });
      }
    }
  }

  onActionClicked(event: any) {
    if (event.action === 'edit') {
      this.editingId = event.row.id;
      this.crmForm.patchValue({
        fullName: event.row.fullName,
        mobile: event.row.mobile,
        email: event.row.email,
        interestedCourseId: event.row.interestedCourseId,
        previousSchoolOrCollege: event.row.previousSchoolOrCollege || '',
        source: event.row.source,
        status: event.row.status
      });
      this.showAddForm = true;
    } else if (event.action === 'delete') {
      if (confirm('Are you sure you want to delete this enquiry: ' + event.row.fullName + '?')) {
        this.crmFacade.deleteEnquiry(event.row.id).subscribe({
          next: () => {
            this.snackBar.open('Enquiry deleted successfully!', 'Dismiss', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: ['success-snackbar'] });
          },
          error: (err) => console.error('Failed to delete enquiry:', err)
        });
      }
    }
  }
}
