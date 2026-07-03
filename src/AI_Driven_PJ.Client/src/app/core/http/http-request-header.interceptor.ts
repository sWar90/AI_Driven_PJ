import { HttpInterceptorFn } from '@angular/common/http';

export const httpRequestHeaderInterceptor: HttpInterceptorFn = (request, next) => {
  return next(request);
};
