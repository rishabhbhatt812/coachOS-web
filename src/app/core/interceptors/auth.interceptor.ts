import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    let headers = req.headers.set('Authorization', 'Bearer ' + token);
    const activeInstituteId = localStorage.getItem('active_institute_id');
    if (activeInstituteId) {
      headers = headers.set('X-Institute-Id', activeInstituteId);
    }
    const authReq = req.clone({ headers });
    return next(authReq);
  }
  
  return next(req);
};
