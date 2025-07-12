import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor(
    private authService: AuthService,
    private utilsService: UtilsService,
    private router: Router,
  ) { }


  async login() {
    if (this.form.valid) {

      let loading: HTMLIonLoadingElement | null = null;

      loading = await this.utilsService.presentLoading('Iniciando sesión...');

      this.authService.login(this.form.value as User).then(() => {
        this.router.navigate(['/main/home']);
      }).catch(error => {
        this.utilsService.toast(error.message, 'bottom', 2000, 'danger');
      }).finally(() => {
        loading.dismiss();
      })
    }
  }

  ngOnInit() {
    //console.log('AuthPage initialized');
  }
}
