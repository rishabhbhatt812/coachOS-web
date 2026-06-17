import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse) {
        const body = event.body as any;
        if (body && typeof body === 'object' && 'success' in body) {
          const data = body.data;
          // If it's a PagedResult (has a data field that is an array)
          if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
            return event.clone({ body: data.data });
          }
          return event.clone({ body: data });
        }
      }
      return event;
    })
  );
};
