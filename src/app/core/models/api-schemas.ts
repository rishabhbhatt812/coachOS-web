// Auth Schemas
export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface RegisterInstituteRequest {
  instituteName?: string;
  ownerName?: string;
  email?: string;
  mobile?: string;
  password?: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  mobile?: string;
  password: string;
  roleCode: string;
}

// Student Schemas
export interface CreateStudentRequest {
  studentCode?: string;
  fullName?: string;
  mobile?: string;
  email?: string;
  dateOfBirth?: string; // Date ISO
  admissionDate: string; // Date ISO
}

export interface UpdateStudentRequest {
  fullName?: string;
  mobile?: string;
  email?: string;
  dateOfBirth?: string; // Date ISO
}

// Course & Subject Schemas
export interface CreateCourseRequest {
  name?: string;
  description?: string;
  courseCode?: string;
  courseCategory?: string;
  courseType?: string;
  durationValue?: number;
  durationType?: string;
  subjectNames?: string[];
}

export interface UpdateCourseRequest {
  name?: string;
  description?: string;
  courseCode?: string;
  courseCategory?: string;
  courseType?: string;
  durationValue?: number;
  durationType?: string;
  isActive: boolean;
  subjectNames?: string[];
}

export interface CreateSubjectRequest {
  name?: string;
  courseId: string; // UUID
}

export interface UpdateSubjectRequest {
  name?: string;
  courseId: string; // UUID
}

// Batch Schemas
export interface CreateBatchRequest {
  batchCode?: string;
  name?: string;
  courseId: string; // UUID
  branchId: string; // UUID
  subjectId?: string; // UUID
  subjectIds?: string[];
  teacherUserId?: string; // UUID
  defaultFee?: number;
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  roomNumber?: string;
  batchStatus?: string;
}

export interface UpdateBatchRequest {
  batchCode?: string;
  name?: string;
  courseId: string; // UUID
  branchId: string; // UUID
  subjectId?: string; // UUID
  subjectIds?: string[];
  teacherUserId?: string; // UUID
  defaultFee?: number;
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  roomNumber?: string;
  batchStatus?: string;
}

// Fee Plan Schemas
export interface CreateFeePlanRequest {
  studentId: string; // UUID
  courseId: string; // UUID
  batchId: string; // UUID
  totalFee: number;
  discountAmount: number;
  planType?: string;
}

// CRM Enquiries Schemas
export interface CreateEnquiryRequest {
  fullName?: string;
  mobile?: string;
  email?: string;
  previousSchoolOrCollege?: string;
  source?: string;
  interestedCourseId?: string; // UUID
  assignedToUserId?: string; // UUID
}

export interface UpdateEnquiryRequest {
  fullName?: string;
  mobile?: string;
  email?: string;
  previousSchoolOrCollege?: string;
  source?: string;
  status?: string;
  interestedCourseId?: string; // UUID
  assignedToUserId?: string; // UUID
}

// Notice & Vacancy Schemas
export interface CreateNoticeRequest {
  title?: string;
  message?: string;
  courseId?: string; // UUID
  batchId?: string; // UUID
}

export interface CreateVacancyRequest {
  title?: string;
  examCategory?: string;
  lastDate: string; // Date ISO
}

// Attendance Schemas
export interface CreateAttendanceSessionRequest {
  batchId?: string; // UUID
  attendanceDate?: string; // Date ISO
  takenByUserId?: string; // UUID
}

// Teacher Schemas
export interface CreateNoteRequest {
  title?: string;
  description?: string;
  filePath?: string;
  originalFileName?: string;
  storedFileName?: string;
  fileType?: string;
  courseId: string; // UUID
  batchId: string; // UUID
  subjectId: string; // UUID
  uploadedByUserId: string; // UUID
}

export interface CreateTestRequest {
  testName?: string;
  testDate: string; // Date ISO
  maxMarks: number;
  courseId: string; // UUID
  batchId: string; // UUID
  subjectId: string; // UUID
}
