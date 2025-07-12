import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(
    private utilsService: UtilsService,
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit() {
  }

  async onRequestSubmit() {
    if (!this.form.valid) {
      return this.utilsService
        .toast('Por favor, ingrese un correo válido.', 'top', 2000, 'warning');
    }

    const loading = await this.utilsService
      .presentLoading('Verificando correo...');
    try {
      await this.authService.sendRecoveryEmail(this.form.value.email!);
      this.utilsService.toast('Revise su correo electrónico.', 'bottom', 3000, 'success');
      this.router.navigate(['/login/auth']);
      this.form.reset();
    } catch (error: any) {
      this.utilsService.toast(error.message, 'bottom', 2000, 'danger');
    } finally {
      loading.dismiss();
    }
  }
}
