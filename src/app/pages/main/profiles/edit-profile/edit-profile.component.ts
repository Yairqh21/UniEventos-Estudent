import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, finalize, lastValueFrom, take } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription = new Subscription();
  private readonly router = inject(Router);
  private readonly utilsService = inject(UtilsService);
  private readonly userService = inject(UserService);

  selectedImage: string | null = null;
  isLoading = false;
  user: User | null = null;


  profileForm = new FormGroup({
    firstName: new FormControl<string>('', [Validators.required, Validators.maxLength(50)]),
    lastName: new FormControl<string>('', [Validators.required, Validators.maxLength(50)]),
    email: new FormControl<string>({ value: '', disabled: true }, [Validators.required, Validators.email]),
    phoneNumber: new FormControl<string>('', [
      Validators.required,
      Validators.pattern(/^[0-9]{9}$/),
      Validators.maxLength(9)
    ]),
    career: new FormControl<string>('', [Validators.required]),
    academicCycle: new FormControl<string>('', [Validators.required]),
  });

  ngOnInit(): void {
    this.subscriptions.add(
      this.userService.user$.pipe(take(1)).subscribe(user => {
        this.user = user;
        this.initializeForm();

        if (!user) {
          this.utilsService.toast('No se encontraron datos de usuario', 'top', 2000, 'warning');
          this.router.navigate(['profile']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeForm(): void {
    if (!this.user) return;

    this.profileForm.patchValue({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      phoneNumber: this.user.phoneNumber,
      career: this.user.career,
      academicCycle: this.user.academicCycle
    });

    // Asegúrate que la imagen tenga formato correcto
    if (this.user.imgUrl) {
      if (this.user.imgUrl.startsWith('http')) {
        this.selectedImage = this.user.imgUrl;
      } else if (this.user.imgUrl.startsWith('data:image')) {
        this.selectedImage = this.user.imgUrl;
      } else {
        // Si es un path relativo
        //this.selectedImage = `${this.userService.baseUrl}${this.user.imgUrl}`;
      }
    } else {
      this.selectedImage = null;
    }
  }

  handleImageError() {
    this.utilsService.toast('Error al cargar la imagen', 'top', 2000, 'danger');
    this.selectedImage = null;
  }

  async onUpdateProfileImage(): Promise<void> {
    try {
      const image = await this.utilsService.takePicture('Selecciona una imagen');
      if (image?.base64String) {
        this.selectedImage = `data:image/jpeg;base64,${image.base64String}`;
      }
    } catch (error) {
      this.handleError('Error al actualizar imagen', error);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid || !this.user) {
      this.markFormAsTouched();
      this.utilsService.toast('Por favor complete todos los campos requeridos', 'top', 2000, 'warning');
      return;
    }

    this.isLoading = true;
    const loading = await this.utilsService.presentLoading('Actualizando perfil...');

    try {
      const updatedUser = this.buildUpdatedUser();
      await this.updateUserProfile(updatedUser);
      this.navigateToProfileWithSuccess();
    } catch (error) {
      this.handleError('Error al actualizar el perfil', error);
    } finally {
      this.isLoading = false;
      await this.utilsService.dismissLoading(loading);
    }
  }

  private buildUpdatedUser(): User {
    if (!this.user) {
      throw new Error('User data is not available');
    }

    return {
      id: this.user.id,
      firstName: this.profileForm.value.firstName || this.user.firstName,
      lastName: this.profileForm.value.lastName || this.user.lastName,
      email: this.user.email, // Email should not be editable
      phoneNumber: this.profileForm.value.phoneNumber || this.user.phoneNumber,
      imgUrl: this.selectedImage || this.user.imgUrl,
      career: this.profileForm.value.career || this.user.career,
      academicCycle: this.profileForm.value.academicCycle || this.user.academicCycle
    } as User;
  }


  private async updateUserProfile(user: User): Promise<void> {
    await lastValueFrom(this.userService.updateUser(user).pipe(take(1)));
  }


  private navigateToProfileWithSuccess(): void {
    this.utilsService.toast('Perfil actualizado con éxito', 'top', 2000, 'success');
    this.router.navigate(['/main/profile']);
  }

  private markFormAsTouched(): void {
    Object.values(this.profileForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private handleError(message: string, error: any): void {
    this.utilsService.toast(message, 'top', 2000, 'danger');
    console.error(`${message}:`, error);
  }

  careerList = [
    { value: 'Administración de Empresas', label: 'Administración de Empresas' },
    { value: 'Arquitectura', label: 'Arquitectura' },
    { value: 'Comunicaciones', label: 'Comunicaciones' },
    { value: 'Contabilidad', label: 'Contabilidad' },
    { value: 'Derecho', label: 'Derecho' },
    { value: 'Diseño Gráfico', label: 'Diseño Gráfico' },
    { value: 'Economía', label: 'Economía' },
    { value: 'Enfermería', label: 'Enfermería' },
    { value: 'Ing. Civil', label: 'Ing. Civil' },
    { value: 'Ing. Eléctrica', label: 'Ing. Eléctrica' },
    { value: 'Ing. Industrial', label: 'Ing. Industrial' },
    { value: 'Ing. de sistemas', label: 'Ing. de sistemas' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Medicina', label: 'Medicina' },
    { value: 'Psicología', label: 'Psicología' }
  ];

  academicCycleList = [
    { value: 'I', label: 'I' },
    { value: 'II', label: 'II' },
    { value: 'III', label: 'III' },
    { value: 'IV', label: 'IV' },
    { value: 'V', label: 'V' },
    { value: 'VI', label: 'VI' },
    { value: 'VII', label: 'VII' },
    { value: 'VIII', label: 'VIII' },
    { value: 'IX', label: 'IX' },
    { value: 'X', label: 'X' }
  ];

}
