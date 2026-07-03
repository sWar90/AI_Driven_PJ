import { HttpInterceptorFn } from '@angular/common/http';

export const httpErrorHandlerInterceptor: HttpInterceptorFn = (request, next) => {
  return next(request);
};
