import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { StudentLayoutComponent } from './layouts/student-layout/student-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { moduleAccessGuard } from './core/guards/module-access.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) }
    ]
  },
  {
    path: 'pricing',
    loadComponent: () => import('./features/public/pricing/pricing.component').then(m => m.PublicPricingComponent)
  },
  {
    path: 'teacher',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['TEACHER', 'ADMIN'] },
    loadComponent: () => import('./layouts/teacher-layout/teacher-layout').then(m => m.TeacherLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/teacher/dashboard/teacher-dashboard/teacher-dashboard').then(m => m.TeacherDashboard) },
      { path: 'my-batches', canActivate: [moduleAccessGuard], data: { module: 'LEARNING' }, loadComponent: () => import('./features/teacher/batches/teacher-batches/teacher-batches').then(m => m.TeacherBatches) },
      { path: 'attendance', canActivate: [moduleAccessGuard], data: { module: 'ATTENDANCE' }, loadComponent: () => import('./features/teacher/attendance/teacher-attendance/teacher-attendance').then(m => m.TeacherAttendance) },
      { path: 'assignments', canActivate: [moduleAccessGuard], data: { module: 'LEARNING' }, loadComponent: () => import('./features/teacher/assignments/teacher-assignments/teacher-assignments').then(m => m.TeacherAssignments) },
      { path: 'results', canActivate: [moduleAccessGuard], data: { module: 'LEARNING' }, loadComponent: () => import('./features/teacher/results/teacher-results/teacher-results').then(m => m.TeacherResults) },
      { path: 'notes', canActivate: [moduleAccessGuard], data: { module: 'LEARNING' }, loadComponent: () => import('./features/teacher/notes/teacher-notes.component').then(m => m.TeacherNotesComponent) },
      { path: 'tests', canActivate: [moduleAccessGuard], data: { module: 'LEARNING' }, loadComponent: () => import('./features/teacher/tests/teacher-tests.component').then(m => m.TeacherTestsComponent) }
    ]
  },
  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['STUDENT'] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/student/dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent) },
      { path: 'my-course', canActivate: [moduleAccessGuard], data: { module: 'LEARNING' }, loadComponent: () => import('./features/student/my-course/my-course.component').then(m => m.MyCourseComponent) },
      { path: 'my-fees', canActivate: [moduleAccessGuard], data: { module: 'FEES' }, loadComponent: () => import('./features/student/my-fees/my-fees.component').then(m => m.MyFeesComponent) },
      { path: 'my-attendance', canActivate: [moduleAccessGuard], data: { module: 'ATTENDANCE' }, loadComponent: () => import('./features/student/my-attendance/my-attendance.component').then(m => m.MyAttendanceComponent) },
      { path: 'my-notes', canActivate: [moduleAccessGuard], data: { module: 'LEARNING' }, loadComponent: () => import('./features/student/my-notes/my-notes.component').then(m => m.MyNotesComponent) },
      { path: 'my-results', canActivate: [moduleAccessGuard], data: { module: 'LEARNING' }, loadComponent: () => import('./features/student/my-results/my-results.component').then(m => m.MyResultsComponent) },
      { path: 'vacancies', canActivate: [moduleAccessGuard], data: { module: 'LEARNING' }, loadComponent: () => import('./features/student/vacancies/vacancies.component').then(m => m.VacanciesComponent) },
      { path: 'notices', canActivate: [moduleAccessGuard], data: { module: 'COMMUNICATION' }, loadComponent: () => import('./features/student/notices/student-notices.component').then(m => m.StudentNoticesComponent) },
      { path: 'profile', loadComponent: () => import('./features/student/profile/student-profile-portal.component').then(m => m.StudentProfilePortalComponent) }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'students', loadComponent: () => import('./features/admin/students/admin-students.component').then(m => m.AdminStudentsComponent) },
      { path: 'students/admission', loadComponent: () => import('./features/admin/students/admission-wizard/admission-wizard.component').then(m => m.AdmissionWizardComponent) },
      { path: 'students/profile/:id', loadComponent: () => import('./features/admin/students/student-profile/student-profile.component').then(m => m.StudentProfileComponent) },
      { path: 'teachers', loadComponent: () => import('./features/admin/teachers/admin-teachers/admin-teachers.component').then(m => m.AdminTeachersComponent) },
      { path: 'staff', loadComponent: () => import('./features/admin/staff/admin-staff.component').then(m => m.AdminStaffComponent) },
      { path: 'courses', canActivate: [moduleAccessGuard], data: { module: 'LEARNING' }, loadComponent: () => import('./features/admin/courses/admin-courses.component').then(m => m.AdminCoursesComponent) },
      { path: 'batches', canActivate: [moduleAccessGuard], data: { module: 'LEARNING' }, loadComponent: () => import('./features/admin/batches/admin-batches.component').then(m => m.AdminBatchesComponent) },
      { path: 'branches', loadComponent: () => import('./features/admin/branches/admin-branches.component').then(m => m.AdminBranchesComponent) },
      { path: 'fees', canActivate: [moduleAccessGuard], data: { module: 'FEES' }, loadComponent: () => import('./features/admin/fees/admin-fees.component').then(m => m.AdminFeesComponent) },
      { path: 'crm', canActivate: [moduleAccessGuard], data: { module: 'CRM' }, loadComponent: () => import('./features/admin/crm/admin-crm.component').then(m => m.AdminCrmComponent) },
      { path: 'attendance', canActivate: [moduleAccessGuard], data: { module: 'ATTENDANCE' }, loadComponent: () => import('./features/admin/attendance/admin-attendance.component').then(m => m.AdminAttendanceComponent) },
      { path: 'notices', canActivate: [moduleAccessGuard], data: { module: 'COMMUNICATION' }, loadComponent: () => import('./features/admin/notices/admin-notices.component').then(m => m.AdminNoticesComponent) },
      { path: 'institutes', canActivate: [roleGuard], data: { roles: ['ADMIN'], requiresGlobalAdmin: true }, loadComponent: () => import('./features/admin/institutes/admin-institutes.component').then(m => m.AdminInstitutesComponent) },
      { path: 'plans', canActivate: [roleGuard], data: { roles: ['ADMIN'], requiresGlobalAdmin: true }, loadComponent: () => import('./features/admin/plans/admin-plans.component').then(m => m.AdminPlansComponent) },
      { path: 'support', loadComponent: () => import('./features/admin/support/admin-support.component').then(m => m.AdminSupportComponent) }
    ]
  },
  {
    path: 'receptionist',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['RECEPTIONIST'] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/receptionist/dashboard/receptionist-dashboard.component').then(m => m.ReceptionistDashboardComponent) },
      { path: 'crm', canActivate: [moduleAccessGuard], data: { module: 'CRM' }, loadComponent: () => import('./features/admin/crm/admin-crm.component').then(m => m.AdminCrmComponent) },
      { path: 'notices', canActivate: [moduleAccessGuard], data: { module: 'COMMUNICATION' }, loadComponent: () => import('./features/admin/notices/admin-notices.component').then(m => m.AdminNoticesComponent) },
      { path: 'support', loadComponent: () => import('./features/admin/support/admin-support.component').then(m => m.AdminSupportComponent) }
    ]
  },
  {
    path: 'super-admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'], requiresGlobalAdmin: true },
    children: [
      { path: 'organization-modules', loadComponent: () => import('./features/super-admin/organization-modules/organization-modules.component').then(m => m.OrganizationModulesComponent) },
      { path: 'plans', loadComponent: () => import('./features/admin/plans/admin-plans.component').then(m => m.AdminPlansComponent) },
      { path: 'support', loadComponent: () => import('./features/admin/support/admin-support.component').then(m => m.AdminSupportComponent) }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
