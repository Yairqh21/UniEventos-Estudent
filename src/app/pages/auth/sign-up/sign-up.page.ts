import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/models/user.model';
import { role } from 'src/app/models/role.enum';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage {


  form = new FormGroup({
    id: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    role: new FormControl(role.STUDENT),
  });

  authService = inject(AuthService);
  utilService = inject(UtilsService);
  router = inject(Router);
  fbService = inject(FirebaseService);


  async registerUser() {
    if (!this.form.valid) {
      return this.utilService.toast('Campos incorrectos', 'top', 2000, 'warning');
    }

    const loading = await this.utilService.presentLoading('Cargando...');

    this.authService.registerUser(this.form.value as User).subscribe({
      next: () => {
        this.utilService.toast('Registro exitoso', 'bottom', 2000, 'success');
        this.router.navigate(['/main/home']);
      },
      error: (e) => this.utilService.toast(e.message, 'bottom', 2000, 'danger'),
      complete: () => {
        this.utilService.dismissLoading(loading);
      }
    });
  }


}

