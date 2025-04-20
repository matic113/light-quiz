import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'];
  const userRole = authService.getRole();

  // Check if role exists
  if (!userRole) {
    router.navigate(['/login']);
    return false;
  }

  if (userRole === expectedRole) {
    return true;
  }

  // Redirect based on actual user role
  if (userRole === 'teacher') {
    router.navigate(['/create']);  // Redirect teachers to create exam page
  } else if (userRole === 'student') {
    router.navigate(['/quiz']);    // Redirect students to quiz page
  } else {
    router.navigate(['/login']);   // Redirect unknown roles to login
  }
  
  return false;
}
