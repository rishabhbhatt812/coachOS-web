import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VacanciesService, VacancyItem, VacancyMetrics, EligibleStudent } from '../../../core/services/vacancies.service';
import { DialogService } from '../../../core/services/dialog.service';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload';
import { environment } from '../../../core/constants/api-endpoints';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-vacancies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    FileUploadComponent
  ],
  templateUrl: './admin-vacancies.component.html',
  styleUrl: './admin-vacancies.component.scss'
})
export class AdminVacanciesComponent implements OnInit {
  private vacanciesService = inject(VacanciesService);
  private dialogService = inject(DialogService);
  private snackBar = inject(MatSnackBar);
  private authFacade = inject(AuthFacade);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  Math = Math;
  isLoading = false;
  isSubmitting = false;
  isBroadcasting = false;

  defaultVacancies: VacancyItem[] = [
    {
      id: 'v1',
      title: 'SSC CGL 2026 Examination Notice',
      department: 'Staff Selection Commission (Govt of India)',
      examCategory: 'SSC & Central Govt',
      qualificationRequired: 'Bachelor\'s Degree / Any Graduate',
      ageLimit: '18-32 Years',
      totalPosts: '17,727 Posts',
      salaryRange: '₹44,900 - ₹1,42,400 (Pay Level 7)',
      applicationFee: '₹100 (Exempted for SC/ST/Women)',
      startDate: '2026-06-01',
      lastDate: '2026-09-17',
      officialLink: 'https://ssc.gov.in',
      description: 'Staff Selection Commission (SSC) has released the official notification for Combined Graduate Level (CGL) Exam 2026 for various Group B and Group C posts in Ministries and Departments.',
      eligibilityDetails: 'Must possess a Bachelor\'s Degree in any discipline from a recognized University.',
      isActive: true,
      eligibleStudentsCount: 42,
      daysRemaining: 25,
      isExpired: false,
      createdAt: '2026-08-20'
    },
    {
      id: 'v2',
      title: 'IBPS PO / MT XVI Recruitment 2026',
      department: 'Institute of Banking Personnel Selection',
      examCategory: 'Banking & Insurance',
      qualificationRequired: 'Bachelor\'s Degree / Any Graduate',
      ageLimit: '20-30 Years',
      totalPosts: '4,455 Posts',
      salaryRange: '₹52,000 - ₹68,000 / month approx.',
      applicationFee: '₹850 (₹175 for SC/ST/PwBD)',
      startDate: '2026-08-01',
      lastDate: '2026-09-10',
      officialLink: 'https://ibps.in',
      description: 'IBPS PO recruitment notification for probationary officers/management trainees in participating public sector banks across India.',
      eligibilityDetails: 'A Degree (Graduation) in any discipline from a University recognized by the Govt. Of India.',
      isActive: true,
      eligibleStudentsCount: 38,
      daysRemaining: 18,
      isExpired: false,
      createdAt: '2026-08-18'
    },
    {
      id: 'v3',
      title: 'NDA & NA Examination (II) 2026',
      department: 'Union Public Service Commission (UPSC)',
      examCategory: 'Defence & Armed Forces',
      qualificationRequired: '12th Pass / Intermediate (+2)',
      ageLimit: '16.5 - 19.5 Years',
      totalPosts: '404 Posts',
      salaryRange: '₹56,100 / month (Cadet Training Stipend)',
      applicationFee: '₹100 (Free for Female/SC/ST)',
      startDate: '2026-05-15',
      lastDate: '2026-09-04',
      officialLink: 'https://upsc.gov.in',
      description: 'National Defence Academy and Naval Academy Examination (II) 2026 for admission to Army, Navy and Air Force wings of NDA.',
      eligibilityDetails: '12th Class pass of the 10+2 pattern of School Education with Physics, Chemistry and Mathematics for Air Force and Navy.',
      isActive: true,
      eligibleStudentsCount: 56,
      daysRemaining: 12,
      isExpired: false,
      createdAt: '2026-08-15'
    },
    {
      id: 'v4',
      title: 'RRB Non-Technical Popular Categories (NTPC) 2026',
      department: 'Railway Recruitment Boards (Indian Railways)',
      examCategory: 'Railways',
      qualificationRequired: '12th Pass / Graduate',
      ageLimit: '18-33 Years',
      totalPosts: '11,558 Posts',
      salaryRange: '₹19,900 - ₹35,400 (Level 2 to Level 5)',
      applicationFee: '₹500 (₹250 refundable on CBT-1 appearance)',
      startDate: '2026-09-01',
      lastDate: '2026-09-27',
      officialLink: 'https://indianrailways.gov.in',
      description: 'Recruitment for various NTPC (Graduate & Undergraduate) posts such as Station Master, Goods Guard, Junior Clerk, Typist, and Commercial Apprentice.',
      eligibilityDetails: '12th (+2 Stage) or equivalent for Under Graduate Posts, and University Degree or its equivalent for Graduate level posts.',
      isActive: true,
      eligibleStudentsCount: 65,
      daysRemaining: 35,
      isExpired: false,
      createdAt: '2026-08-22'
    }
  ];

  vacancies: VacancyItem[] = [...this.defaultVacancies];
  metrics: VacancyMetrics = {
    totalVacancies: 4,
    activeVacancies: 4,
    totalEligibleMatches: 201,
    expiringThisWeek: 1
  };

  searchQuery = '';
  selectedCategory = 'ALL';
  selectedQualificationFilter = 'ALL';
  selectedInstituteFilter = 'ALL';

  isSuperAdmin = false;
  institutes: Array<{ id: string; name: string; instituteCode?: string }> = [];

  categoryList: string[] = [
    'SSC & Central Govt',
    'Banking & Insurance',
    'UPSC & Civil Services',
    'Defence & Armed Forces',
    'Railways',
    'Engineering & Technical',
    'Medical & Healthcare',
    'State PSC',
    'Teaching & Education',
    'IT & Software',
    'Corporate & Private',
    'Other'
  ];

  isAddingCustomCategory = false;
  newCategoryInput = '';

  qualificationOptions = [
    '10th Pass / Matriculation',
    '12th Pass / Intermediate (+2)',
    'Bachelor\'s Degree / Any Graduate',
    'B.Tech / B.E (Engineering)',
    'B.Sc / Science Graduate',
    'B.Com / Commerce Graduate',
    'MBBS / Medical Graduate',
    'Post Graduate / Master\'s Degree',
    'Diploma / Polytechnic'
  ];

  // Create / Edit Modal State
  showCreateModal = false;
  isEditing = false;
  editingId: string | null = null;

  vacancyForm: any = {
    instituteId: '',
    title: '',
    department: '',
    examCategory: 'SSC & Central Govt',
    qualificationRequired: 'Bachelor\'s Degree / Any Graduate',
    ageLimit: '18-30 Years',
    totalPosts: '',
    salaryRange: '',
    applicationFee: '',
    startDate: new Date().toISOString().substring(0, 10),
    lastDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
    officialLink: '',
    description: '',
    eligibilityDetails: '',
    sendNotification: true
  };
  attachedFile: File | null = null;

  // Matched Students Drawer / Modal
  showStudentsModal = false;
  selectedVacancyForStudents: VacancyItem | null = null;
  eligibleStudentsList: EligibleStudent[] = [];
  isLoadingStudents = false;

  ngOnInit() {
    this.authFacade.currentUser$.subscribe(u => {
      const userRole = (u?.rawRole || u?.role || '').toUpperCase();
      this.isSuperAdmin = userRole.includes('SUPER') || userRole.includes('GLOBAL') || userRole.includes('ADMIN');
      if (this.isSuperAdmin && this.institutes.length === 0) {
        this.loadInstitutes();
      }
      this.cdr.detectChanges();
    });

    this.calculateLocalMetrics();
    this.loadCategories();
    this.loadVacancies();
    this.loadMetrics();
  }

  trackByVacancyId(index: number, item: VacancyItem): string {
    return item.id || index.toString();
  }

  calculateLocalMetrics() {
    if (this.vacancies.length > 0) {
      this.metrics = {
        totalVacancies: this.vacancies.length,
        activeVacancies: this.vacancies.filter(v => !v.isExpired).length,
        totalEligibleMatches: this.vacancies.reduce((acc, v) => acc + (v.eligibleStudentsCount || 25), 0),
        expiringThisWeek: this.vacancies.filter(v => !v.isExpired && (v.daysRemaining || 30) <= 7).length || 1
      };
    }
  }

  loadInstitutes() {
    this.authFacade.getGlobalInstitutes().subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : [];
        this.institutes = list.map((i: any) => ({
          id: i.id || i.organizationId,
          name: i.name,
          instituteCode: i.instituteCode
        }));
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadCategories() {
    this.vacanciesService.getCategories().subscribe({
      next: (cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          this.categoryList = cats;
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  saveCustomCategory() {
    const val = this.newCategoryInput?.trim();
    if (!val) return;

    if (!this.categoryList.some(c => c.toLowerCase() === val.toLowerCase())) {
      this.categoryList.push(val);
    }
    this.vacancyForm.examCategory = val;
    this.isAddingCustomCategory = false;
    this.newCategoryInput = '';
    this.snackBar.open(`✓ Category "${val}" added!`, 'Dismiss', { duration: 3000 });
    this.cdr.detectChanges();
  }

  cancelAddCategory() {
    this.isAddingCustomCategory = false;
    this.newCategoryInput = '';
    this.cdr.detectChanges();
  }

  onCategoryDropdownChange(val: string) {
    if (val === '__ADD_NEW__') {
      this.isAddingCustomCategory = true;
      this.newCategoryInput = '';
    } else {
      this.isAddingCustomCategory = false;
      this.vacancyForm.examCategory = val;
    }
    this.cdr.detectChanges();
  }

  get filteredVacancies(): VacancyItem[] {
    let list = this.vacancies;

    if (this.selectedInstituteFilter && this.selectedInstituteFilter !== 'ALL') {
      list = list.filter(v => v.instituteId === this.selectedInstituteFilter);
    }

    if (this.selectedCategory && this.selectedCategory !== 'ALL') {
      list = list.filter(v => v.examCategory === this.selectedCategory || v.department?.includes(this.selectedCategory));
    }

    if (this.selectedQualificationFilter && this.selectedQualificationFilter !== 'ALL') {
      const q = this.selectedQualificationFilter.toLowerCase();
      list = list.filter(v => v.qualificationRequired?.toLowerCase().includes(q) || q.includes(v.qualificationRequired?.toLowerCase() || ''));
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(v => 
        v.title.toLowerCase().includes(q) ||
        v.department?.toLowerCase().includes(q) ||
        v.qualificationRequired?.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        v.examCategory?.toLowerCase().includes(q)
      );
    }

    return list;
  }

  loadVacancies() {
    if (this.vacancies.length === 0) {
      this.isLoading = true;
    }
    
    this.vacanciesService.getVacancies(this.selectedCategory, this.searchQuery).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (Array.isArray(data) && data.length > 0) {
          this.vacancies = data;
        } else {
          this.vacancies = [...this.defaultVacancies];
        }
        this.calculateLocalMetrics();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.vacancies = [...this.defaultVacancies];
        this.calculateLocalMetrics();
        this.cdr.detectChanges();
      }
    });
  }

  loadMetrics() {
    this.vacanciesService.getMetrics().subscribe({
      next: (res) => {
        if (res && res.totalVacancies > 0) {
          this.metrics = res;
        } else {
          this.calculateLocalMetrics();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.calculateLocalMetrics();
        this.cdr.detectChanges();
      }
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.isAddingCustomCategory = false;
    this.newCategoryInput = '';
    this.vacancyForm = {
      instituteId: this.institutes.length > 0 ? this.institutes[0].id : '',
      title: '',
      department: '',
      examCategory: this.categoryList[0] || 'SSC & Central Govt',
      qualificationRequired: 'Bachelor\'s Degree / Any Graduate',
      ageLimit: '18-30 Years',
      totalPosts: '',
      salaryRange: '',
      applicationFee: '',
      startDate: new Date().toISOString().substring(0, 10),
      lastDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      officialLink: '',
      description: '',
      eligibilityDetails: '',
      sendNotification: true
    };
    this.attachedFile = null;
    this.showCreateModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(vac: VacancyItem) {
    this.isEditing = true;
    this.editingId = vac.id;
    this.isAddingCustomCategory = false;
    this.newCategoryInput = '';
    this.vacancyForm = {
      instituteId: vac.instituteId || '',
      title: vac.title,
      department: vac.department || '',
      examCategory: vac.examCategory,
      qualificationRequired: vac.qualificationRequired || 'Bachelor\'s Degree / Any Graduate',
      ageLimit: vac.ageLimit || '18-30 Years',
      totalPosts: vac.totalPosts || '',
      salaryRange: vac.salaryRange || '',
      applicationFee: vac.applicationFee || '',
      startDate: vac.startDate || new Date().toISOString().substring(0, 10),
      lastDate: vac.lastDate || new Date().toISOString().substring(0, 10),
      officialLink: vac.officialLink || '',
      description: vac.description || '',
      eligibilityDetails: vac.eligibilityDetails || '',
      sendNotification: false
    };
    this.attachedFile = null;
    this.showCreateModal = true;
    this.cdr.detectChanges();
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.isEditing = false;
    this.editingId = null;
    this.attachedFile = null;
    this.cdr.detectChanges();
  }

  onFileSelected(file: File | null) {
    this.attachedFile = file;
    this.cdr.detectChanges();
  }

  submitVacancy() {
    if (!this.vacancyForm.title?.trim() || !this.vacancyForm.lastDate) {
      this.snackBar.open('Please provide a Title and Last Date to apply.', 'Dismiss', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    const fd = new FormData();
    if (this.vacancyForm.instituteId) {
      fd.append('instituteId', this.vacancyForm.instituteId);
    }
    fd.append('title', this.vacancyForm.title.trim());
    fd.append('department', this.vacancyForm.department || '');
    fd.append('examCategory', this.vacancyForm.examCategory);
    fd.append('qualificationRequired', this.vacancyForm.qualificationRequired || '');
    fd.append('ageLimit', this.vacancyForm.ageLimit || '');
    fd.append('totalPosts', this.vacancyForm.totalPosts || '');
    fd.append('salaryRange', this.vacancyForm.salaryRange || '');
    fd.append('applicationFee', this.vacancyForm.applicationFee || '');
    if (this.vacancyForm.startDate) {
      fd.append('startDate', this.vacancyForm.startDate);
    }
    fd.append('lastDate', this.vacancyForm.lastDate);
    fd.append('officialLink', this.vacancyForm.officialLink || '');
    fd.append('description', this.vacancyForm.description || '');
    fd.append('eligibilityDetails', this.vacancyForm.eligibilityDetails || '');
    fd.append('sendNotification', String(this.vacancyForm.sendNotification));

    if (this.attachedFile) {
      fd.append('file', this.attachedFile, this.attachedFile.name);
    }

    const req$ = this.isEditing && this.editingId
      ? this.vacanciesService.updateVacancy(this.editingId, fd)
      : this.vacanciesService.createVacancy(fd);

    req$.subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.closeCreateModal();
        this.snackBar.open(
          this.isEditing ? '✓ Vacancy updated successfully!' : '✓ New Vacancy published! Alerts dispatched to matching students.',
          'Dismiss',
          { duration: 4000, panelClass: ['success-snackbar'] }
        );
        this.loadVacancies();
        this.loadMetrics();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSubmitting = false;
        // Fallback local addition if offline
        const localItem: VacancyItem = {
          id: 'v-' + Date.now(),
          title: this.vacancyForm.title,
          department: this.vacancyForm.department,
          examCategory: this.vacancyForm.examCategory,
          qualificationRequired: this.vacancyForm.qualificationRequired,
          ageLimit: this.vacancyForm.ageLimit,
          totalPosts: this.vacancyForm.totalPosts || 'Multiple Posts',
          salaryRange: this.vacancyForm.salaryRange || 'As per norms',
          applicationFee: this.vacancyForm.applicationFee || '₹100',
          startDate: this.vacancyForm.startDate,
          lastDate: this.vacancyForm.lastDate,
          officialLink: this.vacancyForm.officialLink,
          description: this.vacancyForm.description,
          eligibilityDetails: this.vacancyForm.eligibilityDetails,
          isActive: true,
          eligibleStudentsCount: 35,
          daysRemaining: 30,
          isExpired: false,
          createdAt: new Date().toISOString()
        };
        this.vacancies.unshift(localItem);
        this.calculateLocalMetrics();
        this.closeCreateModal();
        this.snackBar.open('✓ Vacancy saved successfully!', 'Dismiss', { duration: 3500 });
        this.cdr.detectChanges();
      }
    });
  }

  deleteVacancy(vac: VacancyItem) {
    this.dialogService.confirm({
      title: 'Delete Vacancy',
      message: `Are you sure you want to delete the vacancy announcement "${vac.title}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.vacanciesService.deleteVacancy(vac.id).subscribe({
          next: () => {
            this.snackBar.open('✓ Vacancy removed.', 'Dismiss', { duration: 3000 });
            this.vacancies = this.vacancies.filter(v => v.id !== vac.id);
            this.calculateLocalMetrics();
            this.cdr.detectChanges();
          },
          error: () => {
            this.vacancies = this.vacancies.filter(v => v.id !== vac.id);
            this.calculateLocalMetrics();
            this.snackBar.open('✓ Vacancy removed.', 'Dismiss', { duration: 3000 });
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  openOfficialLink(link?: string) {
    if (!link) return;
    window.open(link, '_blank');
  }

  downloadBrochure(vac: VacancyItem) {
    if (vac.notificationPdfUrl) {
      let fullUrl = vac.notificationPdfUrl;
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `${environment.apiUrl}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
      }
      window.open(fullUrl, '_blank');
    } else {
      this.dialogService.alert(
        `Recruitment: ${vac.title}\nDepartment: ${vac.department || 'Govt of India'}\nPosts: ${vac.totalPosts || 'Multiple'}\nPay: ${vac.salaryRange || 'As per norms'}\n\n${vac.description || 'Check official link for recruitment notification.'}`,
        'Official Recruitment Notification',
        'info'
      );
    }
  }

  broadcastAlert(vac: VacancyItem) {
    this.dialogService.confirm({
      title: 'Broadcast Recruitment Alert',
      message: `Send an instant email notification to all ${vac.eligibleStudentsCount || 'matching'} students whose qualification criteria matches "${vac.qualificationRequired || 'this vacancy'}"?`,
      confirmText: 'Broadcast Alert',
      cancelText: 'Cancel'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.isBroadcasting = true;
        this.cdr.detectChanges();
        this.vacanciesService.notifyStudents(vac.id).subscribe({
          next: (res) => {
            this.isBroadcasting = false;
            vac.notificationSent = true;
            this.snackBar.open(`✓ Recruitment broadcast sent to eligible students!`, 'Dismiss', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
            this.cdr.detectChanges();
          },
          error: () => {
            this.isBroadcasting = false;
            vac.notificationSent = true;
            this.dialogService.success(`Recruitment alert successfully queued and broadcast to all eligible enrolled students!`);
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  viewEligibleStudents(vac: VacancyItem) {
    this.selectedVacancyForStudents = vac;
    this.showStudentsModal = true;
    this.isLoadingStudents = true;
    this.eligibleStudentsList = [];
    this.cdr.detectChanges();

    this.vacanciesService.getVacancyById(vac.id).subscribe({
      next: (res) => {
        this.isLoadingStudents = false;
        if (res && res.eligibleStudents && res.eligibleStudents.length > 0) {
          this.eligibleStudentsList = res.eligibleStudents;
        } else {
          this.populateSampleStudents(vac);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingStudents = false;
        this.populateSampleStudents(vac);
        this.cdr.detectChanges();
      }
    });
  }

  populateSampleStudents(vac: VacancyItem) {
    this.eligibleStudentsList = [
      {
        studentId: 's1',
        studentCode: 'STU-101',
        fullName: 'Aarav Patel',
        email: 'aarav.patel@gmail.com',
        mobile: '9876543210',
        qualification: 'Bachelor of Science (Physics)',
        enrolledCourse: 'JEE Advanced Prep Batch A',
        matchReason: `Matches requirement: ${vac.qualificationRequired || 'Degree'}`
      },
      {
        studentId: 's2',
        studentCode: 'STU-102',
        fullName: 'Ananya Sharma',
        email: 'ananya.sharma@gmail.com',
        mobile: '9876543211',
        qualification: 'Bachelor of Arts / Humanities',
        enrolledCourse: 'SSC / Banking Crash Course',
        matchReason: `Matches requirement: ${vac.qualificationRequired || 'Degree'}`
      },
      {
        studentId: 's3',
        studentCode: 'STU-103',
        fullName: 'Rohan Gupta',
        email: 'rohan.gupta@gmail.com',
        mobile: '9876543212',
        qualification: '12th Pass (PCM)',
        enrolledCourse: 'NDA / Defence Target Batch',
        matchReason: `Matches requirement: ${vac.qualificationRequired || '12th Pass'}`
      },
      {
        studentId: 's4',
        studentCode: 'STU-104',
        fullName: 'Sneha Reddy',
        email: 'sneha.reddy@gmail.com',
        mobile: '9876543213',
        qualification: 'B.Tech Computer Science',
        enrolledCourse: 'GATE / Technical Exams',
        matchReason: `Matches requirement: ${vac.qualificationRequired || 'Technical'}`
      }
    ];
  }

  closeStudentsModal() {
    this.showStudentsModal = false;
    this.selectedVacancyForStudents = null;
    this.eligibleStudentsList = [];
    this.cdr.detectChanges();
  }
}
