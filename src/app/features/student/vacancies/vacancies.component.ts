import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StudentFacade } from '../../../core/facades/student.facade';
import { DialogService } from '../../../core/services/dialog.service';
import { environment } from '../../../core/constants/api-endpoints';

@Component({
  selector: 'app-vacancies',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    PageHeaderComponent
  ],
  templateUrl: './vacancies.component.html',
  styleUrl: './vacancies.component.scss'
})
export class VacanciesComponent implements OnInit {
  private studentFacade = inject(StudentFacade);
  private dialogService = inject(DialogService);
  private snackBar = inject(MatSnackBar);

  Math = Math;
  activeTab: 'MATCHED' | 'ALL' = 'MATCHED';
  selectedCategory = 'ALL';
  searchQuery = '';

  studentQualification = 'Bachelor\'s Degree (Science / Prep)';
  bookmarkedIds = new Set<string>();

  categories = [
    'ALL',
    'SSC & Central Govt',
    'Banking & Insurance',
    'UPSC & Civil Services',
    'Defence & Armed Forces',
    'Railways',
    'Engineering & Technical',
    'Medical & Healthcare'
  ];

  vacancies: any[] = [
    {
      id: 'v1',
      title: 'SSC CGL 2026 Examination Notice',
      department: 'Staff Selection Commission (Govt of India)',
      examCategory: 'SSC & Central Govt',
      qualificationRequired: 'Bachelor\'s Degree',
      ageLimit: '18-32 Years',
      totalPosts: '17,727 Posts',
      salaryRange: '₹44,900 - ₹1,42,400 (Pay Level 7)',
      applicationFee: '₹100 (Exempted for Women/SC/ST)',
      startDate: '2026-06-01',
      lastDate: '2026-09-17',
      officialLink: 'https://ssc.gov.in',
      description: 'Staff Selection Commission (SSC) has released the official notification for Combined Graduate Level (CGL) Exam 2026 for various Group B and Group C posts in Ministries and Departments.',
      eligibilityDetails: 'Must possess a Bachelor\'s Degree in any discipline from a recognized University.',
      notificationPdfUrl: '',
      isMatched: true,
      matchBadgeText: '✓ Matched for Your Qualification',
      daysRemaining: 25,
      isExpired: false
    },
    {
      id: 'v2',
      title: 'IBPS PO / MT XVI Recruitment 2026',
      department: 'Institute of Banking Personnel Selection',
      examCategory: 'Banking & Insurance',
      qualificationRequired: 'Any Graduate',
      ageLimit: '20-30 Years',
      totalPosts: '4,455 Posts',
      salaryRange: '₹52,000 - ₹68,000 / month approx.',
      applicationFee: '₹850 (₹175 for SC/ST)',
      startDate: '2026-08-01',
      lastDate: '2026-09-10',
      officialLink: 'https://ibps.in',
      description: 'IBPS PO recruitment notification for probationary officers/management trainees in participating public sector banks across India.',
      eligibilityDetails: 'A Degree (Graduation) in any discipline from a University recognized by the Govt. Of India.',
      notificationPdfUrl: '',
      isMatched: true,
      matchBadgeText: '✓ Matched for Your Qualification',
      daysRemaining: 18,
      isExpired: false
    },
    {
      id: 'v3',
      title: 'NDA & NA Examination (II) 2026',
      department: 'Union Public Service Commission (UPSC)',
      examCategory: 'Defence & Armed Forces',
      qualificationRequired: '12th Pass',
      ageLimit: '16.5 - 19.5 Years',
      totalPosts: '404 Posts',
      salaryRange: '₹56,100 / month (Cadet Training Stipend)',
      applicationFee: '₹100 (Free for Female/SC/ST)',
      startDate: '2026-05-15',
      lastDate: '2026-09-04',
      officialLink: 'https://upsc.gov.in',
      description: 'National Defence Academy and Naval Academy Examination (II) 2026 for admission to Army, Navy and Air Force wings of NDA.',
      eligibilityDetails: '12th Class pass of the 10+2 pattern of School Education with Physics, Chemistry and Mathematics for Air Force and Navy.',
      notificationPdfUrl: '',
      isMatched: true,
      matchBadgeText: '✓ Matched for Your Qualification',
      daysRemaining: 12,
      isExpired: false
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
      applicationFee: '₹500 (₹250 refundable on CBT-1)',
      startDate: '2026-09-01',
      lastDate: '2026-09-27',
      officialLink: 'https://indianrailways.gov.in',
      description: 'Recruitment for various NTPC (Graduate & Undergraduate) posts such as Station Master, Goods Guard, Junior Clerk, Typist, and Commercial Apprentice.',
      eligibilityDetails: '12th (+2 Stage) or equivalent for Under Graduate Posts, and University Degree or its equivalent for Graduate level posts.',
      notificationPdfUrl: '',
      isMatched: true,
      matchBadgeText: '✓ Matched for Your Qualification',
      daysRemaining: 35,
      isExpired: false
    }
  ];

  isLoading$ = this.studentFacade.isLoading$;

  ngOnInit() {
    this.studentFacade.loadVacancies();
    this.studentFacade.vacancies$.subscribe({
      next: (res: any) => {
        if (res && res.vacancies && Array.isArray(res.vacancies) && res.vacancies.length > 0) {
          this.vacancies = res.vacancies;
          if (res.studentQualification) {
            this.studentQualification = res.studentQualification;
          }
        } else if (Array.isArray(res) && res.length > 0) {
          this.vacancies = res;
        }
      }
    });
  }

  get matchedVacanciesCount(): number {
    return this.vacancies.filter(v => v.isMatched && !v.isExpired).length;
  }

  get filteredVacancies(): any[] {
    let list = this.vacancies;

    if (this.activeTab === 'MATCHED') {
      list = list.filter(v => v.isMatched);
    }

    if (this.selectedCategory && this.selectedCategory !== 'ALL') {
      list = list.filter(v => v.examCategory === this.selectedCategory || v.department?.includes(this.selectedCategory));
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(v => 
        v.title.toLowerCase().includes(q) ||
        v.department?.toLowerCase().includes(q) ||
        v.qualificationRequired?.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q)
      );
    }

    return list;
  }

  applyVacancy(link?: string) {
    if (!link) return;
    window.open(link, '_blank');
  }

  downloadBrochure(vac: any) {
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

  toggleBookmark(vacId: string) {
    if (this.bookmarkedIds.has(vacId)) {
      this.bookmarkedIds.delete(vacId);
      this.snackBar.open('Bookmark removed.', 'Dismiss', { duration: 2000 });
    } else {
      this.bookmarkedIds.add(vacId);
      this.snackBar.open('✓ Vacancy bookmarked in your tracker!', 'Dismiss', { duration: 2500 });
    }
  }
}
