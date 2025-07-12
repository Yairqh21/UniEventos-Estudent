import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {

  // Inyecciones modernas
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);
  private authService = inject(AuthService);
  private utilsService = inject(UtilsService);

  title = 'Cambiar Contraseña';

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  ngOnInit(): void {}

  dismissModal(): void {
    this.modalController.dismiss();
  }

  async onRequestSubmit(): Promise<void> {
    if (this.form.invalid) {
      const alert = await this.alertController.create({
        header: 'Correo inválido',
        message: 'Por favor, introduce un correo electrónico válido.',
        buttons: ['Intentar de nuevo']
      });
      return alert.present();
    }

    const email = this.form.value.email!;
    const loading = await this.utilsService.presentLoading('Enviando correo...');

    try {
      await this.authService.sendRecoveryEmail(email);
      await this.utilsService.toast('Revise su correo electrónico', 'bottom', 3000, 'success');
      this.form.reset();
      this.dismissModal();
    } catch (error) {
      console.error(error);
      await this.utilsService.toast('Error al enviar el correo', 'bottom', 3000, 'danger');
    } finally {
      loading?.dismiss();
    }
  }
}
