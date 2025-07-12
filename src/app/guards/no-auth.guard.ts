import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStatus } from '../models/auth-status.enum';

export const noAuthGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  while (authService.authStatus() === AuthStatus.CHECKING) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  if (authService.authStatus() === AuthStatus.UNAUTHENTICATED) {
    return true;
  }

  router.navigate(['/main/home']);
  return false;
};

