import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Clear token and redirect to login on 401 errors
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
