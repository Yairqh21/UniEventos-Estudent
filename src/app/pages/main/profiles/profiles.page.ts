import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Subscription, take } from 'rxjs';
import { ChangePasswordComponent } from 'src/app/shared/component/change-password/change-password.component';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.page.html',
  styleUrls: ['./profiles.page.scss'],
})
export class ProfilesPage implements OnInit, OnDestroy {
  private userSubscription?: Subscription;
  userInfo: User | null = null;
  isLoading = true;

  // Inyección de dependencias
  private router = inject(Router);
  private userService = inject(UserService);
  private utilsService = inject(UtilsService);
  private authService = inject(AuthService);

  async ngOnInit() {
    await this.loadUserData();
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  private async loadUserData(): Promise<void> {
    try {
      this.userInfo = await this.userService.getCurrentUser()
        .pipe(take(1))
        .toPromise();
    } catch (err) {
      console.error('Error loading user:', err);
      this.utilsService.toast('Error al cargar datos del usuario', 'top', 2000, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  updateUser(user: User) {
    this.router.navigate(['edit'], { state: { user } });
  }

  async changePassword() {
    const success = await this.utilsService.presentModal({
      component: ChangePasswordComponent
    });

    if (success) {
      this.utilsService.toast('Contraseña actualizada', 'top', 2000, 'success');
    }
  }

  async logout() {
    const confirmed = await this.utilsService.showConfirm(
      '¿Cerrar sesión?',
      '¿Estás seguro de que deseas salir?'
    );

    if (confirmed) {
      await this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }
}
