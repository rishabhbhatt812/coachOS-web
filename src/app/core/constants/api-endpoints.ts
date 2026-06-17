export const environment = {
  production: false,
  apiUrl: 'https://localhost:7046'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: environment.apiUrl + '/api/Auth/login',
    REGISTER_INSTITUTE: environment.apiUrl + '/api/Auth/register-institute',
    CREATE_USER: environment.apiUrl + '/api/Auth/create-user'
  },
  ADMIN: {
    ATTENDANCE: environment.apiUrl + '/api/admin/Attendance/sessions',
    BATCHES: environment.apiUrl + '/api/admin/Batches',
    COURSES: environment.apiUrl + '/api/admin/Courses',
    CRM_ENQUIRIES: environment.apiUrl + '/api/admin/Crm/enquiries',
    CRM_FOLLOWUPS: environment.apiUrl + '/api/admin/Crm/followups',
    CRM_DEMOCLASSES: environment.apiUrl + '/api/admin/Crm/democlasses',
    CRM_IMPORT: environment.apiUrl + '/api/admin/Crm/import',
    CRM_EXPORT: environment.apiUrl + '/api/admin/Crm/export',
    DASHBOARD_METRICS: environment.apiUrl + '/api/admin/Dashboard/metrics',
    GLOBAL_DASHBOARD_METRICS: environment.apiUrl + '/api/admin/Dashboard/global-metrics',
    FEES_PLANS: environment.apiUrl + '/api/admin/Fees/plans',
    NOTICES: environment.apiUrl + '/api/admin/Notices',
    STUDENTS: environment.apiUrl + '/api/admin/Students',
    STUDENTS_IMPORT: environment.apiUrl + '/api/admin/Students/import',
    STUDENTS_EXPORT: environment.apiUrl + '/api/admin/Students/export',
    SUBJECTS: environment.apiUrl + '/api/admin/Subjects',
    VACANCIES: environment.apiUrl + '/api/admin/Vacancies',
    STAFF: environment.apiUrl + '/api/staff',
    TEACHERS: environment.apiUrl + '/api/teachers'
  },
  TEACHER: {
    ATTENDANCE: environment.apiUrl + '/api/teacher/TeacherAttendance/sessions',
    NOTES: environment.apiUrl + '/api/teacher/notes',
    TESTS: environment.apiUrl + '/api/teacher/tests'
  },
  STUDENT: {
    DASHBOARD: environment.apiUrl + '/api/student/portal/dashboard',
    COURSES: environment.apiUrl + '/api/student/portal/courses',
    FEES: environment.apiUrl + '/api/student/portal/fees',
    NOTES: environment.apiUrl + '/api/student/portal/notes',
    ATTENDANCE: environment.apiUrl + '/api/student/portal/attendance',
    RESULTS: environment.apiUrl + '/api/student/portal/results',
    VACANCIES: environment.apiUrl + '/api/student/portal/vacancies',
    PORTAL: environment.apiUrl + '/api/student/portal'
  }
};
