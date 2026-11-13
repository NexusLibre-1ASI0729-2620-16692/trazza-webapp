import { HttpInterceptorFn } from '@angular/common/http';

export const SESSION_TOKEN_KEY = 'trazza.session.token';

export const iamInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }
  
  return next(req);
};
