import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

type UserRole = 'teacher' | 'student';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get required role from route data with type safety
  const requiredRole = route.data['role'] as UserRole;
  
  // Get current user role with type assertion
  const currentRole = authService.getRole() as UserRole | undefined;

  // Handle missing role data in route
  if (!requiredRole) {
    console.warn('Route is missing required role data');
    router.navigate(['/login']);
    return false;
  }

  // Handle unauthenticated users
  if (!currentRole) {
    router.navigate(['/login']);
    return false;
  }

  // Check authorization
  if (currentRole === requiredRole) {
    return true;
  }

  // Handle unauthorized access with role-specific redirection
  switch(currentRole) {
    case 'teacher':
      router.navigate(['/create']);
      break;
    case 'student':
      router.navigate(['/quiz']);
      break;
    default:
      console.warn(`Unknown user role: ${currentRole}`);
      router.navigate(['/login']);
  }

  return false;
};
