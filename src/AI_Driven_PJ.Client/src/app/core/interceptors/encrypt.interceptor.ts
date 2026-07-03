import { HttpInterceptorFn } from '@angular/common/http';

export const encryptHttpRequestInterceptor: HttpInterceptorFn = (request, next) => {
  return next(request);
};
